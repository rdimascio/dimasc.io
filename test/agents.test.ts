import { beforeAll, describe, expect, it } from "bun:test";

import { createApp } from "@lesto/kernel";
import type { App } from "@lesto/kernel";

import appConfig from "../lesto.app";
import worker from "../worker";
import {
  AGENTS_FORM_ANCHOR,
  AGENTS_FORM_HREF,
  AGENTS_FORM_SOURCE,
  AGENTS_KIT_ROUTE,
  AGENTS_ROUTE,
  AGENTS_SENT_ROUTE,
  AGENTS_TEARDOWN_ROUTE,
  KIT_REPO_URL,
  TEARDOWN_CTA,
} from "../src/agents";
import { CHECK_FIELD, CHECK_ROUTE, CHECK_SENT_ROUTE, checkEmail, REPO_CHECK_NAME, sentRouteFor, TURNSTILE_SCRIPT_SRC } from "../src/check";
import { type EventPoint, type EventSink, SITE_EVENT } from "../src/measure";
import { AGENTS_OG_IMAGE, AGENTS_OG_IMAGE_MAX_BYTES, OG_IMAGES, SITE_URL, STUDIO_OG_IMAGE } from "../src/site";
import { NOINDEX_ROUTES, sitemapRoutes } from "../src/sitemap";
import { loadAllArticles, loadAllCaseStudies } from "../src/content";
import {
  AGENTS_EYEBROW,
  AGENTS_HEADLINE,
  AGENTS_LEDE,
  AGENTS_SENT_HEADLINE,
  CHECK_LINE,
  KIT_LINE,
  NOT_COVERED,
  PLAN_CAPACITY,
  PLAN_INCLUDES,
  PLAN_NAME,
  PLAN_PRICE,
  REPO_CHECK_APP_LABEL,
  REPO_CHECK_MESSAGE_LABEL,
} from "../src/ui/agents";

const PAGE_COPY = [AGENTS_EYEBROW, AGENTS_HEADLINE, AGENTS_LEDE, CHECK_LINE, PLAN_NAME, PLAN_PRICE, PLAN_CAPACITY, ...PLAN_INCLUDES, NOT_COVERED, KIT_LINE];

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
  it("renders the offer, the plan, one repo check button and the kit link", async () => {
    const html = await page(AGENTS_ROUTE);
    for (const copy of PAGE_COPY) expect(html).toContain(copy);
    expect(html.split(TEARDOWN_CTA)).toHaveLength(2);
    expect(html.split(`href="${AGENTS_TEARDOWN_ROUTE}"`)).toHaveLength(2);
    expect(html).toContain(`href="${AGENTS_KIT_ROUTE}"`);
  });

  it("shows only the subscription price, w/o the small-business offer or client logos", async () => {
    const full = (await page(AGENTS_ROUTE)).toLowerCase();
    const html = full.slice(full.indexOf("<body"));
    for (const banned of ["$750", "$3,000", "$900", "/#pricing", "15-min", "small business", "logo"]) expect(html).not.toContain(banned);
    expect(html).toContain("$4,995/month");
  });

  it("keeps the copy free of the banned ai tells", async () => {
    const copy = PAGE_COPY.join(" ");
    for (const tell of AI_TELLS) expect(copy).not.toMatch(tell);
  });

  it("is in the sitemap but not linked from the home page", async () => {
    expect(sitemapRoutes(await loadAllCaseStudies(), await loadAllArticles())).toContain(AGENTS_ROUTE);
    expect(await page("/")).not.toContain(`href="${AGENTS_ROUTE}"`);
  });

  it("renders the repo check form posting to the site check endpoint, w/ its source and the Turnstile widget", async () => {
    const html = await page(AGENTS_ROUTE);
    expect(html).toContain(`id="${AGENTS_FORM_ANCHOR}"`);
    expect(html).toContain(`action="${CHECK_ROUTE}"`);
    expect(html).toMatch(new RegExp(`<input(?=[^>]*name="${CHECK_FIELD.source}")(?=[^>]*value="${AGENTS_FORM_SOURCE}")[^>]*>`));
    for (const label of [REPO_CHECK_APP_LABEL, REPO_CHECK_MESSAGE_LABEL]) expect(html).toContain(label);
    expect(html).toContain(TURNSTILE_SCRIPT_SRC);
    expect(html).not.toContain("subject=free%20repo%20check");
  });

  it("sends agents form posts to their own sent page and labels the email as a repo check", () => {
    expect(sentRouteFor(AGENTS_ROUTE)).toBe(AGENTS_SENT_ROUTE);
    expect(sentRouteFor("/services/fix-my-website")).toBe(CHECK_SENT_ROUTE);
    expect(NOINDEX_ROUTES).toContain(AGENTS_SENT_ROUTE);
    const record = { id: "x", receivedAt: "2026-11-26T00:00:00Z", name: "Sam", email: "s@x.co", website: "", message: "m", source: "", page: AGENTS_ROUTE, gclid: "", gbraid: "", wbraid: "", clickedAt: "" };
    expect(checkEmail(record).subject).toBe(`${REPO_CHECK_NAME}: Sam`);
  });

  it("renders the agents sent page", async () => {
    expect(await page(AGENTS_SENT_ROUTE)).toContain(AGENTS_SENT_HEADLINE);
  });

  it("shares its own large social card, w/o the small-business one", async () => {
    const full = await page(AGENTS_ROUTE);
    const head = full.slice(0, full.indexOf("</head>"));
    const imageUrl = `${SITE_URL}${AGENTS_OG_IMAGE.path}`;
    expect(head).toContain(`<meta property="og:image" content="${imageUrl}"`);
    expect(head).toContain(`<meta name="twitter:image" content="${imageUrl}"`);
    expect(head).toContain(`<meta property="og:image:width" content="${AGENTS_OG_IMAGE.width}"`);
    expect(head).toContain(`<meta property="og:image:height" content="${AGENTS_OG_IMAGE.height}"`);
    expect(head).toContain(`<meta property="og:image:type" content="image/png"`);
    expect(head).toContain(`<meta property="og:image:alt" content="${AGENTS_OG_IMAGE.alt}"`);
    expect(head).toContain(`<meta name="twitter:image:alt" content="${AGENTS_OG_IMAGE.alt}"`);
    expect(head).toContain(`<meta name="twitter:card" content="summary_large_image"`);
    expect(head).not.toContain(`${SITE_URL}${STUDIO_OG_IMAGE.path}"`);
    expect(head.toLowerCase()).not.toContain("small business");
  });

  it("ships the agents social card as a 2x png at its declared size, under 1 MB", async () => {
    expect([AGENTS_OG_IMAGE.width, AGENTS_OG_IMAGE.height]).toEqual([2400, 1254]);
    const file = Bun.file(AGENTS_OG_IMAGE.source);
    expect(file.size).toBeLessThan(AGENTS_OG_IMAGE_MAX_BYTES);
    const png = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(png.buffer);
    expect([...png.slice(1, 4)].map((byte) => String.fromCharCode(byte)).join("")).toBe("PNG");
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([AGENTS_OG_IMAGE.width, AGENTS_OG_IMAGE.height]);
    expect(OG_IMAGES).toContain(AGENTS_OG_IMAGE);
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

  it("redirects the repo check click to the form on the page and writes teardown_click", async () => {
    const sink = recordingSink();
    const response = await click(AGENTS_TEARDOWN_ROUTE, sink);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(AGENTS_FORM_HREF);
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
