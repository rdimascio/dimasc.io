export const SITE_HOST = "dimasc.io";
export const SITE_URL = `https://${SITE_HOST}`;
export const WWW_HOST = `www.${SITE_HOST}`;

export const SERVICE_AREA = { county: "Orange County", state: "CA", cities: ["Tustin", "Corona"] } as const;
export const SERVICE_AREA_LABEL = `${SERVICE_AREA.county}, ${SERVICE_AREA.state}`;
export const SERVICE_AREA_COPY = SERVICE_AREA_LABEL.toLowerCase();
export const SERVICE_AREA_SHORT = SERVICE_AREA.county.toLowerCase();
export const SITE_NAME = "ryan dimascio";
export const SITE_NAME_PROPER = "Ryan DiMascio";
export const SITE_TAGLINE = "ai setup for local businesses";
export const CONTACT_EMAIL = "ryan@dimasc.io";
export const GITHUB_URL = "https://github.com/rdimascio";
export const ABOUT_ROUTE = "/about";
export const PRIVACY_ROUTE = "/privacy";

export const BOOKING_URL: string | null = null;
export const MAX_SUBSCRIPTION_CLIENTS: number | null = null;

export function canonicalUrl(route: string): string {
  return route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
}

export const AI_ROUTE = "/ai";
export const AI_NAME = "ai help for local businesses";
export const AI_PRICES_ANCHOR = "prices";
export const AI_TOOLS = "mindbody, jobber, vagaro, square, google, your phone line + your email";

export const INTRO_CALL_ROUTE = "/free-check";
export const INTRO_CALL_NAME = "free 15-min call";
export const INTRO_CALL_CTA = "get a free 15-min call";
export const INTRO_CALL_MINUTES = 15;

export function aiPricesHref(): string {
  return `${AI_ROUTE}#${AI_PRICES_ANCHOR}`;
}

export function introCallHref(): string {
  return BOOKING_URL ?? INTRO_CALL_ROUTE;
}

export function introCallLabel(): string {
  return INTRO_CALL_CTA;
}

export const OG_IMAGE_PATH = "/og.png";
export const OG_IMAGE_SOURCE = "assets/og.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = "Ryan DiMascio. Website help for small businesses.";

const PRELOADED_FONTS = ["/fonts/Geist-Variable.woff2", "/fonts/InstrumentSerif-Italic.woff2"] as const;
const IMMUTABLE_PATHS = ["/fonts/*", "/media/*"] as const;
const ONE_YEAR_SECONDS = 31_536_000;

export const HEADERS_FILE = [
  "/*",
  `  Strict-Transport-Security: max-age=${ONE_YEAR_SECONDS}; includeSubDomains`,
  "  X-Content-Type-Options: nosniff",
  ...PRELOADED_FONTS.map((font) => `  Link: <${font}>; rel=preload; as=font; type="font/woff2"; crossorigin`),
  ...IMMUTABLE_PATHS.flatMap((path) => [path, `  Cache-Control: public, max-age=${ONE_YEAR_SECONDS}, immutable`]),
  "",
].join("\n");
