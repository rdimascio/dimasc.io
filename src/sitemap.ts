import type { Article, CaseStudy } from "./content";
import { articleRoutes } from "./feed";
import { ABOUT_ROUTE } from "./site";
import { WORK_REQUEST_ROUTE, workRoutes } from "./work";

export const PROCESS_ROUTE = "/process";
export const NOINDEX_ROUTES: readonly string[] = [WORK_REQUEST_ROUTE];

export function siteRoutes(studies: readonly CaseStudy[], articles: readonly Article[], previewDrafts: boolean): string[] {
  return ["/", ABOUT_ROUTE, PROCESS_ROUTE, ...workRoutes(studies, previewDrafts), ...articleRoutes(articles)];
}

export function sitemapRoutes(studies: readonly CaseStudy[], articles: readonly Article[]): string[] {
  const published = articles.filter((article) => !article.draft);
  return siteRoutes(studies, published, false).filter((route) => !NOINDEX_ROUTES.includes(route));
}
