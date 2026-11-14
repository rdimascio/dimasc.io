import { afterEach, beforeAll, beforeEach, describe, expect, it } from "bun:test";

import { createApp } from "@lesto/kernel";
import type { App } from "@lesto/kernel";

import appConfig from "../lesto.app";
import { buildAppConfig, HOME_TITLE, homeDescription, ORANGE_COUNTY_DESCRIPTION, ORANGE_COUNTY_TITLE, SERVICES_TITLE, serviceTitle } from "../src/app";
import { ORANGE_COUNTY_ROUTE, PLAN_SERVICE, serviceRoute, serviceRoutes, SERVICES, SERVICES_ROUTE } from "../src/services";
import { canonicalRedirect } from "../src/redirect";
import {
  CHECK_FIELD,
  CHECK_LIMIT,
  CHECK_ROUTE,
  CHECK_SENDER,
  CHECK_SENT_ROUTE,
  type CheckEmail,
  type CheckEnv,
  cleanClickedAt,
  cleanClickId,
  handleCheck,
  MAX_CHECK_BODY_BYTES,
  renderCheckProblem,
  TURNSTILE_ACTION,
  TURNSTILE_HOSTNAMES,
  TURNSTILE_RESPONSE_FIELD,
  TURNSTILE_SCRIPT_SRC,
  TURNSTILE_SITEKEY,
  TURNSTILE_VERIFY_URL,
  withFormFilled,
} from "../src/check";
import { PRIVACY_DESCRIPTION, PRIVACY_LEDE, PRIVACY_SECTIONS } from "../src/ui/privacy";
import { clickIdOf, conversionsCsv, CSV_HEADER, googleAdsTime, keysSince, parseArgs } from "../scripts/export-ad-leads.mjs";
import { CHECK_NEXT_STEPS, CHECK_SENT_HEADLINE } from "../src/ui/check";
import { MOVE_LABEL, PROJECT_PRICE_COPY, servicePriceLine, STAY_LABEL } from "../src/ui/service";
import { NOINDEX_ROUTES, PROCESS_ROUTE, siteRoutes, sitemapRoutes } from "../src/sitemap";
import { BUSINESS_ID, htmlToText, PERSON_ID } from "../src/structured-data";
import { JSON_LD_TYPE } from "../src/ui/json-ld";
import {
  ARTICLES_ROUTE,
  loadAllArticles,
  loadAllCaseStudies,
  loadArticles,
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
  QUICK_FIX_MINUTES,
  SETUP_FEE,
  SITE_CHECK_ANCHOR,
  SITE_CHECK_CTA,
  SITE_CHECK_PAGE,
  siteCheckHref,
  planHref,
  introCallHref,
  introCallLabel,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_SOURCE,
  OG_IMAGE_WIDTH,
  PRIVACY_ROUTE,
  SERVICE_AREA,
  SERVICE_AREA_COPY,
  SITE_NAME_PROPER,
  SITE_URL,
  WWW_HOST,
} from "../src/site";
import { formatPrice, HERO_LEAD, hireAnchorLine, REFUND_RULE, setupLine, SINCE_YEAR, STAFF_LINE, START_HERE_LABEL } from "../src/ui/home";
import { BRAND_LOGOS, LOGO_SOURCE_DIR, logoSrc } from "../src/logos";
import { articleRoutes, articlesFeed, FEED_ROUTE } from "../src/feed";
import { SIGNATURE } from "../src/signature";
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
const MAX_CLIP_BYTES = 4 * 1024 * 1024;const MAX_WORKER_ASSET_BYTES = 25 * 1024 * 1024;

async function text(response: { body: unknown }): Promise<string> {
  return new Response(response.body as BodyInit).text();
}

function decodeEntities(html: string): string {
  return html.replaceAll("&#x27;", "'").replaceAll("&amp;", "&");
}

const JSON_LD_BLOCK = new RegExp(`<script type="${RegExp.escape(JSON_LD_TYPE)}">([\\s\\S]*?)</script>`, "g");
const SERVICE_PAGE_ROUTES = SERVICES.map((service) => serviceRoute(service.slug));
const STUDIO_ROUTES = ["/", ABOUT_ROUTE, PROCESS_ROUTE, WORK_ROUTE, WORK_REQUEST_ROUTE, ...serviceRoutes(), PRIVACY_ROUTE, CHECK_SENT_ROUTE] as const;
const MAX_TITLE_LENGTH = 65;
const MAX_DESCRIPTION_LENGTH = 155;

type LdNode = Record<string, unknown>;

function jsonLdBlocks(html: string): string[] {
  return [...html.matchAll(JSON_LD_BLOCK)].map((match) => match[1] ?? "");
}

function withoutJsonLd(html: string): string {
  return html.replace(JSON_LD_BLOCK, "");
}

const TURNSTILE_SCRIPT_TAG = `<script async="" defer="" src="${TURNSTILE_SCRIPT_SRC}"></script>`;

function withoutAllowedScripts(route: string, html: string): string {
  const withoutData = withoutJsonLd(html);
  return route === SITE_CHECK_PAGE ? withoutData.replace(TURNSTILE_SCRIPT_TAG, "") : withoutData;
}

function ldNodes(html: string): LdNode[] {
  return jsonLdBlocks(html).flatMap((block) => {
    const parsed = JSON.parse(block) as { "@graph"?: LdNode[] };
    return parsed["@graph"] ?? [parsed as LdNode];
  });
}

function ldTypes(html: string): unknown[] {
  return ldNodes(html).map((node) => node["@type"]);
}

function ldNode(html: string, type: string): LdNode | undefined {
  return ldNodes(html).find((node) => node["@type"] === type);
}

function requestTo(url: string): Request {
  return new Request(url);
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

const RENDER_ONLY = { secure: false } as const;

beforeAll(async () => {
  app = await createApp({ ...appConfig, ...RENDER_ONLY });
});

describe("site routes", () => {
  it("renders every plan with its price, the trial offer and the FAQ", async () => {
    const html = await text(await app.handle("GET", "/"));
    const plans = await loadPlans();

    expect(plans.map((plan) => plan.name)).toEqual(["care", "monthly help", "one project"]);
    expect(plans.map((plan) => plan.price)).toEqual([199, 1500, null]);
    expect(plans.map((plan) => plan.setup)).toEqual([SETUP_FEE, SETUP_FEE, undefined]);
    expect(plans.map((plan) => plan.per)).toEqual(["month", "month", "month"]);
    expect(html).toContain("from $199/month");
    expect(html).toContain("care from $199/month");
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
    expect(html).toContain(siteCheckHref());
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

  it("keeps every claim on the care and monthly help plans and drops the old tiers", async () => {
    const plans = await loadPlans();
    const care = plans.find((plan) => plan.name === "care");
    const monthly = plans.find((plan) => plan.name === "monthly help");
    expect(care?.features).toEqual(
      expect.arrayContaining(["uptime + security monitoring", "up to 2 small fixes a month, done by me", "i reply within 1 business day", "cancel anytime"]),
    );
    expect(monthly?.features).toEqual(
      expect.arrayContaining([
        'anything on the "things i can help with" list',
        "most small jobs done in 2 business days",
        "i reply within 1 business day",
        "pause or cancel anytime",
      ]),
    );
    const html = decodeEntities(await text(await app.handle("GET", "/")));
    for (const gone of ["2,500", "5,000", "monthly, double", "two jobs"]) expect(html).not.toContain(gone);
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
    const publicApp = await createApp(await buildAppConfig({ previewDrafts: false }));
    for (const study of await loadAllCaseStudies()) {
      expect((await publicApp.handle("GET", study.route)).status).toBe(404);
    }
    expect((await publicApp.handle("GET", "/work/_template")).status).toBe(404);
    expect(workRoutes(await loadAllCaseStudies(), false)).toEqual([WORK_ROUTE, WORK_REQUEST_ROUTE]);
  });

  it("renders every full case study in preview, marked noindex", async () => {
    const preview = await createApp(await buildAppConfig({ previewDrafts: true }));
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

  it("puts the proof in the hero + the since line right under it, linked to the about page", async () => {
    const home = decodeEntities(await text(await app.handle("GET", "/")));
    expect(home).toContain(`href="${ABOUT_ROUTE}"`);
    expect(home).toContain(HERO_LEAD);
    expect(home).toContain("y combinator");
    const since = home.indexOf(`software engineer since ${SINCE_YEAR}`);
    expect(since).toBeGreaterThan(0);
    expect(since).toBeLessThan(home.indexOf("things i can help with"));
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
    for (const route of STUDIO_ROUTES) {
      const html = await text(await app.handle("GET", route));
      expect(html).not.toContain("TODO");
      expect(html).not.toMatch(PHONE_NUMBER);
    }
  });

  it("shows only logos of companies + clients the resume backs", async () => {
    const home = decodeEntities(await text(await app.handle("GET", "/")));
    for (const gone of ["microsoft", "starbucks"]) {
      expect(BRAND_LOGOS.map((logo) => logo.slug)).not.toContain(gone);
      expect(home.toLowerCase()).not.toContain(gone);
      expect(await Bun.file(`${LOGO_SOURCE_DIR}/${gone}.svg`).exists()).toBe(false);
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

  it("uses the signature as the site mark on every page", async () => {
    for (const route of ["/", ABOUT_ROUTE, "/process"]) {
      const html = await text(await app.handle("GET", route));
      const header = html.slice(html.indexOf("<header"), html.indexOf("</header>"));
      expect(header).toContain(`aria-label="${SITE_NAME_PROPER}"`);
      expect(header).toContain(`d="${SIGNATURE.d.slice(0, 40)}`);
    }
  });

  it("keeps draft articles and the articles section off the public site", async () => {
    const publicApp = await createApp(await buildAppConfig({ previewDrafts: false }));
    const published = await loadArticles(false);
    const home = await text(await publicApp.handle("GET", "/"));
    expect((await publicApp.handle("GET", ARTICLES_ROUTE)).status).toBe(published.length > 0 ? 200 : 404);
    expect(home.includes(`href="${ARTICLES_ROUTE}"`)).toBe(published.length > 0);
    for (const draft of (await loadAllArticles()).filter((article) => article.draft)) {
      expect((await publicApp.handle("GET", draft.route)).status).toBe(404);
    }
    expect((await loadAllArticles()).some((article) => article.slug.startsWith("_"))).toBe(false);
  });

  it("renders every article in preview, with the index, home section, nav link and noindex on drafts", async () => {
    const preview = await createApp(await buildAppConfig({ previewDrafts: true }));
    const articles = await loadArticles(true);
    expect(articles.length).toBeGreaterThan(0);
    const index = decodeEntities(await text(await preview.handle("GET", ARTICLES_ROUTE)));
    const home = decodeEntities(await text(await preview.handle("GET", "/")));
    expect(home).toContain(`href="${ARTICLES_ROUTE}"`);
    for (const article of articles) {
      const response = await preview.handle("GET", article.route);
      const html = decodeEntities(await text(response));
      expect(response.status).toBe(200);
      expect(html).toContain(article.title);
      expect(html).toContain(`<time dateTime="${article.published}">`);
      expect(html).toContain(`href="${FEED_ROUTE}"`);
      expect(html.includes('content="noindex"')).toBe(article.draft);
      expect(index).toContain(`href="${article.route}"`);
    }
  });

  it("builds a valid rss feed and route list from articles", () => {
    const article = {
      route: "/articles/fixture",
      slug: "fixture",
      title: "tips & tricks <for> \"owners\"",
      summary: "a summary",
      published: "2026-11-13",
      updated: undefined,
      tags: [],
      draft: false,
      minutes: 1,
      html: "<p>hi</p>",
    };
    const feed = articlesFeed([article]);
    expect(feed).toStartWith('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain("<title>tips &amp; tricks &lt;for&gt; &quot;owners&quot;</title>");
    expect(feed).toContain(`<link>${SITE_URL}/articles/fixture</link>`);
    expect(feed).toContain("<pubDate>Fri, 13 Nov 2026 00:00:00 GMT</pubDate>");
    expect(articleRoutes([article])).toEqual([ARTICLES_ROUTE, "/articles/fixture"]);
    expect(articleRoutes([])).toEqual([]);
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

  it("ships no client script on the studio pages, only JSON-LD data blocks + the form page's one Turnstile script", async () => {
    for (const route of STUDIO_ROUTES) {
      const html = await text(await app.handle("GET", route));
      expect(`${route}: ${withoutAllowedScripts(route, html)}`).not.toContain("<script");
      for (const block of jsonLdBlocks(html)) {
        expect(() => JSON.parse(block)).not.toThrow();
        expect(block).not.toContain("<");
      }
    }
  });

  it("starts w/ a free site check + shows the setup fee next to the monthly prices", async () => {
    const plans = await loadPlans();
    const html = decodeEntities(await text(await app.handle("GET", "/")));
    expect(html).toContain(SITE_CHECK_CTA);
    expect(html).toContain(START_HERE_LABEL);
    expect(html).toContain(`fixes under ${QUICK_FIX_MINUTES} min: free`);
    for (const plan of plans.filter((candidate) => candidate.setup !== undefined)) {
      expect(html).toContain(setupLine(plan.setup ?? 0));
    }
    expect(setupLine(SETUP_FEE)).toBe(`+ ${formatPrice(SETUP_FEE)} setup`);
    for (const gone of ["fix it", "you get your $500 back", "/fix</span>"]) expect(html).not.toContain(gone);
    const anchor = hireAnchorLine(plans);
    expect(anchor).not.toBeNull();
    expect(html).toContain(anchor ?? "");
    const faq = (await loadFaq()).find((item) => item.question.includes(formatPrice(SETUP_FEE)));
    expect(faq).toBeDefined();
    expect(htmlToText(faq?.html ?? "")).toContain("backups");
  });

  it("names the service area in the title, description, hero, footer and FAQ", async () => {
    const plans = await loadPlans();
    const html = decodeEntities(await text(await app.handle("GET", "/")));
    expect(HOME_TITLE.length).toBeLessThanOrEqual(60);
    expect(HOME_TITLE).toContain("orange county");
    expect(html).toContain(`<title>${HOME_TITLE}</title>`);
    expect(homeDescription(plans).length).toBeLessThanOrEqual(155);
    expect(homeDescription(plans)).toContain(SERVICE_AREA_COPY);
    const hero = html.slice(html.indexOf("<main"), html.indexOf("</section>", html.indexOf("<main")));
    expect(hero).toContain(`for small businesses in ${SERVICE_AREA_COPY}`);
    const footer = html.slice(html.indexOf("<footer"));
    expect(footer).toContain(SERVICE_AREA_COPY);
    expect((await loadFaq()).some((item) => item.question.includes("orange county"))).toBe(true);
  });

  it("describes the business, owner and site in JSON-LD on the home page w/o an address or phone", async () => {
    const html = await text(await app.handle("GET", "/"));
    const business = ldNode(html, "ProfessionalService");
    expect(ldTypes(html)).toEqual(["ProfessionalService", "Person", "WebSite", "FAQPage"]);
    expect(business?.["@id"]).toBe(BUSINESS_ID);
    expect(business?.founder).toEqual({ "@id": PERSON_ID });
    const areas = JSON.stringify(business?.areaServed);
    for (const place of [SERVICE_AREA.county, ...SERVICE_AREA.cities]) expect(areas).toContain(place);
    const offers = business?.makesOffer as { price: string }[];
    expect(offers.map((offer) => offer.price)).toEqual(["0", "199", "1500"]);
    const setupFees = JSON.stringify(offers).match(/ActivationFee/g) ?? [];
    expect(setupFees).toHaveLength(2);
    for (const block of jsonLdBlocks(html)) {
      for (const banned of ["telephone", "address", "streetAddress", "postalCode"]) expect(block).not.toContain(`"${banned}"`);
      expect(block).not.toMatch(PHONE_NUMBER);
    }
  });

  it("marks up only the FAQ that is on the page, and only on the home page + service pages", async () => {
    const html = await text(await app.handle("GET", "/"));
    const faq = await loadFaq();
    const questions = (ldNode(html, "FAQPage")?.mainEntity ?? []) as { name: string; acceptedAnswer: { text: string } }[];
    expect(questions.length).toBe((html.match(/<details/g) ?? []).length);
    expect(questions.map((question) => question.name)).toEqual(faq.map((item) => item.question));
    for (const question of questions) expect(question.acceptedAnswer.text).not.toMatch(/<[a-z]/);
    for (const route of STUDIO_ROUTES.slice(1).filter((candidate) => !SERVICE_PAGE_ROUTES.includes(candidate))) {
      expect(ldTypes(await text(await app.handle("GET", route)))).not.toContain("FAQPage");
    }
  });

  it("adds a breadcrumb trail on every indexable sub-page", async () => {
    for (const route of [ABOUT_ROUTE, PROCESS_ROUTE, WORK_ROUTE]) {
      const crumbs = ldNode(await text(await app.handle("GET", route)), "BreadcrumbList");
      const items = (crumbs?.itemListElement ?? []) as { position: number; item: string }[];
      expect(items.map((item) => item.position)).toEqual([1, 2]);
      expect(items.map((item) => item.item)).toEqual([`${SITE_URL}/`, `${SITE_URL}${route}`]);
    }
    expect(ldTypes(await text(await app.handle("GET", "/")))).not.toContain("BreadcrumbList");
  });

  it("marks up every article as a blog post by the site owner", async () => {
    const preview = await createApp(await buildAppConfig({ previewDrafts: true }));
    for (const article of await loadArticles(true)) {
      const html = await text(await preview.handle("GET", article.route));
      const post = ldNode(html, "BlogPosting");
      expect(post?.headline).toBe(article.title);
      expect(post?.datePublished).toBe(article.published);
      expect(post?.mainEntityOfPage).toBe(`${SITE_URL}${article.route}`);
      expect((post?.author as LdNode | undefined)?.["@id"]).toBe(PERSON_ID);
      expect(ldTypes(html)).toContain("BreadcrumbList");
    }
  });

  it("keeps the work request page out of search and out of the sitemap", async () => {
    const html = await text(await app.handle("GET", WORK_REQUEST_ROUTE));
    expect(html).toContain('<meta name="robots" content="noindex, follow"');
    const studies = await loadAllCaseStudies();
    const routes = sitemapRoutes(studies, await loadAllArticles());
    for (const route of NOINDEX_ROUTES) expect(routes).not.toContain(route);
    expect(routes).toContain(WORK_ROUTE);
    for (const route of routes) {
      const page = await text(await app.handle("GET", route));
      expect(page).not.toContain('name="robots"');
    }
  });

  it("never puts a draft or a full case study in the sitemap, even when previews are on", async () => {
    const studies = await loadAllCaseStudies();
    const all = await loadAllArticles();
    const routes = sitemapRoutes(studies, all);
    for (const draft of all.filter((article) => article.draft)) expect(routes).not.toContain(draft.route);
    for (const study of studies) expect(routes).not.toContain(study.route);
    if (all.every((article) => article.draft)) expect(routes).not.toContain(ARTICLES_ROUTE);
    for (const route of routes) expect(siteRoutes(studies, all, true)).toContain(route);

    const preview = await createApp(await buildAppConfig({ previewDrafts: true }));
    const index = await text(await preview.handle("GET", ARTICLES_ROUTE));
    expect(index.includes('content="noindex"')).toBe(all.every((article) => article.draft));
  });

  it("sends www and plain http to the https apex w/ a 301, keeping the path and query", () => {
    for (const from of [`https://${WWW_HOST}/about?x=1`, `http://${WWW_HOST}/about?x=1`, "http://dimasc.io/about?x=1"]) {
      const response = canonicalRedirect(requestTo(from));
      expect(response?.status).toBe(301);
      expect(response?.headers.get("location")).toBe(`${SITE_URL}/about?x=1`);
    }
    expect(canonicalRedirect(requestTo(`https://${WWW_HOST}/`))?.headers.get("location")).toBe(`${SITE_URL}/`);
    for (const stay of [`${SITE_URL}/about`, "http://localhost:8787/about", "https://seo-dimasc-io.example.workers.dev/"]) {
      expect(canonicalRedirect(requestTo(stay))).toBeNull();
    }
  });

  it("runs the worker before static assets so the host redirect can fire", async () => {
    const config = await Bun.file("wrangler.jsonc").text();
    expect(config).toMatch(/"run_worker_first":\s*true/);
  });

  it("renders one page per service w/ a unique title, description, one h1, its plan's price + CTA and FAQs", async () => {
    const plans = await loadPlans();
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    expect(SERVICES.map((service) => service.slug)).toEqual([
      "fix-my-website",
      "new-website",
      "online-booking",
      "online-store",
      "website-care",
      "monthly-help",
      "squarespace-wix-help",
    ]);
    for (const service of SERVICES) {
      const response = await app.handle("GET", serviceRoute(service.slug));
      const html = decodeEntities(await text(response));
      const title = serviceTitle(service.title);
      expect(response.status).toBe(200);
      expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
      expect(service.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
      expect(html).toContain(`<title>${title}</title>`);
      expect(html).toContain(`<link rel="canonical" href="${SITE_URL}${serviceRoute(service.slug)}"`);
      expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
      expect(service.faq.length).toBeGreaterThanOrEqual(3);
      expect(service.faq.length).toBeLessThanOrEqual(5);
      for (const item of service.faq) expect(html).toContain(item.question);
      const plan = plans.find((candidate) => candidate.name === service.plan);
      expect(plan === undefined).toBe(service.plan === null);
      if (plan?.price !== null && plan?.price !== undefined) expect(html).toContain(formatPrice(plan.price));
      const cta = plan === undefined ? siteCheckHref() : plan.price === null ? introCallHref() : planHref(plan.name);
      expect(html).toContain(cta);
      expect(html).toContain(`href="${WORK_ROUTE}"`);
      for (const related of service.related) expect(html).toContain(`href="${serviceRoute(related)}"`);
      titles.add(title);
      descriptions.add(service.description);
    }
    expect(titles.size).toBe(SERVICES.length);
    expect(descriptions.size).toBe(SERVICES.length);
  });

  it("leads the fix page w/ the free site check + free quick fixes", async () => {
    const html = decodeEntities(await text(await app.handle("GET", serviceRoute("fix-my-website"))));
    const lede = html.slice(html.indexOf("<h1"), html.indexOf("what i can do"));
    expect(lede).toContain("the check is free");
    expect(lede).toContain(`under ${QUICK_FIX_MINUTES} min`);
    expect(lede).toContain(siteCheckHref());
    expect(html).toContain("what happens after you send it");
    expect(html).toContain("get quoted as one project");
  });

  it("marks up every service page as a Service from the business, serving orange county, w/ a breadcrumb", async () => {
    const plans = await loadPlans();
    for (const service of SERVICES) {
      const route = serviceRoute(service.slug);
      const html = await text(await app.handle("GET", route));
      const node = ldNode(html, "Service");
      expect(node?.name).toBe(service.name);
      expect(node?.url).toBe(`${SITE_URL}${route}`);
      expect((node?.provider as LdNode | undefined)?.["@id"]).toBe(BUSINESS_ID);
      expect(JSON.stringify(node?.areaServed)).toContain(SERVICE_AREA.county);
      const plan = plans.find((candidate) => candidate.name === service.plan);
      const offer = node?.offers as { price: string } | undefined;
      const expected = plan === undefined ? "0" : plan.price === null ? undefined : String(plan.price);
      expect(offer?.price).toBe(expected);
      const crumbs = (ldNode(html, "BreadcrumbList")?.itemListElement ?? []) as { item: string }[];
      expect(crumbs.map((crumb) => crumb.item)).toEqual([`${SITE_URL}/`, `${SITE_URL}${SERVICES_ROUTE}`, `${SITE_URL}${route}`]);
      for (const block of jsonLdBlocks(html)) {
        for (const banned of ["telephone", "address", "streetAddress", "postalCode"]) expect(block).not.toContain(`"${banned}"`);
      }
    }
  });

  it("lists every service on the services index, linked from the nav, footer and home", async () => {
    const index = decodeEntities(await text(await app.handle("GET", SERVICES_ROUTE)));
    expect(index).toContain(`<title>${SERVICES_TITLE}</title>`);
    for (const route of SERVICE_PAGE_ROUTES) expect(index).toContain(`href="${route}"`);
    const home = decodeEntities(await text(await app.handle("GET", "/")));
    const header = home.slice(home.indexOf("<header"), home.indexOf("</header>"));
    const footer = home.slice(home.indexOf("<footer"));
    expect(header).toContain(`href="${SERVICES_ROUTE}"`);
    for (const route of [...SERVICE_PAGE_ROUTES, ORANGE_COUNTY_ROUTE]) expect(footer).toContain(`href="${route}"`);
    const main = home.slice(home.indexOf("<main"), home.indexOf("</main>"));
    for (const slug of Object.values(PLAN_SERVICE)) expect(main).toContain(`href="${serviceRoute(slug)}"`);
  });

  it("renders one honest orange county page w/o an address, a phone or a city list", async () => {
    const response = await app.handle("GET", ORANGE_COUNTY_ROUTE);
    const html = decodeEntities(await text(response));
    expect(response.status).toBe(200);
    expect(ORANGE_COUNTY_TITLE.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(ORANGE_COUNTY_DESCRIPTION.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(html).toContain(`<title>${ORANGE_COUNTY_TITLE}</title>`);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    const main = withoutJsonLd(html.slice(html.indexOf("<main"), html.indexOf("</main>")));
    expect(main).toContain("anywhere else in the us");
    for (const city of ["irvine", "santa ana", "anaheim", "costa mesa", "huntington beach", "newport beach"]) {
      expect(main.toLowerCase()).not.toContain(city);
    }
    for (const route of SERVICE_PAGE_ROUTES) expect(main).toContain(`href="${route}"`);
    expect(main).toContain(`href="${WORK_ROUTE}"`);
    expect(ldTypes(html)).toEqual(["ProfessionalService", "BreadcrumbList"]);
    for (const block of jsonLdBlocks(html)) {
      for (const banned of ["telephone", "address", "streetAddress", "postalCode"]) expect(block).not.toContain(`"${banned}"`);
    }
  });

  it("marks up each service page's FAQ as an FAQPage that matches the visible questions + answers", async () => {
    for (const service of SERVICES) {
      const html = await text(await app.handle("GET", serviceRoute(service.slug)));
      const questions = (ldNode(html, "FAQPage")?.mainEntity ?? []) as { name: string; acceptedAnswer: { text: string } }[];
      const visible = decodeEntities(withoutJsonLd(html)).replaceAll("&quot;", '"');
      expect(questions.length).toBe((html.match(/<details/g) ?? []).length);
      expect(questions.map((question) => question.name)).toEqual(service.faq.map((item) => item.question));
      for (const question of questions) {
        expect(visible).toContain(question.name);
        expect(visible).toContain(question.acceptedAnswer.text);
      }
    }
  });

  it("puts the price line near the top of every service page", async () => {
    for (const service of SERVICES) {
      const html = decodeEntities(await text(await app.handle("GET", serviceRoute(service.slug))));
      const top = html.slice(html.indexOf("<h1"), html.indexOf("what i can do"));
      expect(top).toContain(servicePriceLine(await loadPlans()));
      for (const price of ["free site check", `under ${QUICK_FIX_MINUTES} min free`, "$199/month + $500 setup", "$1,500/month + $500 setup", PROJECT_PRICE_COPY]) {
        expect(top).toContain(price);
      }
    }
  });

  it("renders the squarespace + wix help page w/ stay-or-move advice, listed on the index, footer + sitemap", async () => {
    const route = serviceRoute("squarespace-wix-help");
    const response = await app.handle("GET", route);
    const html = decodeEntities(await text(response));
    expect(response.status).toBe(200);
    for (const word of ["squarespace", "wix", "godaddy", "wordpress", STAY_LABEL, MOVE_LABEL]) expect(html).toContain(word);
    expect(html).toContain(siteCheckHref());
    expect(decodeEntities(await text(await app.handle("GET", SERVICES_ROUTE)))).toContain(`href="${route}"`);
    const home = await text(await app.handle("GET", "/"));
    expect(home.slice(home.indexOf("<footer"))).toContain(`href="${route}"`);
    expect(sitemapRoutes(await loadAllCaseStudies(), await loadAllArticles())).toContain(route);
    for (const claim of ["expert", "certified", "partner since", "years of squarespace", "years of wix"]) expect(html.toLowerCase()).not.toContain(claim);
  });

  it("puts every service page + the orange county page in the sitemap", async () => {
    const routes = sitemapRoutes(await loadAllCaseStudies(), await loadAllArticles());
    for (const route of serviceRoutes()) expect(routes).toContain(route);
  });

  it("shows how care differs from a plugin-update plan on the care page only", async () => {
    for (const service of SERVICES) {
      const html = decodeEntities(await text(await app.handle("GET", serviceRoute(service.slug))));
      expect(html.includes("how it's different")).toBe(service.slug === "website-care");
    }
    const care = decodeEntities(await text(await app.handle("GET", serviceRoute("website-care"))));
    for (const row of SERVICES.find((service) => service.slug === "website-care")?.comparison ?? []) expect(care).toContain(row.mine);
  });

  it("never advertises a setup fee waiver in the built public HTML", async () => {
    const publicApp = await createApp(await buildAppConfig({ previewDrafts: false }));
    const routes = sitemapRoutes(await loadAllCaseStudies(), await loadAllArticles());
    expect(routes.length).toBeGreaterThan(0);
    for (const route of [...routes, ...NOINDEX_ROUTES]) {
      const html = await text(await publicApp.handle("GET", route));
      expect(`${route}: ${html}`.toLowerCase()).not.toContain("waive");
    }
  });

  it("returns 404 for an unknown path", async () => {
    expect((await app.handle("GET", "/does/not/exist")).status).toBe(404);
  });
});

interface CheckFixture {
  readonly env: CheckEnv;
  readonly stored: Map<string, string>;
  readonly sent: CheckEmail[];
}

const TEST_TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";
const PASS_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const CLIENT_IP = "203.0.113.7";

type SiteverifyBody = Record<string, string>;
type Siteverify = (body: SiteverifyBody) => Response | Promise<Response>;

function siteverifyReply(result: Record<string, unknown>): Siteverify {
  return () => Response.json(result);
}

const SITEVERIFY_PASS = siteverifyReply({ success: true, hostname: "dimasc.io", "error-codes": [] });
const realFetch = globalThis.fetch;
const siteverifyCalls: SiteverifyBody[] = [];
let siteverify: Siteverify = SITEVERIFY_PASS;

beforeEach(() => {
  siteverify = SITEVERIFY_PASS;
  siteverifyCalls.length = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url !== TURNSTILE_VERIFY_URL) throw new Error(`unexpected fetch: ${url}`);
    const body = JSON.parse(String(init?.body)) as SiteverifyBody;
    siteverifyCalls.push(body);
    return siteverify(body);
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

async function captureLogs<T>(run: () => Promise<T>): Promise<{ result: T; logged: string }> {
  const lines: string[] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => lines.push(args.join(" "));
  try {
    return { result: await run(), logged: lines.join("\n") };
  } finally {
    console.log = original;
  }
}

function checkFixture(options: { allow?: boolean; mailer?: boolean; secret?: boolean } = {}): CheckFixture {
  const stored = new Map<string, string>();
  const sent: CheckEmail[] = [];
  const env: CheckEnv = {
    ...(options.secret === false ? {} : { TURNSTILE_SECRET_KEY: TEST_TURNSTILE_SECRET }),
    REQUESTS: {
      put: async (key, value) => {
        stored.set(key, value);
      },
    },
    CHECK_LIMITER: { limit: async () => ({ success: options.allow ?? true }) },
    ...(options.mailer === false
      ? {}
      : {
          EMAIL: {
            send: async (message: CheckEmail) => {
              sent.push(message);
            },
          },
        }),
  };
  return { env, stored, sent };
}

const VALID_CHECK = {
  [CHECK_FIELD.name]: "Pat Owner",
  [CHECK_FIELD.email]: "pat@example.com",
  [CHECK_FIELD.website]: "patsgym.com",
  [CHECK_FIELD.message]: "the booking button does nothing on my phone",
  [CHECK_FIELD.source]: "",
  [CHECK_FIELD.trap]: "",
  [TURNSTILE_RESPONSE_FIELD]: PASS_TOKEN,
};

function checkPost(fields: Record<string, string>, init: { method?: string; referer?: string; body?: string } = {}): Request {
  const headers = new Headers({ "content-type": "application/x-www-form-urlencoded", "cf-connecting-ip": CLIENT_IP });
  if (init.referer !== undefined) headers.set("referer", init.referer);
  return new Request(`${SITE_URL}${CHECK_ROUTE}`, {
    method: init.method ?? "POST",
    headers,
    body: init.body ?? new URLSearchParams(fields).toString(),
  });
}

describe("site check form", () => {
  it("shows the form on the fix page, posting to the worker w/ a honeypot, a source field + an email fallback", async () => {
    const html = decodeEntities(await text(await app.handle("GET", SITE_CHECK_PAGE)));
    expect(siteCheckHref()).toBe(`${SITE_CHECK_PAGE}#${SITE_CHECK_ANCHOR}`);
    expect(html).toContain(`id="${SITE_CHECK_ANCHOR}"`);
    expect(html).toContain(`action="${CHECK_ROUTE}"`);
    expect(html).toMatch(/method="post"/i);
    for (const field of [CHECK_FIELD.name, CHECK_FIELD.email, CHECK_FIELD.website, CHECK_FIELD.message]) {
      expect(html).toContain(`name="${field}"`);
    }
    expect(html.toLowerCase()).toContain(`maxlength="${CHECK_LIMIT.message}"`);
    expect(html).toMatch(new RegExp(`<input[^>]*name="${CHECK_FIELD.source}"[^>]*type="hidden"|<input[^>]*type="hidden"[^>]*name="${CHECK_FIELD.source}"`));
    expect(html).toMatch(new RegExp(`<input[^>]*name="${CHECK_FIELD.trap}"[^>]*tabindex="-1"|<input[^>]*tabindex="-1"[^>]*name="${CHECK_FIELD.trap}"`, "i"));
    const form = html.slice(html.indexOf("<form"), html.indexOf("</form>"));
    expect(form).toContain(`href="mailto:${CONTACT_EMAIL}"`);
  });

  it("points every free site check CTA at the form, not a mailto", async () => {
    for (const route of ["/", ABOUT_ROUTE, SITE_CHECK_PAGE]) {
      const html = decodeEntities(await text(await app.handle("GET", route)));
      expect(html).toContain(`href="${siteCheckHref()}"`);
      expect(html).not.toContain("mailto:ryan@dimasc.io?subject=free%20site%20check");
    }
  });

  it("stores a valid request, emails it to me w/ the sender as reply-to, + sends the visitor to the thank-you page", async () => {
    const { env, stored, sent } = checkFixture();
    const logged: string[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => logged.push(args.join(" "));
    const response = await handleCheck(
      checkPost(VALID_CHECK, { referer: `${SITE_URL}${SITE_CHECK_PAGE}?utm_source=google&utm_medium=organic&utm_campaign=gbp&x=1` }),
      env,
    );
    console.log = original;
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(CHECK_SENT_ROUTE);
    expect(stored.size).toBe(1);
    const record = JSON.parse([...stored.values()][0] ?? "{}") as Record<string, string>;
    expect(record.name).toBe(VALID_CHECK.name);
    expect(record.message).toBe(VALID_CHECK.message);
    expect(record.source).toBe("utm_source=google&utm_medium=organic&utm_campaign=gbp");
    expect(record.page).toBe(SITE_CHECK_PAGE);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe(CONTACT_EMAIL);
    expect(sent[0]?.replyTo).toBe(VALID_CHECK.email);
    expect(sent[0]?.text).toContain(VALID_CHECK.message);
    expect(logged.join("\n")).not.toContain(VALID_CHECK.message);
    expect(logged.join("\n")).not.toContain(VALID_CHECK.email);
  });

  it("still stores the request when no mailer is bound", async () => {
    const { env, stored } = checkFixture({ mailer: false });
    const response = await handleCheck(checkPost(VALID_CHECK), env);
    expect(response.status).toBe(303);
    expect(stored.size).toBe(1);
  });

  it("drops a honeypot hit quietly: same redirect, nothing stored or sent", async () => {
    const { env, stored, sent } = checkFixture();
    const response = await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.trap]: "http://spam.example" }), env);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(CHECK_SENT_ROUTE);
    expect(stored.size).toBe(0);
    expect(sent).toHaveLength(0);
  });

  it("refuses an oversize body or field w/ a 413 + stores nothing", async () => {
    const { env, stored } = checkFixture();
    const huge = await handleCheck(checkPost({}, { body: `message=${"a".repeat(MAX_CHECK_BODY_BYTES + 1)}` }), env);
    expect(huge.status).toBe(413);
    const longNote = await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.message]: "a".repeat(CHECK_LIMIT.message + 1) }), env);
    expect(longNote.status).toBe(413);
    const longName = await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.name]: "a".repeat(CHECK_LIMIT.name + 1) }), env);
    expect(longName.status).toBe(413);
    expect(stored.size).toBe(0);
  });

  it("rejects missing fields, a bad email + a header-injection name w/ a 4xx", async () => {
    const { env, stored } = checkFixture();
    expect((await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.message]: " " }), env)).status).toBe(400);
    expect((await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.email]: "not-an-email" }), env)).status).toBe(400);
    expect((await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.name]: "a\r\nBcc: x@example.com" }), env)).status).toBe(415);
    expect(stored.size).toBe(0);
  });

  it("answers the wrong method w/ a 405, and sends a plain GET to the form", async () => {
    const { env, stored } = checkFixture();
    for (const method of ["PUT", "DELETE", "PATCH"]) {
      const response = await handleCheck(checkPost(VALID_CHECK, { method }), env);
      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toContain("POST");
    }
    const get = await handleCheck(new Request(`${SITE_URL}${CHECK_ROUTE}`), env);
    expect(get.status).toBe(303);
    expect(get.headers.get("location")).toBe(siteCheckHref());
    expect(stored.size).toBe(0);
  });

  it("limits requests per IP w/ a 429", async () => {
    const { env, stored } = checkFixture({ allow: false });
    const response = await handleCheck(checkPost(VALID_CHECK), env);
    expect(response.status).toBe(429);
    expect(stored.size).toBe(0);
  });

  it("fills the hidden source field on the form page from the URL's utm params, server-side", async () => {
    const page = new Response('<form><input name="source" type="hidden" value=""/></form>', { headers: { "content-type": "text/html" } });
    const url = new URL(`${SITE_URL}${SITE_CHECK_PAGE}?utm_source=email&utm_campaign=2026-12-oc-gyms"><b>`);
    const html = await withFormFilled(page, url).text();
    const value = /value="([^"]*)"/.exec(html)?.[1] ?? "";
    expect(value).toStartWith("utm_source=email&utm_campaign=2026-12-oc-gyms");
    expect(value).toMatch(/^[\w.\-=&]+$/);
    const plain = new Response("<p>x</p>", { headers: { "content-type": "text/html" } });
    expect(withFormFilled(plain, new URL(`${SITE_URL}${SITE_CHECK_PAGE}`))).toBe(plain);
  });

  it("fills the hidden click id fields + click time from the URL's gclid, gbraid + wbraid, server-side", async () => {
    const html = await text(await app.handle("GET", SITE_CHECK_PAGE));
    for (const field of [CHECK_FIELD.gclid, CHECK_FIELD.gbraid, CHECK_FIELD.wbraid, CHECK_FIELD.clickedAt]) {
      expect(html).toMatch(new RegExp(`<input[^>]*name="${field}"[^>]*type="hidden"|<input[^>]*type="hidden"[^>]*name="${field}"`));
    }
    const page = new Response(html, { headers: { "content-type": "text/html" } });
    const now = new Date("2026-11-14T18:00:00.000Z");
    const url = new URL(`${SITE_URL}${SITE_CHECK_PAGE}?gclid=Cj0KCQ_abc-123&wbraid=WB_9&utm_source=google`);
    const filled = withFormFilled(page, url, now);
    expect(filled.headers.get("cache-control")).toBe("private, no-store");
    const out = await filled.text();
    const valueOf = (name: string): string | undefined => new RegExp(`name="${name}"[^>]*value="([^"]*)"`).exec(out)?.[1];
    expect(valueOf(CHECK_FIELD.gclid)).toBe("Cj0KCQ_abc-123");
    expect(valueOf(CHECK_FIELD.wbraid)).toBe("WB_9");
    expect(valueOf(CHECK_FIELD.gbraid)).toBe("");
    expect(valueOf(CHECK_FIELD.clickedAt)).toBe(now.toISOString());
    expect(valueOf(CHECK_FIELD.source)).toBe("utm_source=google");
  });

  it("drops a click id outside [A-Za-z0-9_-] or over 200 chars", async () => {
    for (const bad of ['abc"><script>', "abc def", "abc.def", "a".repeat(CHECK_LIMIT.clickId + 1)]) {
      const page = new Response('<input name="gclid" type="hidden" value=""/><input name="clicked_at" type="hidden" value=""/>', {
        headers: { "content-type": "text/html" },
      });
      const url = new URL(`${SITE_URL}${SITE_CHECK_PAGE}`);
      url.searchParams.set("gclid", bad);
      const response = withFormFilled(page, url);
      expect(response).toBe(page);
      expect(cleanClickId(bad)).toBe("");
    }
    expect(cleanClickId("a".repeat(CHECK_LIMIT.clickId))).toHaveLength(CHECK_LIMIT.clickId);

    const { env, stored } = checkFixture();
    await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.gclid]: "bad id!", [CHECK_FIELD.clickedAt]: new Date().toISOString() }), env);
    const record = JSON.parse([...stored.values()][0] ?? "{}") as Record<string, string>;
    expect(record.gclid).toBe("");
    expect(record.clickedAt).toBe("");
  });

  it("stores the click id + click time on the request and puts them in the email", async () => {
    const { env, stored, sent } = checkFixture();
    const clickedAt = new Date(Date.now() - 60_000).toISOString();
    const { logged } = await captureLogs(() =>
      handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.gclid]: "Cj0KCQ_abc-123", [CHECK_FIELD.clickedAt]: clickedAt }), env),
    );
    const record = JSON.parse([...stored.values()][0] ?? "{}") as Record<string, string>;
    expect(record.gclid).toBe("Cj0KCQ_abc-123");
    expect(record.gbraid).toBe("");
    expect(record.wbraid).toBe("");
    expect(record.clickedAt).toBe(clickedAt);
    expect(sent[0]?.text).toContain(`ad click: gclid Cj0KCQ_abc-123 (clicked ${clickedAt})`);
    expect(logged).not.toContain("Cj0KCQ_abc-123");

    const fromReferer = checkFixture();
    await handleCheck(checkPost(VALID_CHECK, { referer: `${SITE_URL}${SITE_CHECK_PAGE}?gbraid=GB_1` }), fromReferer.env);
    const refererRecord = JSON.parse([...fromReferer.stored.values()][0] ?? "{}") as Record<string, string>;
    expect(refererRecord.gbraid).toBe("GB_1");
    expect(refererRecord.clickedAt).toBe("");
    expect(fromReferer.sent[0]?.text).toContain("ad click: gbraid GB_1\n");

    const none = checkFixture();
    await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.clickedAt]: clickedAt }), none.env);
    expect(none.sent[0]?.text).toContain("ad click: (none)");
    expect((JSON.parse([...none.stored.values()][0] ?? "{}") as Record<string, string>).clickedAt).toBe("");
  });

  it("keeps a click time only when it is a past ISO instant within 90 days of the request", () => {
    const receivedAt = "2026-11-14T18:00:00.000Z";
    expect(cleanClickedAt("2026-11-14T17:59:00.000Z", receivedAt)).toBe("2026-11-14T17:59:00.000Z");
    for (const bad of ["2026-11-14T18:01:00.000Z", "2026-08-01T00:00:00.000Z", "yesterday", "2026-11-14 17:59:00", ""]) {
      expect(cleanClickedAt(bad, receivedAt)).toBe("");
    }
  });

  it("carries the click id fields through the retry page, escaped", async () => {
    const fixture = checkFixture();
    const { [TURNSTILE_RESPONSE_FIELD]: _token, ...withoutToken } = { ...VALID_CHECK, [CHECK_FIELD.gclid]: "Cj0_x" };
    const html = await (await handleCheck(checkPost(withoutToken), fixture.env)).text();
    expect(html).toContain(`<input name="${CHECK_FIELD.gclid}" type="hidden" value="Cj0_x" />`);
    expect(html).toContain(`href="${PRIVACY_ROUTE}"`);
  });

  it("renders the thank-you page w/ the reply time the site states + a what-happens-next list, noindex", async () => {
    const response = await app.handle("GET", CHECK_SENT_ROUTE);
    const html = decodeEntities(await text(response));
    expect(response.status).toBe(200);
    expect(html).toContain(CHECK_SENT_HEADLINE);
    expect(CHECK_SENT_HEADLINE).toContain("1 business day, monday to friday");
    expect(html).toContain("what happens next");
    for (const step of CHECK_NEXT_STEPS) expect(html).toContain(step);
    expect(html).toContain('<meta name="robots" content="noindex, follow"');
    expect(sitemapRoutes(await loadAllCaseStudies(), await loadAllArticles())).not.toContain(CHECK_SENT_ROUTE);
  });

  it("ships no client script on any page but the Turnstile script on the form page, the error page included", async () => {
    const routes = [...siteRoutes(await loadAllCaseStudies(), await loadArticles(false), false), CHECK_SENT_ROUTE];
    expect(routes).toContain(SITE_CHECK_PAGE);
    for (const route of routes) {
      const html = await text(await app.handle("GET", route));
      expect(`${route}: ${withoutAllowedScripts(route, html)}`).not.toContain("<script");
      if (route !== SITE_CHECK_PAGE) expect(html).not.toContain("challenges.cloudflare.com");
    }
    expect(renderCheckProblem({ title: "x", detail: "y" })).not.toContain("<script");
  });

  it("loads the Turnstile script once on the form page + puts the widget inside the form", async () => {
    const html = await text(await app.handle("GET", SITE_CHECK_PAGE));
    const form = html.slice(html.indexOf("<form"), html.indexOf("</form>"));
    expect(html.split(TURNSTILE_SCRIPT_TAG)).toHaveLength(2);
    expect(form).toContain(`class="cf-turnstile"`);
    expect(form).toContain(`data-sitekey="${TURNSTILE_SITEKEY}"`);
    expect(form).toContain(`data-action="${TURNSTILE_ACTION}"`);
  });
});

const NOT_HUMAN_LINE = "couldn't confirm you're human";

async function expectRefused(response: Response, fixture: CheckFixture): Promise<void> {
  expect(response.status).toBe(403);
  expect(await response.text()).toContain(NOT_HUMAN_LINE);
  expect(fixture.stored.size).toBe(0);
  expect(fixture.sent).toHaveLength(0);
}

describe("site check turnstile", () => {
  it("stores + emails a request w/ a valid token, verified server-side w/ the secret, ip + an idempotency key", async () => {
    const fixture = checkFixture();
    const { result: response, logged } = await captureLogs(() => handleCheck(checkPost(VALID_CHECK), fixture.env));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(CHECK_SENT_ROUTE);
    expect(fixture.stored.size).toBe(1);
    expect(fixture.sent).toHaveLength(1);
    expect(siteverifyCalls).toHaveLength(1);
    const call = siteverifyCalls[0];
    expect(call?.secret).toBe(TEST_TURNSTILE_SECRET);
    expect(call?.response).toBe(PASS_TOKEN);
    expect(call?.remoteip).toBe(CLIENT_IP);
    expect(call?.idempotency_key).toMatch(/^[0-9a-f-]{36}$/);
    expect(logged).not.toContain(PASS_TOKEN);
    expect(logged).not.toContain(TEST_TURNSTILE_SECRET);
  });

  it("refuses a missing token w/ a 4xx, no siteverify call, nothing stored or sent", async () => {
    const fixture = checkFixture();
    const { [TURNSTILE_RESPONSE_FIELD]: _token, ...withoutToken } = VALID_CHECK;
    await expectRefused(await handleCheck(checkPost(withoutToken), fixture.env), fixture);
    await expectRefused(await handleCheck(checkPost({ ...VALID_CHECK, [TURNSTILE_RESPONSE_FIELD]: " " }), fixture.env), fixture);
    expect(siteverifyCalls).toHaveLength(0);
  });

  it("refuses a failed token w/ a 4xx + logs only the event + error codes", async () => {
    const fixture = checkFixture();
    siteverify = siteverifyReply({ success: false, hostname: "dimasc.io", "error-codes": ["invalid-input-response"] });
    const { result: response, logged } = await captureLogs(() => handleCheck(checkPost(VALID_CHECK), fixture.env));
    await expectRefused(response, fixture);
    expect(JSON.parse(logged)).toEqual({ event: "turnstile_failed", codes: ["invalid-input-response"] });
    expect(logged).not.toContain(PASS_TOKEN);
  });

  it("fails closed when siteverify is down, errors or the secret is missing", async () => {
    const down = checkFixture();
    siteverify = () => {
      throw new TypeError("network down");
    };
    await expectRefused(await handleCheck(checkPost(VALID_CHECK), down.env), down);

    const erroring = checkFixture();
    siteverify = () => new Response("bad gateway", { status: 502 });
    await expectRefused(await handleCheck(checkPost(VALID_CHECK), erroring.env), erroring);

    const garbled = checkFixture();
    siteverify = () => new Response("not json", { status: 200 });
    await expectRefused(await handleCheck(checkPost(VALID_CHECK), garbled.env), garbled);

    siteverify = SITEVERIFY_PASS;
    const unconfigured = checkFixture({ secret: false });
    await expectRefused(await handleCheck(checkPost(VALID_CHECK), unconfigured.env), unconfigured);
  });

  it("refuses a token solved on a hostname the widget does not list", async () => {
    for (const hostname of ["evil.example", "dimasc.io.evil.example", undefined]) {
      const fixture = checkFixture();
      siteverify = siteverifyReply({ success: true, hostname, "error-codes": [] });
      await expectRefused(await handleCheck(checkPost(VALID_CHECK), fixture.env), fixture);
    }
    for (const hostname of TURNSTILE_HOSTNAMES) {
      const fixture = checkFixture();
      siteverify = siteverifyReply({ success: true, hostname, "error-codes": [] });
      expect((await handleCheck(checkPost(VALID_CHECK), fixture.env)).status).toBe(303);
    }
  });

  it("re-fills the form on a failed check, escaped, w/ a fresh interaction-only widget + the email line", async () => {
    const fixture = checkFixture();
    const hostile = {
      ...VALID_CHECK,
      [CHECK_FIELD.name]: `<script>alert("x")</script>`,
      [CHECK_FIELD.website]: `pats"gym.com`,
      [CHECK_FIELD.message]: "the <b>booking</b> button & the menu</textarea><script>x</script>",
      [CHECK_FIELD.source]: "utm_source=google",
    };
    const { [TURNSTILE_RESPONSE_FIELD]: _token, ...withoutToken } = hostile;
    const response = await handleCheck(checkPost(withoutToken), fixture.env);
    expect(response.status).toBe(403);
    const html = await response.text();
    expect(fixture.stored.size).toBe(0);
    expect(html).toContain(`value="&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"`);
    expect(html).toContain(`value="pats&quot;gym.com"`);
    expect(html).toContain(`value="${VALID_CHECK.email}"`);
    expect(html).toContain(`value="utm_source=google"`);
    expect(html).toContain("the &lt;b&gt;booking&lt;/b&gt; button &amp; the menu&lt;/textarea&gt;&lt;script&gt;x&lt;/script&gt;</textarea>");
    expect(html.split("<script").length - 1).toBe(1);
    expect(html).toContain(`<script async defer src="${TURNSTILE_SCRIPT_SRC}"></script>`);
    expect(html).toContain(`data-sitekey="${TURNSTILE_SITEKEY}"`);
    expect(html).toContain(`data-appearance="interaction-only"`);
    expect(html).toContain(`action="${CHECK_ROUTE}"`);
    expect(html).toContain(`name="${CHECK_FIELD.trap}"`);
    expect(html).toContain(`or email me at <a class="underline underline-offset-4" href="mailto:${CONTACT_EMAIL}">`);
  });

  it("logs the siteverify error codes, never the token or the message", async () => {
    const fixture = checkFixture();
    siteverify = siteverifyReply({ success: false, "error-codes": ["timeout-or-duplicate"] });
    const { logged } = await captureLogs(() => handleCheck(checkPost(VALID_CHECK), fixture.env));
    expect(JSON.parse(logged)).toEqual({ event: "turnstile_failed", codes: ["timeout-or-duplicate"] });
    for (const secret of [PASS_TOKEN, TEST_TURNSTILE_SECRET, VALID_CHECK.message, VALID_CHECK.email, VALID_CHECK.name]) {
      expect(logged).not.toContain(secret);
    }
  });

  it("checks the honeypot + the form before it calls siteverify", async () => {
    const fixture = checkFixture();
    await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.trap]: "http://spam.example" }), fixture.env);
    await handleCheck(checkPost({ ...VALID_CHECK, [CHECK_FIELD.email]: "not-an-email" }), fixture.env);
    expect(siteverifyCalls).toHaveLength(0);
  });
});

function streamedPost(body: string, headers: Record<string, string> = {}): Request {
  const bytes = new TextEncoder().encode(body);
  const half = Math.floor(bytes.byteLength / 2);
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice(0, half));
      controller.enqueue(bytes.slice(half));
      controller.close();
    },
  });
  return new Request(`${SITE_URL}${CHECK_ROUTE}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "cf-connecting-ip": CLIENT_IP, ...headers },
    body: stream,
    duplex: "half",
  } as RequestInit);
}

function paddedTo(bytes: number): string {
  const base = new URLSearchParams(VALID_CHECK).toString();
  const prefix = `${base}&pad=`;
  return `${prefix}${"a".repeat(bytes - new TextEncoder().encode(prefix).byteLength)}`;
}

describe("site check body cap", () => {
  it("returns 413 for an oversize streamed body w/ no content-length", async () => {
    const { env, stored } = checkFixture();
    const request = streamedPost(paddedTo(MAX_CHECK_BODY_BYTES + 1));
    expect(request.headers.get("content-length")).toBeNull();
    expect((await handleCheck(request, env)).status).toBe(413);
    expect(stored.size).toBe(0);
  });

  it("returns 413 when the content-length lies about a bigger body", async () => {
    const { env, stored } = checkFixture();
    for (const declared of ["100", "not-a-number"]) {
      const response = await handleCheck(streamedPost(paddedTo(MAX_CHECK_BODY_BYTES + 1), { "content-length": declared }), env);
      expect(response.status).toBe(413);
    }
    expect(stored.size).toBe(0);
  });

  it("accepts a body exactly at the limit", async () => {
    const { env, stored } = checkFixture();
    const body = paddedTo(MAX_CHECK_BODY_BYTES);
    expect(new TextEncoder().encode(body).byteLength).toBe(MAX_CHECK_BODY_BYTES);
    const response = await handleCheck(streamedPost(body), env);
    expect(response.status).toBe(303);
    expect(stored.size).toBe(1);
  });
});

describe("site check email", () => {
  it("sends one email from the site address to me when env.EMAIL exists, + none when it does not", async () => {
    const withMailer = checkFixture();
    await handleCheck(checkPost(VALID_CHECK), withMailer.env);
    expect(withMailer.sent).toHaveLength(1);
    expect(withMailer.sent[0]?.from.email).toBe(CHECK_SENDER);
    expect(CHECK_SENDER).toBe("site@dimasc.io");
    expect(withMailer.sent[0]?.to).toBe(CONTACT_EMAIL);
    expect(withMailer.sent[0]?.subject).toContain(VALID_CHECK.name);

    const noMailer = checkFixture({ mailer: false });
    await handleCheck(checkPost(VALID_CHECK), noMailer.env);
    expect(noMailer.sent).toHaveLength(0);
    expect(noMailer.stored.size).toBe(1);
  });
});

describe("privacy page", () => {
  it("renders the privacy page, linked from the footer + under the form, and lists it in the sitemap", async () => {
    const response = await app.handle("GET", PRIVACY_ROUTE);
    const html = decodeEntities(await text(response));
    expect(response.status).toBe(200);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain(PRIVACY_LEDE);
    expect(html).toContain(PRIVACY_DESCRIPTION);
    for (const section of PRIVACY_SECTIONS) expect(html).toContain(section.title);
    for (const phrase of ["cloudflare", "google ads", "no ad cookies", "turnstile", `mailto:${CONTACT_EMAIL}`]) expect(html).toContain(phrase);
    const footer = html.slice(html.indexOf("<footer"));
    expect(footer).toContain(`href="${PRIVACY_ROUTE}"`);
    const form = decodeEntities(await text(await app.handle("GET", SITE_CHECK_PAGE)));
    expect(form.slice(form.indexOf("<form"), form.indexOf("</form>"))).toContain(`href="${PRIVACY_ROUTE}"`);
    expect(sitemapRoutes(await loadAllCaseStudies(), await loadAllArticles())).toContain(PRIVACY_ROUTE);
  });
});

describe("ad lead export", () => {
  it("formats a Google Ads offline conversion CSV in America/Los_Angeles time", () => {
    const csv = conversionsCsv([
      { receivedAt: "2026-11-14T18:05:09.123Z", gclid: "Cj0KCQ_abc-123", gbraid: "", wbraid: "" },
      { receivedAt: "2026-07-04T03:00:00.000Z", gclid: "", gbraid: "GB_1", wbraid: "" },
      { receivedAt: "2026-11-13T00:00:00.000Z", gclid: "", gbraid: "", wbraid: "" },
      { receivedAt: "2026-11-13T00:00:00.000Z", gclid: "bad id!" },
    ]);
    expect(csv).toBe(
      [
        "Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency",
        "Cj0KCQ_abc-123,site check lead,2026-11-14 10:05:09 America/Los_Angeles,,USD",
        "GB_1,site check lead,2026-07-03 20:00:00 America/Los_Angeles,,USD",
        "",
      ].join("\n"),
    );
    expect(CSV_HEADER).toHaveLength(5);
    expect(conversionsCsv([{ receivedAt: "2026-11-14T08:00:00.000Z", gclid: "x" }], 'lead, "form"')).toContain('x,"lead, ""form""",2026-11-14 00:00:00 America/Los_Angeles,,USD');
    expect(googleAdsTime(new Date("2026-01-01T07:30:00.000Z"))).toBe("2025-12-31 23:30:00 America/Los_Angeles");
    expect(clickIdOf({ gclid: "", wbraid: "WB_2" })).toBe("WB_2");
  });

  it("keeps only keys from the last N days + reads its flags", () => {
    const now = new Date("2026-11-14T00:00:00.000Z");
    const keys = ["check:2026-11-10T12:00:00.000Z:a1", "check:2026-10-01T12:00:00.000Z:b2", "other:2026-11-10T12:00:00.000Z:c3", "check:junk"];
    expect(keysSince(keys, 30, now)).toEqual(["check:2026-11-10T12:00:00.000Z:a1"]);
    expect(parseArgs([])).toEqual({ days: 30, conversionName: "site check lead" });
    expect(parseArgs(["--days", "7", "--name", "lead"])).toEqual({ days: 7, conversionName: "lead" });
    expect(() => parseArgs(["--days", "0"])).toThrow();
  });
});
