import { beforeAll, describe, expect, it } from "bun:test";

import { createApp } from "@lesto/kernel";
import type { App } from "@lesto/kernel";

import appConfig from "../lesto.app";
import worker from "../worker";
import { AGENTS_KIT_ROUTE, AGENTS_ROUTE, AGENTS_TEARDOWN_ROUTE, KIT_REPO_URL, TEARDOWN_CTA } from "../src/agents";
import { type EventPoint, type EventSink, SITE_EVENT } from "../src/measure";
import { CONTACT_EMAIL, SITE_URL, TEARDOWN_BOOKING_URL, teardownHref } from "../src/site";
import { sitemapRoutes } from "../src/sitemap";
import { loadAllArticles, loadAllCaseStudies } from "../src/content";
import { AGENTS_HEADLINE, AGENTS_LEDE, KIT_HOOKS, KIT_LINE } from "../src/ui/agents";

let app: App;

beforeAll(async () => {
  app = await createApp({ ...appConfig, secure: false });
});

async function page(route: string): Promise<string> {
  const response = await app.handle("GET", route);
  return (await new Response(response.body as BodyInit).text()).replaceAll("&#x27;", "'").replaceAll("&amp;", "&");
}

function recordingSink(): EventSink & { points: EventPoint[] } {
  const points: EventPoint[] = [];
  return { points, writeDataPoint: (point) => points.push(point) };
}

const ctx = { waitUntil: () => undefined, passThroughOnException: () => undefined };

function click(route: string, events: EventSink, headers: Record<string, string> = {}): Promise<Response> {
  const request = new Request(`${SITE_URL}${route}`, { headers });
  return worker.fetch(request, { REQUESTS: { put: async () => undefined }, EVENTS: events } as never, ctx as never);
}

const AI_TELLS = [/—/, /→/, /#\w/, /\bnot [^.]+, (?:it's|but)\b/i, /\b(?:game changer|deep dive|hot take|let that sink in)\b/i];

describe("agents page", () => {
  it("renders the hero, the kit, the 3 hooks and one teardown button", async () => {
    const html = await page(AGENTS_ROUTE);
    for (const copy of [AGENTS_HEADLINE, AGENTS_LEDE, KIT_LINE, ...KIT_HOOKS.flatMap((hook) => [hook.name, hook.line])]) {
      expect(html).toContain(copy);
    }
    expect(html.split(TEARDOWN_CTA)).toHaveLength(2);
    expect(html.split(`href="${AGENTS_TEARDOWN_ROUTE}"`)).toHaveLength(2);
    expect(html).toContain(`href="${AGENTS_KIT_ROUTE}"`);
  });

  it("shows no prices, no small-business offer and no client logos", async () => {
    const full = (await page(AGENTS_ROUTE)).toLowerCase();
    const html = full.slice(full.indexOf("<body"));
    for (const banned of ["$", "/#pricing", "prices", "15-min", "small business", "logo"]) expect(html).not.toContain(banned);
  });

  it("keeps the copy free of the banned ai tells", async () => {
    const copy = [AGENTS_HEADLINE, AGENTS_LEDE, KIT_LINE, ...KIT_HOOKS.map((hook) => hook.line)].join(" ");
    for (const tell of AI_TELLS) expect(copy).not.toMatch(tell);
  });

  it("is in the sitemap but not linked from the home page", async () => {
    expect(sitemapRoutes(await loadAllCaseStudies(), await loadAllArticles())).toContain(AGENTS_ROUTE);
    expect(await page("/")).not.toContain(`href="${AGENTS_ROUTE}"`);
  });

  it("falls back to an email when no booking url is set", () => {
    expect(teardownHref(null)).toStartWith(`mailto:${CONTACT_EMAIL}?subject=`);
    expect(teardownHref("https://example.com/book")).toBe("https://example.com/book");
    expect(teardownHref()).toBe(TEARDOWN_BOOKING_URL ?? teardownHref(null));
  });

  it("shares w/o the small-business social card", async () => {
    const head = (await page(AGENTS_ROUTE)).toLowerCase();
    expect(head).not.toContain("small business");
    expect(head).not.toContain("og:image");
  });
});

describe("agents click routes", () => {
  it("redirects the kit click to the repo and writes kit_click w/ the landing utm tags", async () => {
    const sink = recordingSink();
    const response = await click(AGENTS_KIT_ROUTE, sink, { referer: `${SITE_URL}${AGENTS_ROUTE}?utm_source=linkedin&utm_medium=social` });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(KIT_REPO_URL);
    expect(sink.points).toHaveLength(1);
    expect(sink.points[0]?.blobs.slice(0, 5)).toEqual([SITE_EVENT.kitClick, AGENTS_KIT_ROUTE, "self", "linkedin", "social"]);
  });

  it("redirects the teardown click to the booking link and writes teardown_click", async () => {
    const sink = recordingSink();
    const response = await click(AGENTS_TEARDOWN_ROUTE, sink);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(teardownHref());
    expect(sink.points.map((point) => point.indexes[0])).toEqual([SITE_EVENT.teardownClick]);
  });

  it("skips the event for a HEAD link check and still redirects", async () => {
    const sink = recordingSink();
    const request = new Request(`${SITE_URL}${AGENTS_KIT_ROUTE}`, { method: "HEAD", headers: { "user-agent": "curl/8.7.1" } });
    const response = await worker.fetch(request, { REQUESTS: { put: async () => undefined }, EVENTS: sink } as never, ctx as never);
    expect(response.status).toBe(302);
    expect(sink.points).toHaveLength(0);
  });

  it("skips the event for bots and still redirects", async () => {
    const sink = recordingSink();
    const response = await click(AGENTS_KIT_ROUTE, sink, { "user-agent": "LinkedInBot/1.0" });
    expect(response.status).toBe(302);
    expect(sink.points).toHaveLength(0);
  });
});
