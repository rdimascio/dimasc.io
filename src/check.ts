import { CONTACT_EMAIL, SITE_CHECK_NAME, SITE_CHECK_PAGE, SITE_HOST, SITE_NAME, siteCheckHref } from "./site";

export const CHECK_ROUTE = "/check";
export const CHECK_SENT_ROUTE = "/check/sent";

export const CHECK_FIELD = {
  name: "name",
  email: "email",
  website: "website",
  message: "message",
  source: "source",
  trap: "fax",
} as const;

export const CHECK_LIMIT = {
  name: 100,
  email: 254,
  website: 300,
  message: 4000,
  source: 300,
} as const;

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

export interface CheckEnv {
  readonly REQUESTS: CheckStore;
  readonly CHECK_LIMITER?: CheckRateLimiter;
  readonly EMAIL?: CheckMailer;
}

export interface CheckContext {
  waitUntil(promise: Promise<unknown>): void;
}

export interface CheckRequest {
  readonly id: string;
  readonly receivedAt: string;
  readonly name: string;
  readonly email: string;
  readonly website: string;
  readonly message: string;
  readonly source: string;
  readonly page: string;
}

type Problem = { status: number; title: string; detail: string };

const PROBLEMS = {
  tooLarge: { status: 413, title: "that's too long", detail: `keep the note under ${CHECK_LIMIT.message} characters.` },
  badType: { status: 415, title: "that didn't send", detail: "the form came through in a shape i can't read." },
  missing: { status: 400, title: "a few things are missing", detail: "i need your name, your email + what's broken." },
  badEmail: { status: 400, title: "check your email address", detail: "i need a real email address to reply to." },
  tooMany: { status: 429, title: "slow down a sec", detail: "a lot of requests came from your connection. wait a minute + try again." },
} as const satisfies Record<string, Problem>;

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
  return {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    name,
    email,
    website,
    message,
    source,
    page: referer?.pathname ?? "",
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
    subject: `${SITE_CHECK_NAME}: ${record.name}`,
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

function problemResponse(problem: Problem, headers: Record<string, string> = {}): Response {
  return new Response(renderCheckProblem(problem), {
    status: problem.status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

function methodNotAllowed(): Response {
  return new Response("method not allowed", { status: 405, headers: { allow: ALLOWED_METHODS } });
}

async function readBoundedBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_CHECK_BODY_BYTES) return null;
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_CHECK_BODY_BYTES) return null;
  return new TextDecoder().decode(bytes);
}

async function deliver(mailer: CheckMailer, record: CheckRequest): Promise<void> {
  try {
    await mailer.send(checkEmail(record));
    console.log(JSON.stringify({ event: "check_delivered", id: record.id }));
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

  const client = request.headers.get("cf-connecting-ip") ?? UNKNOWN_CLIENT;
  if (env.CHECK_LIMITER !== undefined) {
    const { success } = await env.CHECK_LIMITER.limit({ key: client });
    if (!success) return problemResponse(PROBLEMS.tooMany, { "retry-after": "60" });
  }

  const parsed = parseCheck(params, request);
  if (!("id" in parsed)) return problemResponse(parsed);

  await env.REQUESTS.put(checkKey(parsed), JSON.stringify(parsed));
  console.log(JSON.stringify({ event: "check_stored", id: parsed.id, mailer: env.EMAIL !== undefined }));

  if (env.EMAIL !== undefined) {
    const delivery = deliver(env.EMAIL, parsed);
    if (ctx === undefined) await delivery;
    else ctx.waitUntil(delivery);
  }

  return seeOther(CHECK_SENT_ROUTE);
}

export function isCheckRoute(pathname: string): boolean {
  return pathname === CHECK_ROUTE;
}

export function isCheckFormPage(pathname: string): boolean {
  return pathname === SITE_CHECK_PAGE;
}

export function withSourceFilled(response: Response, url: URL): Response {
  const source = sourceFromQuery(url.searchParams);
  const isHtml = (response.headers.get("content-type") ?? "").includes("text/html");
  if (source === "" || !isHtml) return response;
  return new HTMLRewriter()
    .on(`input[name="${CHECK_FIELD.source}"]`, {
      element(element) {
        element.setAttribute("value", source);
      },
    })
    .transform(response);
}
