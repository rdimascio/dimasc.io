import type { LestoAppConfig } from "@lesto/kernel";
import { openSqlite } from "@lesto/runtime";
import type { PageMetadata } from "@lesto/web";
import { lesto } from "@lesto/web";

import { ARTICLES_ROUTE, loadAllCaseStudies, loadArticles, loadExperience, loadFaq, loadPlans, loadProcess, type Plan } from "./content";
import { FEED_ROUTE } from "./feed";
import {
  AGENTS_OG_IMAGE,
  canonicalUrl,
  type OgImage,
  PRIVACY_ROUTE,
  SERVICE_AREA_COPY,
  SERVICE_AREA_SHORT,
  SITE_NAME,
  SITE_URL,
  STUDIO_OG_IMAGE,
} from "./site";
import { AGENTS_ROUTE, AGENTS_SENT_ROUTE } from "./agents";
import { makeAbout } from "./ui/about";
import { AGENTS_DESCRIPTION, AGENTS_SENT_HEADLINE, AGENTS_TITLE, makeAgents, makeAgentsSent } from "./ui/agents";
import { ARTICLES_LEDE, makeArticle, makeArticlesIndex } from "./ui/articles";
import { makeHome, startingPricesLine } from "./ui/home";
import { ABOUT_ROUTE, makeSiteLayout } from "./ui/layout";
import { NOINDEX_ROUTES, PROCESS_ROUTE } from "./sitemap";
import { makeProcess } from "./ui/process";
import { makeOrangeCounty, makeServicePage, makeServicesIndex, SERVICES_LEDE } from "./ui/service";
import { ORANGE_COUNTY_ROUTE, serviceRoute, SERVICES, SERVICES_ROUTE } from "./services";
import { makeCheckSent } from "./ui/check";
import { makePrivacy, PRIVACY_DESCRIPTION, PRIVACY_TITLE } from "./ui/privacy";
import { CHECK_SENT_ROUTE } from "./check";
import { makeCaseStudy, makeWorkIndex, makeWorkRequest } from "./ui/work";
import { previewDraftsFromEnv } from "./preview";
import { WORK_REQUEST_ROUTE, WORK_ROUTE } from "./work";

export { canonicalUrl, SITE_URL };

function imageMeta(image: OgImage): NonNullable<PageMetadata["meta"]> {
  const url = `${SITE_URL}${image.path}`;
  return [
    { property: "og:image", content: url },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: String(image.width) },
    { property: "og:image:height", content: String(image.height) },
    { property: "og:image:alt", content: image.alt },
    { name: "twitter:image", content: url },
    { name: "twitter:image:alt", content: image.alt },
  ];
}

export function seoMetadata(input: {
  title: string;
  description: string;
  route: string;
  type: "website" | "article";
  image?: OgImage;
}): PageMetadata {
  const url = canonicalUrl(input.route);
  const image = input.image ?? STUDIO_OG_IMAGE;
  return {
    title: input.title,
    description: input.description,
    meta: [
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: input.title },
      { property: "og:type", content: input.type },
      { property: "og:url", content: url },
      { property: "og:description", content: input.description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: input.title },
      { name: "twitter:description", content: input.description },
      ...imageMeta(image),
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  };
}

export interface BuildOptions {
  readonly previewDrafts: boolean;
}

function withFeedLink(metadata: PageMetadata): PageMetadata {
  const feed = { rel: "alternate", href: FEED_ROUTE, type: "application/rss+xml" };
  return { ...metadata, links: [...(metadata.links ?? []), feed] };
}

const NOINDEX = { name: "robots", content: "noindex" } as const;
const NOINDEX_FOLLOW = { name: "robots", content: "noindex, follow" } as const;

export const SERVICES_TITLE = `website services for small businesses · ${SITE_NAME}`;
export const ORANGE_COUNTY_TITLE = `small business website help, ${SERVICE_AREA_SHORT} ca · ${SITE_NAME}`;
export const ORANGE_COUNTY_DESCRIPTION = `senior software engineer based in ${SERVICE_AREA_COPY}. i fix, build + look after websites for small businesses here, and meet in person around oc.`;

export function serviceTitle(title: string): string {
  return `${title} · ${SITE_NAME}`;
}

export const HOME_TITLE = `small business website help in ${SERVICE_AREA_SHORT} · ${SITE_NAME}`;

function withMeta(metadata: PageMetadata, extra: PageMetadata["meta"]): PageMetadata {
  return { ...metadata, meta: [...(metadata.meta ?? []), ...(extra ?? [])] };
}

function routeMetadata(input: Parameters<typeof seoMetadata>[0]): PageMetadata {
  const base = seoMetadata(input);
  return NOINDEX_ROUTES.includes(input.route) ? withMeta(base, [NOINDEX_FOLLOW]) : base;
}

export function homeDescription(plans: readonly Plan[]): string {
  const prices = startingPricesLine(plans);
  return `senior engineer in ${SERVICE_AREA_COPY}. i fix + look after small-business sites myself. ${prices}`;
}

export async function buildAppConfig(
  options: BuildOptions = { previewDrafts: previewDraftsFromEnv() },
): Promise<LestoAppConfig> {
  const { db } = await openSqlite(":memory:");
  const [studies, steps, plans, faq, experience, articles] = await Promise.all([
    loadAllCaseStudies(),
    loadProcess(),
    loadPlans(),
    loadFaq(),
    loadExperience(),
    loadArticles(options.previewDrafts),
  ]);

  let app = lesto()
    .styles("/styles.css")
    .page(AGENTS_ROUTE, {
      static: true,
      component: makeAgents(),
      metadata: () =>
        seoMetadata({ title: AGENTS_TITLE, description: AGENTS_DESCRIPTION, route: AGENTS_ROUTE, type: "website", image: AGENTS_OG_IMAGE }),
    })
    .page(AGENTS_SENT_ROUTE, {
      static: true,
      component: makeAgentsSent(),
      metadata: () => routeMetadata({ title: `got it · ${SITE_NAME}`, description: AGENTS_SENT_HEADLINE, route: AGENTS_SENT_ROUTE, type: "website" }),
    })
    .layout(makeSiteLayout({ work: studies.length > 0, articles: articles.length > 0 }))
    .page("/", {
      static: true,
      component: makeHome(studies, plans, faq, articles),
      metadata: () =>
        seoMetadata({
          title: HOME_TITLE,
          description: homeDescription(plans),
          route: "/",
          type: "website",
        }),
    })
    .page(ABOUT_ROUTE, {
      static: true,
      component: makeAbout(experience),
      metadata: () =>
        seoMetadata({
          title: `about · web developer in ${SERVICE_AREA_SHORT} · ${SITE_NAME}`,
          description:
            "senior software engineer since 2017. i built the platform behind 30k+ websites + was tech lead on serhant.com's mls search. now i help small businesses.",
          route: ABOUT_ROUTE,
          type: "website",
        }),
    })
    .page(PROCESS_ROUTE, {
      static: true,
      component: makeProcess(steps),
      metadata: () =>
        seoMetadata({
          title: `how a one-project job works · ${SITE_NAME}`,
          description: "for one bigger job: we talk, i look around, you get one plan + one price per step, then i build it in small steps.",
          route: PROCESS_ROUTE,
          type: "website",
        }),
    });

  app = app
    .page(SERVICES_ROUTE, {
      static: true,
      component: makeServicesIndex(plans),
      metadata: () =>
        seoMetadata({ title: SERVICES_TITLE, description: SERVICES_LEDE, route: SERVICES_ROUTE, type: "website" }),
    })
    .page(ORANGE_COUNTY_ROUTE, {
      static: true,
      component: makeOrangeCounty(plans),
      metadata: () =>
        seoMetadata({ title: ORANGE_COUNTY_TITLE, description: ORANGE_COUNTY_DESCRIPTION, route: ORANGE_COUNTY_ROUTE, type: "website" }),
    });

  app = app.page(PRIVACY_ROUTE, {
    static: true,
    component: makePrivacy(),
    metadata: () => seoMetadata({ title: `${PRIVACY_TITLE} · ${SITE_NAME}`, description: PRIVACY_DESCRIPTION, route: PRIVACY_ROUTE, type: "website" }),
  });

  app = app.page(CHECK_SENT_ROUTE, {
    static: true,
    component: makeCheckSent(),
    metadata: () =>
      routeMetadata({
        title: `got it · ${SITE_NAME}`,
        description: "your site check request is in. i reply within 1 business day, monday to friday.",
        route: CHECK_SENT_ROUTE,
        type: "website",
      }),
  });

  for (const service of SERVICES) {
    const route = serviceRoute(service.slug);
    app = app.page(route, {
      static: true,
      component: makeServicePage(service, plans),
      metadata: () => seoMetadata({ title: serviceTitle(service.title), description: service.description, route, type: "website" }),
    });
  }

  if (studies.length > 0) {
    app = app
      .page(WORK_ROUTE, {
        static: true,
        component: makeWorkIndex(studies),
        metadata: () =>
          seoMetadata({
            title: `past work · ${SITE_NAME}`,
            description: "websites i've worked on, for stanford, blackstone, holt international and serhant.",
            route: WORK_ROUTE,
            type: "website",
          }),
      })
      .page(WORK_REQUEST_ROUTE, {
        static: true,
        component: makeWorkRequest(studies),
        metadata: () =>
          routeMetadata({
            title: `ask about a project · ${SITE_NAME}`,
            description: "want to hear more about one of these? email me and i'll walk you through it.",
            route: WORK_REQUEST_ROUTE,
            type: "website",
          }),
      });
  }

  if (articles.length > 0) {
    const allDrafts = articles.every((article) => article.draft);
    app = app.page(ARTICLES_ROUTE, {
      static: true,
      component: makeArticlesIndex(articles),
      metadata: () =>
        withMeta(
          withFeedLink(
            seoMetadata({
              title: `articles · ${SITE_NAME}`,
              description: ARTICLES_LEDE,
              route: ARTICLES_ROUTE,
              type: "website",
            }),
          ),
          allDrafts ? [NOINDEX] : [],
        ),
    });
  }

  for (const article of articles) {
    app = app.page(article.route, {
      static: true,
      component: makeArticle(article),
      metadata: () => {
        const base = withFeedLink(
          seoMetadata({ title: `${article.title} · ${SITE_NAME}`, description: article.summary, route: article.route, type: "article" }),
        );
        const published = { property: "article:published_time", content: article.published };
        return withMeta(base, [published, ...(article.draft ? [NOINDEX] : [])]);
      },
    });
  }

  const fullStudies = options.previewDrafts ? studies : [];
  for (const study of fullStudies) {
    app = app.page(study.route, {
      static: true,
      component: makeCaseStudy(study),
      metadata: () => {
        const base = seoMetadata({
          title: `${study.title} · ${SITE_NAME}`,
          description: study.summary,
          route: study.route,
          type: "article",
        });
        return withMeta(base, [NOINDEX]);
      },
    });
  }

  return {
    db,
    app,
    migrations: "skip",
    ui: { dialect: "react", css: "app/styles/app.css", cssScanRoot: "src" },
  };
}
