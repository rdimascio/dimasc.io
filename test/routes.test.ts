import { beforeAll, describe, expect, it } from "bun:test";

import { createApp } from "@lesto/kernel";
import type { App } from "@lesto/kernel";

import appConfig from "../lesto.app";
import { loadCaseStudies, loadFaq, loadPlans, loadProcess } from "../src/content";
import { BOOKING_URL, introCallHref, introCallLabel } from "../src/site";
import { formatPrice, REFUND_RULE } from "../src/ui/home";
import { PERSONAL_PAGES, personalPageHtml } from "../src/personal";

async function text(response: { body: unknown }): Promise<string> {
  return new Response(response.body as BodyInit).text();
}

function decodeEntities(html: string): string {
  return html.replaceAll("&#x27;", "'").replaceAll("&amp;", "&");
}

let app: App;

beforeAll(async () => {
  app = await createApp(appConfig);
});

describe("site routes", () => {
  it("renders every plan with its price, the trial offer and the FAQ", async () => {
    const html = await text(await app.handle("GET", "/"));
    const plans = await loadPlans();

    expect(plans.map((plan) => plan.price)).toEqual([2500, 5000, null]);
    for (const plan of plans) {
      expect(html).toContain(plan.name);
      if (plan.price !== null) expect(html).toContain(formatPrice(plan.price));
    }
    expect(html).toContain('id="pricing"');
    expect(html).toContain("75% back");
    const decoded = html.replaceAll("&#x27;", "'");
    for (const item of await loadFaq()) expect(decoded).toContain(item.question);
  });

  it("labels the call button honestly for where it leads", async () => {
    const html = decodeEntities(await text(await app.handle("GET", "/")));
    expect(html).toContain(introCallHref());
    expect(html).toContain(introCallLabel());
    if (BOOKING_URL === null) expect(html).not.toContain("Book a");
    expect(html).toContain("mailto:ryan@dimasc.io?subject=Pro%20plan");
  });

  it("makes no claim the review flagged as unprovable", async () => {
    const html = (await text(await app.handle("GET", "/"))).replaceAll("&#x27;", "'");
    for (const phrase of ["Most popular", "on call", "48-hour", "twice the pace", "independent reviewers"]) {
      expect(html.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });

  it("states one refund rule that covers delivered work", async () => {
    const html = (await text(await app.handle("GET", "/"))).replaceAll("&#x27;", "'");
    expect(html).toContain(REFUND_RULE);
    expect(html).not.toContain("no refunds for finished work");
  });

  it("offers the same capabilities on both subscription plans", async () => {
    const [standard, pro] = await loadPlans();
    expect(standard?.features).toContain("Everything on the What I build list");
    expect(pro?.features).toContain("Everything in Standard");
  });

  it("renders the process page with every step in order", async () => {
    const response = await app.handle("GET", "/process");
    const html = await text(response);
    const titles = (await loadProcess()).map((step) => step.title);

    expect(response.status).toBe(200);
    const positions = titles.map((title) => html.indexOf(title));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual(positions.toSorted((a, b) => a - b));
  });

  it("shows Work only when a case study is published", async () => {
    const studies = await loadCaseStudies();
    const home = await text(await app.handle("GET", "/"));
    const index = await app.handle("GET", "/work");

    expect(index.status).toBe(studies.length > 0 ? 200 : 404);
    expect(home.includes('href="/work"')).toBe(studies.length > 0);

    for (const study of studies) {
      const response = await app.handle("GET", study.route);
      expect(response.status).toBe(200);
      expect(await text(response)).toContain(study.title);
    }
  });

  it("never publishes a draft case study", async () => {
    const studies = await loadCaseStudies();
    expect(studies.some((study) => study.slug === "_template")).toBe(false);
    expect((await app.handle("GET", "/work/_template")).status).toBe(404);
  });

  it("sets canonical and social metadata", async () => {
    const html = await text(await app.handle("GET", "/"));
    expect(html).toContain('rel="canonical"');
    expect(html).toContain("https://dimasc.io/og.svg");
  });

  it("keeps the personal pages unlinked, out of search and off the studio pages", async () => {
    const home = await text(await app.handle("GET", "/"));
    for (const page of PERSONAL_PAGES) {
      const html = personalPageHtml(page);
      expect(html).toContain('content="noindex"');
      expect(html).toContain(`src="${page.script}"`);
      expect(home).not.toContain(`href="${page.route}"`);
      expect(home).not.toContain(page.script);
      expect((await app.handle("GET", page.route)).status).toBe(404);
    }
  });

  it("ships no client script on the studio pages", async () => {
    for (const route of ["/", "/process"]) {
      expect(await text(await app.handle("GET", route))).not.toContain("<script");
    }
  });

  it("returns 404 for an unknown path", async () => {
    expect((await app.handle("GET", "/does/not/exist")).status).toBe(404);
  });
});
