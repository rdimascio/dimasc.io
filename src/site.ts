export const SITE_URL = "https://dimasc.io";
export const SITE_NAME = "Ryan DiMascio";
export const CONTACT_EMAIL = "ryan@dimasc.io";
export const GITHUB_URL = "https://github.com/rdimascio";

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
