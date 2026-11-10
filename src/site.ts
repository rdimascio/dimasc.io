export const SITE_URL = "https://dimasc.io";
export const SITE_NAME = "Ryan DiMascio";
export const CONTACT_EMAIL = "ryan@dimasc.io";

export function canonicalUrl(route: string): string {
  return route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
}
