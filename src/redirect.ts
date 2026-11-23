import { AI_ROUTE, aiPricesHref, INTRO_CALL_ROUTE, SITE_HOST, SITE_URL, WWW_HOST } from "./site";

const MOVED_PERMANENTLY = 301;

export const RETIRED_ROUTES: Readonly<Record<string, string>> = {
  "/ai-front-desk": AI_ROUTE,
  "/services": AI_ROUTE,
  "/services/fix-my-website": INTRO_CALL_ROUTE,
  "/services/squarespace-wix-help": aiPricesHref(),
  "/services/new-website": aiPricesHref(),
  "/services/online-store": aiPricesHref(),
  "/services/online-booking": AI_ROUTE,
  "/services/website-care": AI_ROUTE,
  "/services/monthly-help": AI_ROUTE,
};

function needsCanonicalHost(url: URL): boolean {
  const isWww = url.hostname === WWW_HOST;
  const isPlainHttpApex = url.hostname === SITE_HOST && url.protocol === "http:";
  return isWww || isPlainHttpApex;
}

function withoutTrailingSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function retiredTarget(url: URL): string | null {
  const target = RETIRED_ROUTES[withoutTrailingSlash(url.pathname)];
  if (target === undefined) return null;
  const next = new URL(target, SITE_URL);
  next.search = url.search;
  return `${SITE_URL}${next.pathname}${next.search}${next.hash}`;
}

export function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const retired = retiredTarget(url);
  if (retired !== null) return Response.redirect(retired, MOVED_PERMANENTLY);
  if (!needsCanonicalHost(url)) return null;
  return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, MOVED_PERMANENTLY);
}
