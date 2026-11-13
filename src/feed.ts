import { ARTICLES_ROUTE, type Article } from "./content";
import { canonicalUrl, SITE_NAME, SITE_TAGLINE } from "./site";

export const FEED_ROUTE = `${ARTICLES_ROUTE}/feed.xml`;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

export function articlesFeed(articles: readonly Article[]): string {
  const items = articles
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${canonicalUrl(article.route)}</link>
      <guid isPermaLink="true">${canonicalUrl(article.route)}</guid>
      <pubDate>${rfc822(article.published)}</pubDate>
      <description>${escapeXml(article.summary)}</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`articles · ${SITE_NAME}`)}</title>
    <link>${canonicalUrl(ARTICLES_ROUTE)}</link>
    <atom:link href="${canonicalUrl(FEED_ROUTE)}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(SITE_TAGLINE)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
}

export function articleRoutes(articles: readonly Article[]): string[] {
  return articles.length === 0 ? [] : [ARTICLES_ROUTE, ...articles.map((article) => article.route)];
}
