import { beforeAll, describe, expect, it } from "bun:test";

import { createApp } from "@lesto/kernel";
import type { App } from "@lesto/kernel";

import appConfig from "../lesto.app";
import { loadCaseStudies, loadFaq, loadPlans, loadProcess } from "../src/content";
import { formatPrice } from "../src/ui/home";
import { PERSONAL_PAGES, personalPageHtml } from "../src/personal";

async function text(response: { body: unknown }): Promise<string> {
  return new Response(response.body as BodyInit).text();
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

  it("links every call to action to a mail draft with a subject", async () => {
    const html = await text(await app.handle("GET", "/"));
    expect(html).toContain("mailto:ryan@dimasc.io?subject=Intro%20call");
    expect(html).toContain("mailto:ryan@dimasc.io?subject=Pro%20plan");
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

  it("renders the work index and every published case study", async () => {
    const index = await app.handle("GET", "/work");
    expect(index.status).toBe(200);

    for (const study of await loadCaseStudies()) {
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
    for (const route of ["/", "/work", "/process"]) {
      expect(await text(await app.handle("GET", route))).not.toContain("<script");
    }
  });

  it("returns 404 for an unknown path", async () => {
    expect((await app.handle("GET", "/does/not/exist")).status).toBe(404);
  });
});
