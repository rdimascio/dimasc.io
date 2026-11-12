import { beforeAll, describe, expect, it } from "bun:test";

import { createApp } from "@lesto/kernel";
import type { App } from "@lesto/kernel";

import appConfig from "../lesto.app";
import { buildAppConfig } from "../src/app";
import {
  loadAllCaseStudies,
  loadCaseStudies,
  loadExperience,
  loadFaq,
  loadPlans,
  loadProcess,
  OPEN_QUESTION_MARKER,
} from "../src/content";
import { ABOUT_ROUTE, BOOKING_URL, CONTACT_EMAIL, introCallHref, introCallLabel } from "../src/site";
import { formatPrice, REFUND_RULE } from "../src/ui/home";
import { SKILLS } from "../src/ui/experience";
import { REQUEST_LINE } from "../src/ui/work";
import { PERSONAL_PAGES, personalPageHtml } from "../src/personal";
import {
  DEMO_SOURCE_DIR,
  demoSrc,
  projectName,
  requestAnchor,
  requestMailto,
  SCREENSHOT_SOURCE_DIR,
  screenshotSrc,
  WORK_REQUEST_ROUTE,
  WORK_ROUTE,
  workRoutes,
} from "../src/work";

const CASE_STUDY_SLUGS = ["stanford-ecorner", "blackstone", "holt-international", "yext-ai-search", "serhant", "r-selectric"];
const MAX_SCREENSHOT_BYTES = 300 * 1024;
const PHONE_NUMBER = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
const MAX_CLIP_BYTES = 4 * 1024 * 1024;
const MAX_WORKER_ASSET_BYTES = 25 * 1024 * 1024;

async function text(response: { body: unknown }): Promise<string> {
  return new Response(response.body as BodyInit).text();
}

function decodeEntities(html: string): string {
  return html.replaceAll("&#x27;", "'").replaceAll("&amp;", "&");
}

function luxuryPresenceRoles(experience: Awaited<ReturnType<typeof loadExperience>>): readonly unknown[] {
  return experience.find((item) => item.company === "Luxury Presence")?.roles ?? [];
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

  it("shows Work in the nav whenever a case study card exists", async () => {
    const studies = await loadAllCaseStudies();
    const home = await text(await app.handle("GET", "/"));

    expect((await app.handle("GET", WORK_ROUTE)).status).toBe(studies.length > 0 ? 200 : 404);
    expect(home.includes(`href="${WORK_ROUTE}"`)).toBe(studies.length > 0);
  });

  it("lists every case study on the home page as a card that links to the request page", async () => {
    const studies = await loadAllCaseStudies();
    const home = decodeEntities(await text(await app.handle("GET", "/")));

    expect(studies.map((study) => study.slug).toSorted()).toEqual(CASE_STUDY_SLUGS.toSorted());
    expect(home).toContain("Selected work");
    expect(home).toContain(REQUEST_LINE);
    for (const study of studies) {
      expect(home).toContain(projectName(study));
      expect(home).toContain(`href="${requestAnchor(study)}"`);
      expect(home).toContain(`src="${screenshotSrc(study, "desktop")}"`);
      expect(home).not.toContain(`href="${study.route}"`);
    }
  });

  it("offers a prefilled email for each case study on the request page", async () => {
    const response = await app.handle("GET", WORK_REQUEST_ROUTE);
    const html = decodeEntities(await text(response));

    expect(response.status).toBe(200);
    expect(html).toContain(REQUEST_LINE);
    for (const study of await loadAllCaseStudies()) {
      expect(html).toContain(`id="${study.slug}"`);
      expect(html).toContain(requestMailto(study));
      expect(requestMailto(study)).toStartWith(`mailto:${CONTACT_EMAIL}?subject=`);
      expect(decodeURIComponent(requestMailto(study))).toContain(projectName(study));
    }
  });

  it("keeps full case studies off the public site", async () => {
    for (const study of await loadAllCaseStudies()) {
      expect((await app.handle("GET", study.route)).status).toBe(404);
    }
    expect((await app.handle("GET", "/work/_template")).status).toBe(404);
    expect(workRoutes(await loadAllCaseStudies(), false)).toEqual([WORK_ROUTE, WORK_REQUEST_ROUTE]);
  });

  it("renders every full case study in preview, marked noindex", async () => {
    const preview = await createApp(await buildAppConfig({ previewCaseStudies: true }));
    for (const study of await loadAllCaseStudies()) {
      const response = await preview.handle("GET", study.route);
      const html = decodeEntities(await text(response));
      expect(response.status).toBe(200);
      expect(html).toContain(study.title);
      expect(html).toContain(screenshotSrc(study, "mobile"));
      expect(html).toContain('content="noindex"');
    }
    expect((await preview.handle("GET", "/work/_template")).status).toBe(404);
  });

  it("ships a screenshot pair for every case study", async () => {
    for (const study of await loadAllCaseStudies()) {
      for (const view of ["desktop", "mobile"] as const) {
        const file = Bun.file(`${SCREENSHOT_SOURCE_DIR}/${study.slug}-${view}.webp`);
        expect(await file.exists()).toBe(true);
        expect(file.size).toBeLessThan(MAX_SCREENSHOT_BYTES);
      }
    }
  });

  it("shows the work history on the home and about pages, with the demos under Luxury Presence", async () => {
    const experience = await loadExperience();
    expect(experience.map((item) => item.company)).toEqual(["Every", "Luxury Presence", "10up", "Channel Bakers", "Lender Homepage"]);
    expect(luxuryPresenceRoles(experience)).toHaveLength(4);
    const luxuryPresence = experience.find((item) => item.company === "Luxury Presence");
    expect(luxuryPresence?.demos.map((demo) => demo.slug)).toEqual(["natural-language-search", "local-dev-app"]);

    for (const route of ["/", ABOUT_ROUTE]) {
      const response = await app.handle("GET", route);
      const html = decodeEntities(await text(response));
      expect(response.status).toBe(200);
      for (const item of experience) expect(html).toContain(item.company);
      for (const demo of luxuryPresence?.demos ?? []) {
        expect(html).toContain(`src="${demoSrc(demo.clip)}"`);
        expect(html).toContain(`poster="${demoSrc(demo.poster)}"`);
      }
    }
    expect(await text(await app.handle("GET", "/"))).toContain(`href="${ABOUT_ROUTE}"`);
  });

  it("ships every demo file at web size", async () => {
    for (const item of await loadExperience()) {
      for (const demo of item.demos) {
        const files = [
          [demo.clip, MAX_CLIP_BYTES],
          [demo.poster, MAX_SCREENSHOT_BYTES],
          ...(demo.full === undefined ? [] : [[demo.full, MAX_WORKER_ASSET_BYTES] as const]),
        ] as const;
        for (const [name, limit] of files) {
          const file = Bun.file(`${DEMO_SOURCE_DIR}/${name}`);
          expect(await file.exists()).toBe(true);
          expect(file.size).toBeLessThan(limit);
        }
      }
    }
  });

  it("never shows an open question or a phone number on a public page", async () => {
    for (const route of ["/", ABOUT_ROUTE, "/process", WORK_ROUTE, WORK_REQUEST_ROUTE]) {
      const html = await text(await app.handle("GET", route));
      expect(html).not.toContain("TODO");
      expect(html).not.toMatch(PHONE_NUMBER);
    }
  });

  it("lists the resume skills on the about page", async () => {
    const html = decodeEntities(await text(await app.handle("GET", ABOUT_ROUTE)));
    for (const skill of SKILLS) {
      expect(html).toContain(skill.group);
      for (const item of skill.items) expect(html).toContain(item);
    }
  });

  it("keeps open questions out of published case studies", async () => {
    for (const study of await loadCaseStudies()) {
      expect(study.html).not.toContain(OPEN_QUESTION_MARKER);
    }
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
    for (const route of ["/", ABOUT_ROUTE, "/process"]) {
      expect(await text(await app.handle("GET", route))).not.toContain("<script");
    }
  });

  it("returns 404 for an unknown path", async () => {
    expect((await app.handle("GET", "/does/not/exist")).status).toBe(404);
  });
});
