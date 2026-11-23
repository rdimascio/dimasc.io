import { FREE_CHECK_ROUTE, FRONT_DESK_ROUTE, SITE_HOST, SITE_URL, websiteFixHref, WWW_HOST } from "./site";

const MOVED_PERMANENTLY = 301;

export const RETIRED_ROUTES: Readonly<Record<string, string>> = {
  "/services": FRONT_DESK_ROUTE,
  "/services/fix-my-website": FREE_CHECK_ROUTE,
  "/services/squarespace-wix-help": websiteFixHref(),
  "/services/new-website": websiteFixHref(),
  "/services/online-store": websiteFixHref(),
  "/services/online-booking": FRONT_DESK_ROUTE,
  "/services/website-care": FRONT_DESK_ROUTE,
  "/services/monthly-help": FRONT_DESK_ROUTE,
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
