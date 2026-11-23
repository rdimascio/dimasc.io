import type { Article, CaseStudy } from "./content";
import { CHECK_SENT_ROUTE } from "./check";
import { articleRoutes } from "./feed";
import { ORANGE_COUNTY_ROUTE } from "./front-desk";
import { ABOUT_ROUTE, FREE_CHECK_ROUTE, FRONT_DESK_ROUTE, PRIVACY_ROUTE } from "./site";
import { WORK_REQUEST_ROUTE, workRoutes } from "./work";
import { YOUTH_SPORTS_ROUTE } from "./youth-sports";

export const PROCESS_ROUTE = "/process";
export const NOINDEX_ROUTES: readonly string[] = [WORK_REQUEST_ROUTE, CHECK_SENT_ROUTE];

export function siteRoutes(studies: readonly CaseStudy[], articles: readonly Article[], previewDrafts: boolean): string[] {
  return ["/", FRONT_DESK_ROUTE, FREE_CHECK_ROUTE, YOUTH_SPORTS_ROUTE, ORANGE_COUNTY_ROUTE, ABOUT_ROUTE, PROCESS_ROUTE, PRIVACY_ROUTE, CHECK_SENT_ROUTE, ...workRoutes(studies, previewDrafts), ...articleRoutes(articles)];
}

export function sitemapRoutes(studies: readonly CaseStudy[], articles: readonly Article[]): string[] {
  const published = articles.filter((article) => !article.draft);
  return siteRoutes(studies, published, false).filter((route) => !NOINDEX_ROUTES.includes(route));
}
