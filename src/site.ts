export const SITE_URL = "https://dimasc.io";
export const SITE_NAME = "Ryan DiMascio";
export const CONTACT_EMAIL = "ryan@dimasc.io";
export const GITHUB_URL = "https://github.com/rdimascio";
export const ABOUT_ROUTE = "/about";

export const BOOKING_URL: string | null = null;
export const MAX_SUBSCRIPTION_CLIENTS: number | null = null;

const INTRO_EMAIL_BODY = ["Business name and website:", "", "What's slowing you down:", "", "Anything with a deadline:", ""].join(
  "\n",
);

export function canonicalUrl(route: string): string {
  return route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
}

function mailto(subject: string, body = INTRO_EMAIL_BODY): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function introCallHref(): string {
  return BOOKING_URL ?? mailto("Intro call");
}

export function introCallLabel(): string {
  return BOOKING_URL === null ? "Email to book a call" : "Book a 15-minute call";
}

export function planHref(planName: string): string {
  return mailto(`${planName} plan`);
}

export const OG_IMAGE_PATH = "/og.png";
export const OG_IMAGE_SOURCE = "assets/og.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = "Ryan DiMascio, software engineer on subscription. Websites, stores and tools, fixed every week.";

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
