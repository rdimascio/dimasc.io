import { beforeAll, describe, expect, it } from "bun:test";

import { createApp } from "@lesto/kernel";
import type { App } from "@lesto/kernel";

import appConfig from "../lesto.app";
import { loadCaseStudies, loadProcess } from "../src/content";

async function text(response: { body: unknown }): Promise<string> {
  return new Response(response.body as BodyInit).text();
}

let app: App;

beforeAll(async () => {
  app = await createApp(appConfig);
});

describe("site routes", () => {
  it("renders the home page with the contact link and the process steps", async () => {
    const html = await text(await app.handle("GET", "/"));
    const steps = await loadProcess();

    expect(html).toContain("Start a project");
    expect(html).toContain("mailto:");
    for (const step of steps) expect(html).toContain(step.title);
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

  it("returns 404 for an unknown path", async () => {
    expect((await app.handle("GET", "/does/not/exist")).status).toBe(404);
  });
});
