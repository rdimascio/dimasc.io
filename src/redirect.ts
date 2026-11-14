import { SITE_HOST, SITE_URL, WWW_HOST } from "./site";

const MOVED_PERMANENTLY = 301;

function needsCanonicalHost(url: URL): boolean {
  const isWww = url.hostname === WWW_HOST;
  const isPlainHttpApex = url.hostname === SITE_HOST && url.protocol === "http:";
  return isWww || isPlainHttpApex;
}

export function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (!needsCanonicalHost(url)) return null;
  return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, MOVED_PERMANENTLY);
}
