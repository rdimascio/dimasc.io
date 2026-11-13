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
  assertNoOpenQuestions,
  type CaseStudy,
} from "../src/content";
import {
  ABOUT_ROUTE,
  BOOKING_URL,
  CONTACT_EMAIL,
  fixRequestHref,
  planHref,
  introCallHref,
  introCallLabel,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_SOURCE,
  OG_IMAGE_WIDTH,
  SITE_URL,
} from "../src/site";
import { formatPrice, REFUND_RULE, SINCE_YEAR, STAFF_LINE } from "../src/ui/home";
import { BRAND_LOGOS, LOGO_SOURCE_DIR, logoSrc } from "../src/logos";
import { SKILLS } from "../src/ui/experience";
import { REQUEST_LINE } from "../src/ui/work";
import { outputPathFor, PERSONAL_PAGES, personalPageHtml } from "../src/personal";
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

const CASE_STUDY_SLUGS = ["stanford-ecorner", "blackstone", "holt-international", "serhant"];
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
  return experience.find((item) => item.company === "luxury presence")?.roles ?? [];
}

function caseStudyFixture(overrides: Pick<CaseStudy, "draft" | "html">): CaseStudy {
  return {
    route: "/work/fixture",
    slug: "fixture",
    title: "Fixture",
    summary: "Fixture",
    client: undefined,
    industry: "Test",
    year: 2026,
    services: [],
    stack: [],
    order: 1,
    ...overrides,
  };
}

let app: App;

beforeAll(async () => {
  app = await createApp(appConfig);
});

describe("site routes", () => {
  it("renders every plan with its price, the trial offer and the FAQ", async () => {
    const html = await text(await app.handle("GET", "/"));
    const plans = await loadPlans();

    expect(plans.map((plan) => plan.price)).toEqual([null, 2500, 5000]);
    for (const plan of plans) {
      expect(html).toContain(plan.name);
      if (plan.price !== null) expect(html).toContain(formatPrice(plan.price));
    }
    expect(html).toContain('id="pricing"');
    const decoded = html.replaceAll("&#x27;", "'");
    expect(decoded).toContain(REFUND_RULE);
    expect(decoded).toContain(STAFF_LINE);
    for (const item of await loadFaq()) expect(decoded).toContain(item.question);
  });

  it("labels the call button honestly for where it leads", async () => {
    const html = decodeEntities(await text(await app.handle("GET", "/")));
    expect(html).toContain(introCallHref());
    expect(html).toContain(introCallLabel());
    if (BOOKING_URL === null) expect(html.toLowerCase()).not.toContain("book a 15");
    for (const plan of (await loadPlans()).filter((candidate) => candidate.price !== null)) {
      expect(html).toContain(planHref(plan.name));
    }
    expect(html).toContain(fixRequestHref());
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

  it("offers the same help on both monthly plans and keeps every price claim", async () => {
    const [, monthly, double] = await loadPlans();
    expect(monthly?.features).toContain('anything on the "things i can help with" list');
    expect(double?.features).toContain("everything in monthly");
    for (const plan of [monthly, double]) {
      expect(plan?.features).toContain("most small jobs done in 2 business days");
      expect(plan?.features).toContain("i reply within 1 business day");
    }
  });

  it("renders the process page with every step in order", async () => {
    const response = await app.handle("GET", "/process");
    const html = decodeEntities(await text(response));
    const main = html.slice(html.indexOf("<ol", html.indexOf("<main")));
    const titles = (await loadProcess()).map((step) => step.title);

    expect(response.status).toBe(200);
    const positions = titles.map((title) => main.indexOf(title));
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
    expect(home).toContain("past work");
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
    const publicApp = await createApp(await buildAppConfig({ previewCaseStudies: false }));
    for (const study of await loadAllCaseStudies()) {
      expect((await publicApp.handle("GET", study.route)).status).toBe(404);
    }
    expect((await publicApp.handle("GET", "/work/_template")).status).toBe(404);
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

  it("shows the work history on the about page, with the demos under luxury presence", async () => {
    const experience = await loadExperience();
    expect(experience.map((item) => item.company)).toEqual(["every", "luxury presence", "10up", "channel bakers", "lender homepage"]);
    expect(luxuryPresenceRoles(experience)).toHaveLength(4);
    const luxuryPresence = experience.find((item) => item.company === "luxury presence");
    expect(luxuryPresence?.demos.map((demo) => demo.slug)).toEqual(["natural-language-search", "local-dev-app"]);

    const response = await app.handle("GET", ABOUT_ROUTE);
    const html = decodeEntities(await text(response));
    expect(response.status).toBe(200);
    for (const item of experience) expect(html).toContain(item.company);
    for (const demo of luxuryPresence?.demos ?? []) {
      expect(html).toContain(`src="${demoSrc(demo.clip)}"`);
      expect(html).toContain(`poster="${demoSrc(demo.poster)}"`);
    }
  });

  it("points the home page at the about page with the since line instead of the timeline", async () => {
    const home = decodeEntities(await text(await app.handle("GET", "/")));
    expect(home).toContain(`href="${ABOUT_ROUTE}"`);
    expect(home).toContain(`building websites since ${SINCE_YEAR}`);
    expect(home).not.toContain("<video");
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

  it("shows a labelled logo for every brand in the strip, at the SVG's own aspect ratio", async () => {
    const home = decodeEntities(await text(await app.handle("GET", "/")));
    for (const logo of BRAND_LOGOS) {
      expect(home).toContain(`aria-label="${logo.name}"`);
      expect(home).toContain(logoSrc(logo));
      const svg = await Bun.file(`${LOGO_SOURCE_DIR}/${logo.slug}.svg`).text();
      const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]?.split(/[\s,]+/).map(Number) ?? [];
      const [, , width = 0, height = 1] = viewBox;
      expect(Math.abs(width / height - logo.ratio)).toBeLessThan(0.01);
    }
  });

  it("draws the footer wordmark as a labelled pixel grid on every page", async () => {
    for (const route of ["/", ABOUT_ROUTE, "/process"]) {
      const html = await text(await app.handle("GET", route));
      expect(html).toMatch(/<svg aria-label="Ryan DiMascio" class="pixel-wordmark[^"]*" role="img" viewBox="0 0 \d+ 7"/);
      expect((html.match(/class="pixel( pixel-accent)?"/g) ?? []).length).toBeGreaterThan(80);
    }
  });

  it("names Stanford without the eCorner suffix on public pages", async () => {
    for (const route of ["/", ABOUT_ROUTE, WORK_ROUTE, WORK_REQUEST_ROUTE]) {
      expect(await text(await app.handle("GET", route))).not.toContain("Stanford eCorner");
    }
  });

  it("lists the resume skills on the about page", async () => {
    const html = decodeEntities(await text(await app.handle("GET", ABOUT_ROUTE)));
    for (const skill of SKILLS) {
      expect(html).toContain(skill.group);
      for (const item of skill.items) expect(html).toContain(item);
    }
  });

  it("rejects a published case study that still has an open question, and accepts a draft", () => {
    const question = `<p>${OPEN_QUESTION_MARKER}: What shipped?</p>`;
    expect(() => assertNoOpenQuestions(caseStudyFixture({ draft: false, html: question }))).toThrow(OPEN_QUESTION_MARKER);
    expect(assertNoOpenQuestions(caseStudyFixture({ draft: true, html: question })).draft).toBe(true);
    expect(assertNoOpenQuestions(caseStudyFixture({ draft: false, html: "<p>Done.</p>" })).draft).toBe(false);
  });

  it("keeps open questions out of published case studies", async () => {
    for (const study of await loadCaseStudies()) {
      expect(study.html).not.toContain(OPEN_QUESTION_MARKER);
    }
  });

  it("sets canonical and social metadata", async () => {
    const html = await text(await app.handle("GET", "/"));
    expect(html).toContain('rel="canonical"');
    expect(html).toContain(`content="${SITE_URL}${OG_IMAGE_PATH}"`);
    expect(html).toContain(`<meta property="og:image:width" content="${OG_IMAGE_WIDTH}"`);
    expect(html).toContain(`<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}"`);
    expect(decodeEntities(html)).toContain(`content="${OG_IMAGE_ALT}"`);
    expect(html).not.toContain("og.svg");
    const png = new Uint8Array(await Bun.file(OG_IMAGE_SOURCE).arrayBuffer());
    const view = new DataView(png.buffer);
    expect([...png.slice(1, 4)].map((byte) => String.fromCharCode(byte)).join("")).toBe("PNG");
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT]);
  });

  it("keeps the personal pages unlinked and out of search, served as standalone files", async () => {
    const home = await text(await app.handle("GET", "/"));
    for (const page of PERSONAL_PAGES) {
      const html = personalPageHtml(page);
      expect(html).toContain('content="noindex"');
      expect(html).toContain(`src="${page.script}"`);
      expect(home).not.toContain(`href="${page.route}"`);
      expect(home).not.toContain(page.script);
      expect(outputPathFor(page.route)).toBe(`${page.route.slice(1)}/index.html`);
    }
  });

  it("ships no client script on the studio pages", async () => {
    for (const route of ["/", ABOUT_ROUTE, "/process", WORK_ROUTE, WORK_REQUEST_ROUTE]) {
      expect(await text(await app.handle("GET", route))).not.toContain("<script");
    }
  });

  it("returns 404 for an unknown path", async () => {
    expect((await app.handle("GET", "/does/not/exist")).status).toBe(404);
  });
});
