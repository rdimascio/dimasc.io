export const SITE_URL = "https://dimasc.io";
export const SITE_NAME = "Ryan DiMascio";
export const CONTACT_EMAIL = "ryan@dimasc.io";

export function canonicalUrl(route: string): string {
  return route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
}

function mailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function introCallHref(): string {
  return mailto("Intro call");
}

export function planHref(planName: string): string {
  return mailto(`${planName} plan`);
}
