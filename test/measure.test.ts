import { afterEach, beforeAll, beforeEach, describe, expect, it } from "bun:test";

import { createApp } from "@lesto/kernel";
import type { App } from "@lesto/kernel";

import appConfig from "../lesto.app";
import worker from "../worker";
import {
  CHECK_FIELD,
  CHECK_ROUTE,
  type CheckEmail,
  type CheckEnv,
  carriedQuery,
  formFills,
  handleCheck,
  TURNSTILE_RESPONSE_FIELD,
  TURNSTILE_SCRIPT_SRC,
  TURNSTILE_VERIFY_URL,
} from "../src/check";
import { EVENT_BLOBS, type EventPoint, type EventSink, SITE_EVENT } from "../src/measure";
import { PRIVACY_ROUTE, SITE_CHECK_PAGE, SITE_URL, siteCheckHref } from "../src/site";
import { NO_SCRIPTS_LINE, SERVER_COUNTING_LINE } from "../src/ui/privacy";
import { formatReport, readConfig, sourcesSql, summarize, TOKEN_ENV } from "../scripts/weekly-report.mjs";

const CLIENT_IP = "203.0.113.7";
const GCLID = "Cj0KCQ_abc-123";
const FULL_REFERER = "https://www.google.com/search?q=fix+my+gym+site&client=pat";
const PERSON = { name: "Pat Owner", email: "pat@example.com", website: "patsgym.com", message: "the booking button does nothing on my phone" };
const HOME_ROUTES = ["/", "/about", PRIVACY_ROUTE, SITE_CHECK_PAGE] as const;

let app: App;

beforeAll(async () => {
  app = await createApp({ ...appConfig, secure: false });
});

const realFetch = globalThis.fetch;
let turnstilePasses = true;

beforeEach(() => {
  turnstilePasses = true;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url !== TURNSTILE_VERIFY_URL) throw new Error(`unexpected fetch: ${url}`);
    return Response.json({ success: turnstilePasses, hostname: "dimasc.io", "error-codes": turnstilePasses ? [] : ["invalid-input-response"] });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

function recordingSink(): EventSink & { points: EventPoint[] } {
  const points: EventPoint[] = [];
  return { points, writeDataPoint: (point) => points.push(point) };
}

const brokenSink: EventSink = {
  writeDataPoint() {
    throw new Error("analytics engine down");
  },
};

const ctx = { waitUntil: (_promise: Promise<unknown>) => undefined, passThroughOnException: () => undefined };

function siteEnv(events?: EventSink): Record<string, unknown> {
  return {
    ASSETS: {
      fetch: async (request: Request) => {
        const page = await app.handle("GET", new URL(request.url).pathname);
        return new Response(page.body as BodyInit, {
          status: page.status,
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate", etag: '"abc"' },
        });
      },
    },
    REQUESTS: { put: async () => undefined },
    ...(events === undefined ? {} : { EVENTS: events }),
  };
}

function visit(path: string, events?: EventSink, headers: Record<string, string> = {}): Promise<Response> {
  const request = new Request(`${SITE_URL}${path}`, { headers: { "cf-connecting-ip": CLIENT_IP, ...headers } });
  return worker.fetch(request, siteEnv(events) as never, ctx as never);
}

function formHrefs(html: string): string[] {
  return [...html.matchAll(/href="(\/services\/fix-my-website[^"]*)"/g)].map((match) => (match[1] ?? "").replaceAll("&amp;", "&"));
}

function checkEnv(events: EventSink | undefined, sent: CheckEmail[] = [], stored = new Map<string, string>()): CheckEnv {
  return {
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    REQUESTS: { put: async (key, value) => void stored.set(key, value) },
    EMAIL: { send: async (message: CheckEmail) => void sent.push(message) },
    ...(events === undefined ? {} : { EVENTS: events }),
  };
}

function checkPost(fields: Record<string, string>, referer = `${SITE_URL}${SITE_CHECK_PAGE}?utm_source=gbp&utm_medium=organic&gclid=${GCLID}`): Request {
  return new Request(`${SITE_URL}${CHECK_ROUTE}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "cf-connecting-ip": CLIENT_IP, referer },
    body: new URLSearchParams(fields).toString(),
  });
}

const VALID_POST = {
  [CHECK_FIELD.name]: PERSON.name,
  [CHECK_FIELD.email]: PERSON.email,
  [CHECK_FIELD.website]: PERSON.website,
  [CHECK_FIELD.message]: PERSON.message,
  [CHECK_FIELD.source]: "utm_source=gbp&utm_medium=organic&utm_campaign=oc",
  [CHECK_FIELD.gclid]: GCLID,
  [TURNSTILE_RESPONSE_FIELD]: "XXXX.DUMMY.TOKEN.XXXX",
};

describe("attribution carry-through", () => {
  it("adds the visitor's click id, utm tags + click time to every link to the form", async () => {
    const response = await visit(`/?gclid=${GCLID}&utm_source=gbp&utm_medium=organic&utm_campaign=oc&ref=card&other=x`);
    const hrefs = formHrefs(await response.text());
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const url = new URL(href, SITE_URL);
      expect(url.pathname).toBe(SITE_CHECK_PAGE);
      expect(url.searchParams.get("gclid")).toBe(GCLID);
      expect(url.searchParams.get("utm_source")).toBe("gbp");
      expect(url.searchParams.get("utm_campaign")).toBe("oc");
      expect(url.searchParams.get("ref")).toBe("card");
      expect(url.searchParams.get("other")).toBeNull();
      expect(Date.parse(url.searchParams.get(CHECK_FIELD.clickedAt) ?? "")).not.toBeNaN();
    }
    expect(hrefs.some((href) => href.endsWith("#check"))).toBe(true);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("etag")).toBeNull();
  });

  it("drops invalid click ids + unsafe utm characters, and leaves a page w/o params untouched + cacheable", async () => {
    const response = await visit(`/?gclid=${encodeURIComponent('bad"><script>')}&wbraid=a.b&utm_source=${encodeURIComponent('gbp"><b>')}`);
    const html = await response.text();
    for (const href of formHrefs(html)) {
      const url = new URL(href, SITE_URL);
      expect(url.searchParams.get("gclid")).toBeNull();
      expect(url.searchParams.get("wbraid")).toBeNull();
      expect(url.searchParams.get(CHECK_FIELD.clickedAt)).toBeNull();
      expect(url.searchParams.get("utm_source")).toMatch(/^[\w.-]+$/);
    }
    expect(html).not.toContain("<script>");

    const plain = await visit("/");
    expect(plain.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(formHrefs(await plain.text())).toContain(siteCheckHref());
    expect(carriedQuery(new URL(`${SITE_URL}/?gclid=a%20b&x=1`))).toBe("");
  });

  it("keeps the landing click time on the form page, and replaces a forged or future one", () => {
    const now = new Date("2026-11-14T18:00:00.000Z");
    const landed = "2026-11-14T17:55:00.000Z";
    const fills = formFills(new URL(`${SITE_URL}${SITE_CHECK_PAGE}?gclid=${GCLID}&clicked_at=${landed}`), now);
    expect(fills[CHECK_FIELD.clickedAt]).toBe(landed);
    for (const bad of ["2026-11-15T00:00:00.000Z", "yesterday"]) {
      const forged = formFills(new URL(`${SITE_URL}${SITE_CHECK_PAGE}?gclid=${GCLID}&clicked_at=${bad}`), now);
      expect(forged[CHECK_FIELD.clickedAt]).toBe(now.toISOString());
    }
  });
});

describe("server-side events", () => {
  it("writes one page_view per html page, plus form_view on the form page, w/ only the allowed blobs", async () => {
    const sink = recordingSink();
    await visit(`${SITE_CHECK_PAGE}?gclid=${GCLID}&utm_source=gbp&utm_medium=organic&utm_campaign=oc`, sink, { referer: FULL_REFERER });
    expect(sink.points.map((point) => point.indexes[0])).toEqual([SITE_EVENT.pageView, SITE_EVENT.formView]);
    expect(sink.points[0]?.blobs).toEqual([SITE_EVENT.pageView, SITE_CHECK_PAGE, "www.google.com", "gbp", "organic", "oc", "1"]);
    expect(sink.points[0]?.blobs).toHaveLength(EVENT_BLOBS.length);

    const internal = recordingSink();
    await visit("/about", internal, { referer: `${SITE_URL}/` });
    expect(internal.points[0]?.blobs.slice(0, 3)).toEqual([SITE_EVENT.pageView, "/about", "self"]);

    const bot = recordingSink();
    await visit("/", bot, { "user-agent": "Googlebot/2.1" });
    expect(bot.points).toHaveLength(0);
  });

  it("writes form_submit, stored + emailed on success, and form_submit + turnstile_fail on a failed check", async () => {
    const sink = recordingSink();
    expect((await handleCheck(checkPost(VALID_POST), checkEnv(sink))).status).toBe(303);
    expect(sink.points.map((point) => point.indexes[0])).toEqual([SITE_EVENT.formSubmit, SITE_EVENT.stored, SITE_EVENT.emailed]);
    expect(sink.points[0]?.blobs).toEqual([SITE_EVENT.formSubmit, CHECK_ROUTE, "self", "gbp", "organic", "oc", "1"]);

    turnstilePasses = false;
    const failed = recordingSink();
    expect((await handleCheck(checkPost(VALID_POST), checkEnv(failed))).status).toBe(403);
    expect(failed.points.map((point) => point.indexes[0])).toEqual([SITE_EVENT.formSubmit, SITE_EVENT.turnstileFail]);
  });

  it("never puts an ip, a name, an email, a message, a click id value or a full referrer url in an event", async () => {
    const sink = recordingSink();
    await visit(`/?gclid=${GCLID}&utm_source=${encodeURIComponent(PERSON.email)}`, sink, { referer: FULL_REFERER });
    await handleCheck(checkPost(VALID_POST, FULL_REFERER), checkEnv(sink));
    turnstilePasses = false;
    await handleCheck(checkPost(VALID_POST), checkEnv(sink));
    expect(sink.points.length).toBeGreaterThanOrEqual(5);
    const written = JSON.stringify(sink.points);
    for (const secret of [CLIENT_IP, PERSON.name, PERSON.email, PERSON.website, PERSON.message, GCLID, FULL_REFERER, "search", "client=pat"]) {
      expect(written).not.toContain(secret);
    }
    for (const point of sink.points) {
      expect(point.blobs).toHaveLength(EVENT_BLOBS.length);
      expect(point.doubles).toEqual([1]);
    }
  });

  it("returns the same response when the event write throws or the binding is missing", async () => {
    const path = `/?gclid=${GCLID}&utm_source=gbp`;
    const healthy = await visit(path, recordingSink());
    const broken = await visit(path, brokenSink);
    const unbound = await visit(path);
    const strip = (html: string): string => html.replace(/clicked_at=[^&"#]*/g, "");
    const healthyHtml = strip(await healthy.text());
    for (const response of [broken, unbound]) {
      expect(response.status).toBe(healthy.status);
      expect(strip(await response.text())).toBe(healthyHtml);
    }

    const sent: CheckEmail[] = [];
    const stored = new Map<string, string>();
    const response = await handleCheck(checkPost(VALID_POST), checkEnv(brokenSink, sent, stored));
    expect(response.status).toBe(303);
    expect(stored.size).toBe(1);
    expect(sent).toHaveLength(1);
  });
});

describe("privacy + scripts", () => {
  it("says the site has no analytics scripts and counts page views + form use on the server", async () => {
    const html = await (await visit(PRIVACY_ROUTE)).text();
    const decoded = html.replaceAll("&#x27;", "'").replaceAll("&amp;", "&");
    expect(decoded).toContain("no analytics scripts");
    expect(decoded).toContain(NO_SCRIPTS_LINE);
    expect(decoded).toContain(SERVER_COUNTING_LINE);
    expect(decoded).not.toMatch(/no analytics,/);
  });

  it("ships no client script from the worker, w/ tracking params, beyond the form page's Turnstile script", async () => {
    for (const route of HOME_ROUTES) {
      const html = await (await visit(`${route}?gclid=${GCLID}&utm_source=gbp`, recordingSink())).text();
      const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((match) => match[0]).filter((tag) => !tag.includes('type="application/ld+json"'));
      const allowed = route === SITE_CHECK_PAGE ? scripts.filter((tag) => !tag.includes(TURNSTILE_SCRIPT_SRC)) : scripts;
      expect(`${route}: ${allowed.join(" ")}`).toBe(`${route}: `);
      expect(html).not.toMatch(/<img[^>]*(pixel|\/e\/)/);
    }
  });
});

describe("weekly report", () => {
  it("sums the events + ranks sources, ignoring same-site page views", () => {
    const current = summarize(
      [
        { event: "page_view", n: "40" },
        { event: "form_view", n: "9" },
        { event: "form_submit", n: "3" },
        { event: "stored", n: "2" },
      ],
      [
        { utm_source: "gbp", referrer_host: "www.google.com", n: "10" },
        { utm_source: "", referrer_host: "www.google.com", n: "12" },
        { utm_source: "", referrer_host: "", n: "5" },
      ],
    );
    expect(current).toMatchObject({ visits: 27, formViews: 9, submits: 3, leads: 2 });
    const prior = summarize([{ event: "stored", n: 1 }], []);
    const report = formatReport(current, prior);
    expect(report).toContain("www.google.com");
    expect(report).toContain("(direct)");
    expect(report).toMatch(/leads\s+2\s+\(prior 1, \+1\)/);
    expect(sourcesSql("prior")).toContain("blob3 != 'self'");
    expect(() => readConfig({})).toThrow(TOKEN_ENV);
  });
});
