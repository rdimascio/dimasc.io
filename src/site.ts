import { serviceRoute } from "./services";

export const SITE_HOST = "dimasc.io";
export const SITE_URL = `https://${SITE_HOST}`;
export const WWW_HOST = `www.${SITE_HOST}`;

export const SERVICE_AREA = { county: "Orange County", state: "CA", cities: ["Tustin", "Corona"] } as const;
export const SERVICE_AREA_LABEL = `${SERVICE_AREA.county}, ${SERVICE_AREA.state}`;
export const SERVICE_AREA_COPY = SERVICE_AREA_LABEL.toLowerCase();
export const SERVICE_AREA_SHORT = SERVICE_AREA.county.toLowerCase();
export const SITE_NAME = "ryan dimascio";
export const SITE_NAME_PROPER = "Ryan DiMascio";
export const SITE_TAGLINE = "website help for small businesses";
export const CONTACT_EMAIL = "ryan@dimasc.io";
export const GITHUB_URL = "https://github.com/rdimascio";
export const ABOUT_ROUTE = "/about";
export const PRIVACY_ROUTE = "/privacy";

export const BOOKING_URL: string | null = null;
export const MAX_SUBSCRIPTION_CLIENTS: number | null = null;

const INTRO_EMAIL_BODY = ["your business + website:", "", "what's broken or slowing you down:", "", "anything w/ a deadline:", ""].join(
  "\n",
);

export function canonicalUrl(route: string): string {
  return route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
}

function mailto(subject: string, body = INTRO_EMAIL_BODY): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function introCallHref(): string {
  return BOOKING_URL ?? mailto("quick call");
}

export function introCallLabel(): string {
  return BOOKING_URL === null ? "email me to set up a call" : "book a 15-min call";
}

export function planHref(planName: string): string {
  return mailto(planName);
}

export const QUICK_FIX_MINUTES = 30;
export const SITE_CHECK_NAME = "free site check";
export const SITE_CHECK_CTA = "get a free site check";

export const SITE_CHECK_PAGE = serviceRoute("fix-my-website");
export const SITE_CHECK_ANCHOR = "check";

export function siteCheckHref(): string {
  return `${SITE_CHECK_PAGE}#${SITE_CHECK_ANCHOR}`;
}

export const HIRE_ANCHOR = {
  monthly: 7_700,
  source: "us bureau of labor statistics, median web developer pay, may 2025",
} as const;

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
