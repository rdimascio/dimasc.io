import { CHECK_FIELD, CLICK_ID_PARAMS, cleanClickId, clickIdsFromQuery, hasClickId, sourceFromQuery } from "./check";

export const EVENTS_DATASET = "dimasc_events";

export const SITE_EVENT = {
  pageView: "page_view",
  formView: "form_view",
  formSubmit: "form_submit",
  turnstileFail: "turnstile_fail",
  stored: "stored",
  emailed: "emailed",
  kitClick: "kit_click",
  teardownClick: "teardown_click",
} as const;
export type SiteEvent = (typeof SITE_EVENT)[keyof typeof SITE_EVENT];

export const EVENT_BLOBS = ["event", "path", "referrer_host", "utm_source", "utm_medium", "utm_campaign", "has_gclid"] as const;

export const SAME_SITE_REFERRER = "self";
const MAX_BLOB_LENGTH = 64;
const MAX_PATH_LENGTH = 200;
const HOST_SHAPE = /^[a-z0-9.-]+$/;
const BOT_USER_AGENT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse/i;
const EVENT_COUNT = 1;
const FLAG_ON = "1";
const FLAG_OFF = "0";

export interface EventPoint {
  readonly indexes: [string];
  readonly blobs: string[];
  readonly doubles: number[];
}

export interface EventSink {
  writeDataPoint(point: EventPoint): void;
}

export interface EventEnv {
  readonly EVENTS?: EventSink;
}

export interface EventContext {
  readonly path: string;
  readonly referrerHost: string;
  readonly utmSource: string;
  readonly utmMedium: string;
  readonly utmCampaign: string;
  readonly hasGclid: boolean;
}

export function referrerHost(referer: string | null, siteHost: string): string {
  if (referer === null || referer === "") return "";
  let host: string;
  try {
    host = new URL(referer).hostname.toLowerCase();
  } catch {
    return "";
  }
  if (host === siteHost) return SAME_SITE_REFERRER;
  return HOST_SHAPE.test(host) ? host.slice(0, MAX_BLOB_LENGTH) : "";
}

function utmFrom(source: string): Pick<EventContext, "utmSource" | "utmMedium" | "utmCampaign"> {
  const kept = new URLSearchParams(sourceFromQuery(new URLSearchParams(source)));
  const read = (name: string): string => (kept.get(name) ?? "").slice(0, MAX_BLOB_LENGTH);
  return { utmSource: read("utm_source"), utmMedium: read("utm_medium"), utmCampaign: read("utm_campaign") };
}

export function pageContext(request: Request): EventContext {
  const url = new URL(request.url);
  return {
    path: url.pathname.slice(0, MAX_PATH_LENGTH),
    referrerHost: referrerHost(request.headers.get("referer"), url.hostname),
    ...utmFrom(url.search),
    hasGclid: hasClickId(clickIdsFromQuery(url.searchParams)),
  };
}

export function formContext(request: Request, posted: URLSearchParams): EventContext {
  const page = pageContext(request);
  const refererQuery = refererSearch(request);
  const postedSource = posted.get(CHECK_FIELD.source) ?? "";
  const postedClickId = CLICK_ID_PARAMS.some((name) => cleanClickId(posted.get(CHECK_FIELD[name])) !== "");
  return {
    ...page,
    ...utmFrom(postedSource !== "" ? postedSource : refererQuery),
    hasGclid: postedClickId || hasClickId(clickIdsFromQuery(new URLSearchParams(refererQuery))),
  };
}

function refererSearch(request: Request): string {
  const referer = request.headers.get("referer");
  if (referer === null) return "";
  try {
    return new URL(referer).search;
  } catch {
    return "";
  }
}

export function clickContext(request: Request): EventContext {
  const landingQuery = refererSearch(request);
  return {
    ...pageContext(request),
    ...utmFrom(landingQuery),
    hasGclid: hasClickId(clickIdsFromQuery(new URLSearchParams(landingQuery))),
  };
}

export function isBot(request: Request): boolean {
  return BOT_USER_AGENT.test(request.headers.get("user-agent") ?? "");
}

export function eventPoint(event: SiteEvent, context: EventContext): EventPoint {
  return {
    indexes: [event],
    blobs: [
      event,
      context.path,
      context.referrerHost,
      context.utmSource,
      context.utmMedium,
      context.utmCampaign,
      context.hasGclid ? FLAG_ON : FLAG_OFF,
    ],
    doubles: [EVENT_COUNT],
  };
}

export function recordEvent(env: EventEnv, event: SiteEvent, context: () => EventContext): void {
  if (env.EVENTS === undefined) return;
  try {
    env.EVENTS.writeDataPoint(eventPoint(event, context()));
  } catch {
    return;
  }
}

export function isCountedPageView(request: Request, response: Response): boolean {
  const isHtml = (response.headers.get("content-type") ?? "").includes("text/html");
  return request.method === "GET" && response.status === 200 && isHtml && !isBot(request);
}

export function recordPageView(env: EventEnv, request: Request, response: Response, isFormPage: boolean): void {
  try {
    if (!isCountedPageView(request, response)) return;
  } catch {
    return;
  }
  const context = (): EventContext => pageContext(request);
  recordEvent(env, SITE_EVENT.pageView, context);
  if (isFormPage) recordEvent(env, SITE_EVENT.formView, context);
}
