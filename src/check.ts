import { AGENTS_ROUTE, AGENTS_SENT_ROUTE } from "./agents-routes";
import { type EventEnv, formContext, recordEvent, SITE_EVENT, type SiteEvent } from "./measure";
import { CONTACT_EMAIL, PRIVACY_ROUTE, SITE_CHECK_NAME, SITE_CHECK_PAGE, SITE_HOST, SITE_NAME, SITE_URL, siteCheckHref } from "./site";

export const CHECK_ROUTE = "/check";
export const CHECK_SENT_ROUTE = "/check/sent";
export const CHECK_PRIVACY_LINE = "what i do w/ what you send:";
export const CHECK_PRIVACY_LINK = "privacy";
export const REPO_CHECK_NAME = "repo check";

export const CHECK_FIELD = {
  name: "name",
  email: "email",
  website: "website",
  message: "message",
  source: "source",
  gclid: "gclid",
  gbraid: "gbraid",
  wbraid: "wbraid",
  clickedAt: "clicked_at",
  trap: "fax",
} as const;

export const CHECK_LIMIT = {
  name: 100,
  email: 254,
  website: 300,
  message: 4000,
  source: 300,
  clickId: 200,
} as const;

export const CLICK_ID_PARAMS = ["gclid", "gbraid", "wbraid"] as const;
export type ClickIdName = (typeof CLICK_ID_PARAMS)[number];
export type ClickIds = Readonly<Record<ClickIdName, string>>;
const CLICK_ID_SHAPE = new RegExp(`^[A-Za-z0-9_-]{1,${CHECK_LIMIT.clickId}}$`);
const ISO_INSTANT_SHAPE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const MAX_CLICK_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const NO_CLICK_IDS: ClickIds = { gclid: "", gbraid: "", wbraid: "" };

export const TURNSTILE_SITEKEY = "0x4AAAAAAGBM8jO7arL9_5TM";
export const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const TURNSTILE_ACTION = "turnstile-spin-v1";
export const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";
export const TURNSTILE_APPEARANCE = "interaction-only";
export const CHECK_INPUT_CLASS = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-[1.05rem] text-ink focus:border-ink focus:outline-none";
export const CHECK_LABEL_CLASS = "grid gap-2 text-[0.95rem] font-medium";
export const TURNSTILE_HOSTNAMES = [
  "dimasc.io",
  "www.dimasc.io",
  "dimasc-io.markd-site.workers.dev",
  "turnstile-dimasc-io.markd-site.workers.dev",
  "localhost",
  "127.0.0.1",
] as const;
const MAX_TURNSTILE_TOKEN_LENGTH = 2048;
const TURNSTILE_TIMEOUT_MS = 5000;

export const MAX_CHECK_BODY_BYTES = 16 * 1024;
export const CHECK_KEY_PREFIX = "check:";
export const CHECK_SENDER = `site@${SITE_HOST}`;

const SEE_OTHER = 303;
const ALLOWED_METHODS = "POST, GET, HEAD";
const FORM_CONTENT_TYPE = "application/x-www-form-urlencoded";
const SOURCE_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"] as const;
const SOURCE_UNSAFE = /[^\w.\-=&]/g;
const SINGLE_LINE_UNSAFE = /[\u0000-\u001f\u007f]/;
const MESSAGE_UNSAFE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNKNOWN_CLIENT = "unknown";

export interface CheckStore {
  put(key: string, value: string): Promise<void>;
}

export interface CheckRateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface CheckEmail {
  readonly to: string;
  readonly from: { email: string; name: string };
  readonly replyTo: string;
  readonly subject: string;
  readonly text: string;
}

export interface CheckMailer {
  send(message: CheckEmail): Promise<unknown>;
}

export interface CheckEnv extends EventEnv {
  readonly REQUESTS: CheckStore;
  readonly CHECK_LIMITER?: CheckRateLimiter;
  readonly EMAIL?: CheckMailer;
  readonly TURNSTILE_SECRET_KEY?: string;
}

export interface CheckContext {
  waitUntil(promise: Promise<unknown>): void;
}

export interface CheckRequest extends ClickIds {
  readonly id: string;
  readonly receivedAt: string;
  readonly name: string;
  readonly email: string;
  readonly website: string;
  readonly message: string;
  readonly source: string;
  readonly page: string;
  readonly clickedAt: string;
}

type Problem = { status: number; title: string; detail: string };

const PROBLEMS = {
  tooLarge: { status: 413, title: "that's too long", detail: `keep the note under ${CHECK_LIMIT.message} characters.` },
  badType: { status: 415, title: "that didn't send", detail: "the form came through in a shape i can't read." },
  missing: { status: 400, title: "a few things are missing", detail: "i need your name, your email + what's broken." },
  badEmail: { status: 400, title: "check your email address", detail: "i need a real email address to reply to." },
  tooMany: { status: 429, title: "slow down a sec", detail: "a lot of requests came from your connection. wait a minute + try again." },
  notHuman: { status: 403, title: "couldn't confirm you're human", detail: "i couldn't confirm you're human." },
} as const satisfies Record<string, Problem>;

interface SiteverifyResult {
  readonly success?: unknown;
  readonly hostname?: unknown;
  readonly "error-codes"?: unknown;
}

type HumanCheck = { ok: true } | { ok: false; event: string; codes: readonly string[] };

const ALLOWED_TURNSTILE_HOSTS: ReadonlySet<string> = new Set(TURNSTILE_HOSTNAMES);

function errorCodes(result: SiteverifyResult): string[] {
  const codes = result["error-codes"];
  return Array.isArray(codes) ? codes.filter((code): code is string => typeof code === "string") : [];
}

export async function verifyHuman(token: string, secret: string | undefined, remoteip: string | null, idempotencyKey: string): Promise<HumanCheck> {
  if (token === "" || token.length > MAX_TURNSTILE_TOKEN_LENGTH) return { ok: false, event: "turnstile_missing", codes: [] };
  if (secret === undefined || secret === "") return { ok: false, event: "turnstile_unconfigured", codes: [] };
  const body: Record<string, string> = { secret, response: token, idempotency_key: idempotencyKey };
  if (remoteip !== null) body.remoteip = remoteip;
  let result: SiteverifyResult;
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, event: "turnstile_unreachable", codes: [`http_${response.status}`] };
    result = (await response.json()) as SiteverifyResult;
  } catch {
    return { ok: false, event: "turnstile_unreachable", codes: [] };
  }
  if (result.success !== true) return { ok: false, event: "turnstile_failed", codes: errorCodes(result) };
  if (typeof result.hostname !== "string" || !ALLOWED_TURNSTILE_HOSTS.has(result.hostname)) {
    return { ok: false, event: "turnstile_wrong_host", codes: [] };
  }
  return { ok: true };
}

export function sourceFromQuery(params: URLSearchParams): string {
  const kept = new URLSearchParams();
  for (const name of SOURCE_PARAMS) {
    const value = params.get(name);
    if (value !== null && value !== "") kept.set(name, value);
  }
  return cleanSource(kept.toString());
}

function cleanSource(value: string): string {
  return value.replace(SOURCE_UNSAFE, "").slice(0, CHECK_LIMIT.source);
}

export function cleanClickId(value: string | null): string {
  return value !== null && CLICK_ID_SHAPE.test(value) ? value : "";
}

function readClickIds(read: (name: ClickIdName) => string | null): ClickIds {
  return { gclid: cleanClickId(read("gclid")), gbraid: cleanClickId(read("gbraid")), wbraid: cleanClickId(read("wbraid")) };
}

export function clickIdsFromQuery(params: URLSearchParams): ClickIds {
  return readClickIds((name) => params.get(name));
}

export function hasClickId(ids: ClickIds): boolean {
  return CLICK_ID_PARAMS.some((name) => ids[name] !== "");
}

export function cleanClickedAt(value: string, receivedAt: string): string {
  if (!ISO_INSTANT_SHAPE.test(value)) return "";
  const clicked = Date.parse(value);
  const received = Date.parse(receivedAt);
  if (Number.isNaN(clicked) || clicked > received || received - clicked > MAX_CLICK_AGE_MS) return "";
  return value;
}

export function adClickLine(record: ClickIds & { clickedAt: string }): string {
  const ids = CLICK_ID_PARAMS.filter((name) => record[name] !== "").map((name) => `${name} ${record[name]}`);
  if (ids.length === 0) return "ad click: (none)";
  const when = record.clickedAt === "" ? "" : ` (clicked ${record.clickedAt})`;
  return `ad click: ${ids.join(", ")}${when}`;
}

function refererUrl(request: Request): URL | null {
  const referer = request.headers.get("referer");
  if (referer === null) return null;
  try {
    return new URL(referer);
  } catch {
    return null;
  }
}

function isOversize(value: string, limit: number): boolean {
  return value.length > limit;
}

export function parseCheck(params: URLSearchParams, request: Request): CheckRequest | Problem {
  const field = (name: string): string => (params.get(name) ?? "").trim();
  const name = field(CHECK_FIELD.name);
  const email = field(CHECK_FIELD.email);
  const website = field(CHECK_FIELD.website);
  const message = field(CHECK_FIELD.message);
  const postedSource = cleanSource(field(CHECK_FIELD.source));

  if (name === "" || email === "" || message === "") return PROBLEMS.missing;
  const oversize =
    isOversize(name, CHECK_LIMIT.name) ||
    isOversize(email, CHECK_LIMIT.email) ||
    isOversize(website, CHECK_LIMIT.website) ||
    isOversize(message, CHECK_LIMIT.message);
  if (oversize) return PROBLEMS.tooLarge;
  if ([name, email, website].some((value) => SINGLE_LINE_UNSAFE.test(value)) || MESSAGE_UNSAFE.test(message)) return PROBLEMS.badType;
  if (!EMAIL_SHAPE.test(email)) return PROBLEMS.badEmail;

  const referer = refererUrl(request);
  const source = postedSource !== "" ? postedSource : referer === null ? "" : sourceFromQuery(referer.searchParams);
  const postedClickIds = readClickIds((name) => field(CHECK_FIELD[name]));
  const clickIds = hasClickId(postedClickIds) || referer === null ? postedClickIds : clickIdsFromQuery(referer.searchParams);
  const receivedAt = new Date().toISOString();
  const clickedAt = hasClickId(clickIds) ? cleanClickedAt(field(CHECK_FIELD.clickedAt), receivedAt) : "";
  return {
    id: crypto.randomUUID(),
    receivedAt,
    name,
    email,
    website,
    message,
    source,
    page: referer?.pathname ?? "",
    ...clickIds,
    clickedAt,
  };
}

export function checkKey(record: Pick<CheckRequest, "id" | "receivedAt">): string {
  return `${CHECK_KEY_PREFIX}${record.receivedAt}:${record.id}`;
}

export function checkEmail(record: CheckRequest): CheckEmail {
  const lines = [
    `name: ${record.name}`,
    `email: ${record.email}`,
    `website: ${record.website === "" ? "(none)" : record.website}`,
    `source: ${record.source === "" ? "(direct)" : record.source}`,
    `page: ${record.page === "" ? "(unknown)" : record.page}`,
    adClickLine(record),
    `received: ${record.receivedAt}`,
    `id: ${record.id}`,
    "",
    "what's broken or bugging them:",
    record.message,
  ];
  return {
    to: CONTACT_EMAIL,
    from: { email: CHECK_SENDER, name: SITE_NAME },
    replyTo: record.email,
    subject: `${record.page === AGENTS_ROUTE ? REPO_CHECK_NAME : SITE_CHECK_NAME}: ${record.name}`,
    text: lines.join("\n"),
  };
}

function seeOther(location: string): Response {
  return new Response(null, { status: SEE_OTHER, headers: { location } });
}

export function renderCheckProblem(problem: Pick<Problem, "title" | "detail">): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${problem.title} · ${SITE_NAME}</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="max-w-[36rem] mx-auto py-28 px-6">
      <h1 class="text-4xl mb-4 tracking-[-0.04em] font-semibold">${problem.title}</h1>
      <p class="text-muted">${problem.detail}</p>
      <p class="text-muted">go <a class="underline underline-offset-4" href="${siteCheckHref()}">back to the form</a>, or email me at <a class="underline underline-offset-4" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
    </main>
  </body>
</html>`;
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

export type CheckDraft = Pick<CheckRequest, "name" | "email" | "website" | "message" | "source" | ClickIdName | "clickedAt">;

export function renderCheckRetry(problem: Pick<Problem, "title" | "detail">, draft: CheckDraft): string {
  const value = (text: string): string => `value="${escapeHtml(text)}"`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${problem.title} · ${SITE_NAME}</title>
    <link rel="stylesheet" href="/styles.css" />
    <script async defer src="${TURNSTILE_SCRIPT_SRC}"></script>
  </head>
  <body>
    <main class="max-w-[40rem] mx-auto py-28 px-6">
      <h1 class="text-4xl mb-4 tracking-[-0.04em] font-semibold">${problem.title}</h1>
      <p class="text-muted">${problem.detail} your note is still here. hit send again.</p>
      <form class="mt-8 grid gap-5" action="${CHECK_ROUTE}" method="post">
        <label class="${CHECK_LABEL_CLASS}">your name
          <input class="${CHECK_INPUT_CLASS}" autocomplete="name" maxlength="${CHECK_LIMIT.name}" name="${CHECK_FIELD.name}" required type="text" ${value(draft.name)} />
        </label>
        <label class="${CHECK_LABEL_CLASS}">your email
          <input class="${CHECK_INPUT_CLASS}" autocomplete="email" maxlength="${CHECK_LIMIT.email}" name="${CHECK_FIELD.email}" required type="email" ${value(draft.email)} />
        </label>
        <label class="${CHECK_LABEL_CLASS}">your website (optional)
          <input class="${CHECK_INPUT_CLASS}" autocomplete="url" inputmode="url" maxlength="${CHECK_LIMIT.website}" name="${CHECK_FIELD.website}" type="text" ${value(draft.website)} />
        </label>
        <label class="${CHECK_LABEL_CLASS}">what's broken or bugging you
          <textarea class="${CHECK_INPUT_CLASS} min-h-[9rem]" maxlength="${CHECK_LIMIT.message}" name="${CHECK_FIELD.message}" required rows="5">${escapeHtml(draft.message)}</textarea>
        </label>
        <input name="${CHECK_FIELD.source}" type="hidden" ${value(draft.source)} />
        ${CLICK_ID_PARAMS.map((name) => `<input name="${CHECK_FIELD[name]}" type="hidden" ${value(draft[name])} />`).join("\n        ")}
        <input name="${CHECK_FIELD.clickedAt}" type="hidden" ${value(draft.clickedAt)} />
        <div aria-hidden="true" class="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label>leave this empty <input autocomplete="off" name="${CHECK_FIELD.trap}" tabindex="-1" type="text" /></label>
        </div>
        <div class="cf-turnstile" data-action="${TURNSTILE_ACTION}" data-appearance="${TURNSTILE_APPEARANCE}" data-sitekey="${TURNSTILE_SITEKEY}"></div>
        <div><button class="rounded-full bg-accent px-7 py-3 font-medium text-on-accent hover:opacity-90" type="submit">send it</button></div>
      </form>
      <p class="mt-8 text-muted">or email me at <a class="underline underline-offset-4" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
      <p class="text-muted">${CHECK_PRIVACY_LINE} <a class="underline underline-offset-4" href="${PRIVACY_ROUTE}">${CHECK_PRIVACY_LINK}</a></p>
    </main>
  </body>
</html>`;
}

function retryResponse(problem: Problem, draft: CheckDraft): Response {
  return new Response(renderCheckRetry(problem, draft), {
    status: problem.status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function problemResponse(problem: Problem, headers: Record<string, string> = {}): Response {
  return new Response(renderCheckProblem(problem), {
    status: problem.status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

function methodNotAllowed(): Response {
  return new Response("method not allowed", { status: 405, headers: { allow: ALLOWED_METHODS } });
}

function declaredLength(request: Request): number | null {
  const header = request.headers.get("content-length");
  if (header === null || !/^\d+$/.test(header.trim())) return null;
  return Number(header);
}

export async function readBoundedBody(request: Request, maxBytes = MAX_CHECK_BODY_BYTES): Promise<string | null> {
  const declared = declaredLength(request);
  if (declared !== null && declared > maxBytes) return null;
  if (request.body === null) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function deliver(mailer: CheckMailer, record: CheckRequest, onDelivered: () => void): Promise<void> {
  try {
    await mailer.send(checkEmail(record));
    console.log(JSON.stringify({ event: "check_delivered", id: record.id }));
    onDelivered();
  } catch (error) {
    const code = (error as { code?: unknown }).code;
    console.log(JSON.stringify({ event: "check_delivery_failed", id: record.id, code: typeof code === "string" ? code : "unknown" }));
  }
}

export async function handleCheck(request: Request, env: CheckEnv, ctx?: CheckContext): Promise<Response> {
  if (request.method === "GET" || request.method === "HEAD") return seeOther(siteCheckHref());
  if (request.method !== "POST") return methodNotAllowed();

  const contentType = (request.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase();
  if (contentType !== FORM_CONTENT_TYPE) return problemResponse(PROBLEMS.badType);

  const body = await readBoundedBody(request);
  if (body === null) return problemResponse(PROBLEMS.tooLarge);
  const params = new URLSearchParams(body);

  if ((params.get(CHECK_FIELD.trap) ?? "") !== "") return seeOther(CHECK_SENT_ROUTE);
  const record = (event: SiteEvent): void => recordEvent(env, event, () => formContext(request, params));
  record(SITE_EVENT.formSubmit);

  const client = request.headers.get("cf-connecting-ip") ?? UNKNOWN_CLIENT;
  if (env.CHECK_LIMITER !== undefined) {
    const { success } = await env.CHECK_LIMITER.limit({ key: client });
    if (!success) return problemResponse(PROBLEMS.tooMany, { "retry-after": "60" });
  }

  const parsed = parseCheck(params, request);
  if (!("id" in parsed)) return problemResponse(parsed);

  const token = (params.get(TURNSTILE_RESPONSE_FIELD) ?? "").trim();
  const human = await verifyHuman(token, env.TURNSTILE_SECRET_KEY, request.headers.get("cf-connecting-ip"), parsed.id);
  if (!human.ok) {
    console.log(JSON.stringify({ event: human.event, codes: human.codes }));
    record(SITE_EVENT.turnstileFail);
    return retryResponse(PROBLEMS.notHuman, parsed);
  }

  await env.REQUESTS.put(checkKey(parsed), JSON.stringify(parsed));
  console.log(JSON.stringify({ event: "check_stored", id: parsed.id, mailer: env.EMAIL !== undefined }));
  record(SITE_EVENT.stored);

  if (env.EMAIL !== undefined) {
    const delivery = deliver(env.EMAIL, parsed, () => record(SITE_EVENT.emailed));
    if (ctx === undefined) await delivery;
    else ctx.waitUntil(delivery);
  }

  return seeOther(sentRouteFor(parsed.page));
}

export function sentRouteFor(page: string): string {
  return page === AGENTS_ROUTE ? AGENTS_SENT_ROUTE : CHECK_SENT_ROUTE;
}

export function isCheckRoute(pathname: string): boolean {
  return pathname === CHECK_ROUTE;
}

export const CHECK_FORM_PAGES: readonly string[] = [SITE_CHECK_PAGE, AGENTS_ROUTE];

export function isCheckFormPage(pathname: string): boolean {
  return CHECK_FORM_PAGES.includes(pathname);
}

export function formFills(url: URL, now: Date = new Date()): Record<string, string> {
  const fills: Record<string, string> = {};
  const source = sourceFromQuery(url.searchParams);
  if (source !== "") fills[CHECK_FIELD.source] = source;
  const clickIds = clickIdsFromQuery(url.searchParams);
  for (const name of CLICK_ID_PARAMS) {
    if (clickIds[name] !== "") fills[CHECK_FIELD[name]] = clickIds[name];
  }
  if (hasClickId(clickIds)) fills[CHECK_FIELD.clickedAt] = clickedAtFromQuery(url.searchParams, now);
  return fills;
}

function clickedAtFromQuery(params: URLSearchParams, now: Date): string {
  const carried = cleanClickedAt(params.get(CHECK_FIELD.clickedAt) ?? "", now.toISOString());
  return carried !== "" ? carried : now.toISOString();
}

export function carriedQuery(url: URL, now: Date = new Date()): string {
  const carried = new URLSearchParams(sourceFromQuery(url.searchParams));
  const clickIds = clickIdsFromQuery(url.searchParams);
  for (const name of CLICK_ID_PARAMS) {
    if (clickIds[name] !== "") carried.set(CHECK_FIELD[name], clickIds[name]);
  }
  if (hasClickId(clickIds)) carried.set(CHECK_FIELD.clickedAt, clickedAtFromQuery(url.searchParams, now));
  return carried.toString();
}

export function formHrefWithQuery(href: string, query: string): string {
  const target = new URL(href, SITE_URL);
  if (target.origin !== SITE_URL || target.pathname !== SITE_CHECK_PAGE) return href;
  for (const [name, value] of new URLSearchParams(query)) target.searchParams.set(name, value);
  return `${target.pathname}${target.search}${target.hash}`;
}

function isHtmlResponse(response: Response): boolean {
  return (response.headers.get("content-type") ?? "").includes("text/html");
}

function privateCopy(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("cache-control", "private, no-store");
  headers.delete("etag");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function withParamsCarried(response: Response, url: URL, now: Date = new Date()): Response {
  const query = carriedQuery(url, now);
  if (query === "" || !isHtmlResponse(response)) return response;
  const rewriter = new HTMLRewriter().on(`a[href^="${SITE_CHECK_PAGE}"]`, {
    element(element) {
      const href = element.getAttribute("href");
      if (href !== null) element.setAttribute("href", formHrefWithQuery(href, query));
    },
  });
  return privateCopy(rewriter.transform(response));
}

export function withFormFilled(response: Response, url: URL, now: Date = new Date()): Response {
  const fills = Object.entries(formFills(url, now));
  if (fills.length === 0 || !isHtmlResponse(response)) return response;
  const rewriter = new HTMLRewriter();
  for (const [name, fill] of fills) {
    rewriter.on(`input[name="${name}"]`, {
      element(element) {
        element.setAttribute("value", fill);
      },
    });
  }
  return privateCopy(rewriter.transform(response));
}
