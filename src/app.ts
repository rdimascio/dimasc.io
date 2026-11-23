import type { LestoAppConfig } from "@lesto/kernel";
import { openSqlite } from "@lesto/runtime";
import type { PageMetadata } from "@lesto/web";
import { lesto } from "@lesto/web";

import { ARTICLES_ROUTE, loadAllCaseStudies, loadArticles, loadExperience, loadFaq, loadPlans, loadProcess, type Plan } from "./content";
import { FEED_ROUTE } from "./feed";
import { AI_PAGE_TITLE, AI_PLAN_NAME, aiDescription, ladderSummary, ORANGE_COUNTY_ROUTE, planNamed, planPriceText } from "./offer";
import {
  canonicalUrl,
  INTRO_CALL_ROUTE,
  INTRO_CALL_MINUTES,
  INTRO_CALL_NAME,
  AI_ROUTE,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  PRIVACY_ROUTE,
  SERVICE_AREA_COPY,
  SERVICE_AREA_SHORT,
  SITE_NAME,
  SITE_URL,
} from "./site";
import { makeAbout } from "./ui/about";
import { ARTICLES_LEDE, makeArticle, makeArticlesIndex } from "./ui/articles";
import { makeHome } from "./ui/home";
import { ABOUT_ROUTE, makeSiteLayout } from "./ui/layout";
import { NOINDEX_ROUTES, PROCESS_ROUTE } from "./sitemap";
import { makeProcess, PROCESS_TITLE } from "./ui/process";
import { makeAi, makeOrangeCounty } from "./ui/ai";
import { makeCheckSent, makeIntroCall } from "./ui/check";
import { makePrivacy, PRIVACY_DESCRIPTION, PRIVACY_TITLE } from "./ui/privacy";
import { CHECK_SENT_ROUTE } from "./check";
import { makeCaseStudy, makeWorkIndex, makeWorkRequest } from "./ui/work";
import { previewDraftsFromEnv } from "./preview";
import { WORK_REQUEST_ROUTE, WORK_ROUTE } from "./work";
import { YOUTH_SPORTS_DESCRIPTION, YOUTH_SPORTS_ROUTE, YOUTH_SPORTS_TITLE } from "./youth-sports";
import { makeYouthSports } from "./ui/youth-sports";

export { canonicalUrl, SITE_URL };

const OG_IMAGE = `${SITE_URL}${OG_IMAGE_PATH}`;

export function seoMetadata(input: {
  title: string;
  description: string;
  route: string;
  type: "website" | "article";
}): PageMetadata {
  const url = canonicalUrl(input.route);
  return {
    title: input.title,
    description: input.description,
    meta: [
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: input.title },
      { property: "og:type", content: input.type },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: String(OG_IMAGE_WIDTH) },
      { property: "og:image:height", content: String(OG_IMAGE_HEIGHT) },
      { property: "og:image:alt", content: OG_IMAGE_ALT },
      { property: "og:description", content: input.description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: input.title },
      { name: "twitter:description", content: input.description },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: OG_IMAGE_ALT },
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

export const ORANGE_COUNTY_TITLE = `ai help for local businesses, ${SERVICE_AREA_SHORT} ca · ${SITE_NAME}`;
export const INTRO_CALL_TITLE = `${INTRO_CALL_NAME} · ${SITE_NAME}`;
export const INTRO_CALL_DESCRIPTION = `tell me how your business runs + what eats your week. we talk for ${INTRO_CALL_MINUTES} min + i tell you straight if ai can help. free.`;

export function orangeCountyDescription(plans: readonly Plan[]): string {
  return `software engineer in ${SERVICE_AREA_COPY}. i set up ai that takes busywork off local business owners + keep it working. ${AI_PLAN_NAME} ${planPriceText(planNamed(plans, AI_PLAN_NAME))}.`;
}

export function serviceTitle(title: string): string {
  return `${title} · ${SITE_NAME}`;
}

export const HOME_TITLE = `ai help for ${SERVICE_AREA_SHORT} businesses · ${SITE_NAME}`;

function withMeta(metadata: PageMetadata, extra: PageMetadata["meta"]): PageMetadata {
  return { ...metadata, meta: [...(metadata.meta ?? []), ...(extra ?? [])] };
}

function routeMetadata(input: Parameters<typeof seoMetadata>[0]): PageMetadata {
  const base = seoMetadata(input);
  return NOINDEX_ROUTES.includes(input.route) ? withMeta(base, [NOINDEX_FOLLOW]) : base;
}

export function homeDescription(plans: readonly Plan[]): string {
  return `ai that takes busywork off local business owners in ${SERVICE_AREA_COPY}, set up in the tools you use + kept working. ${AI_PLAN_NAME} ${planPriceText(planNamed(plans, AI_PLAN_NAME))}.`;
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
      component: makeAbout(experience, plans),
      metadata: () =>
        seoMetadata({
          title: `about · software engineer in ${SERVICE_AREA_SHORT} · ${SITE_NAME}`,
          description:
            "senior software engineer since 2017. i built the platform behind 30k+ websites + was tech lead on serhant.com's mls search. now i set up ai front desks for local businesses.",
          route: ABOUT_ROUTE,
          type: "website",
        }),
    })
    .page(PROCESS_ROUTE, {
      static: true,
      component: makeProcess(steps),
      metadata: () =>
        seoMetadata({
          title: `${PROCESS_TITLE} · ${SITE_NAME}`,
          description: `free call, ai plan, flat price per build, a test together, then i keep it working. ${ladderSummary(plans)}`,
          route: PROCESS_ROUTE,
          type: "website",
        }),
    });

  app = app
    .page(AI_ROUTE, {
      static: true,
      component: makeAi(plans),
      metadata: () =>
        seoMetadata({
          title: serviceTitle(AI_PAGE_TITLE),
          description: aiDescription(plans),
          route: AI_ROUTE,
          type: "website",
        }),
    })
    .page(INTRO_CALL_ROUTE, {
      static: true,
      component: makeIntroCall(plans),
      metadata: () =>
        seoMetadata({ title: INTRO_CALL_TITLE, description: INTRO_CALL_DESCRIPTION, route: INTRO_CALL_ROUTE, type: "website" }),
    })
    .page(ORANGE_COUNTY_ROUTE, {
      static: true,
      component: makeOrangeCounty(plans),
      metadata: () =>
        seoMetadata({ title: ORANGE_COUNTY_TITLE, description: orangeCountyDescription(plans), route: ORANGE_COUNTY_ROUTE, type: "website" }),
    });

  app = app.page(YOUTH_SPORTS_ROUTE, {
    static: true,
    component: makeYouthSports(plans),
    metadata: () =>
      seoMetadata({ title: serviceTitle(YOUTH_SPORTS_TITLE), description: YOUTH_SPORTS_DESCRIPTION, route: YOUTH_SPORTS_ROUTE, type: "website" }),
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
        description: "your free 15-min call request is in. i reply within 1 business day, monday to friday.",
        route: CHECK_SENT_ROUTE,
        type: "website",
      }),
  });

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
