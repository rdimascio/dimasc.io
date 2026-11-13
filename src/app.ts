import type { LestoAppConfig } from "@lesto/kernel";
import { openSqlite } from "@lesto/runtime";
import type { PageMetadata } from "@lesto/web";
import { lesto } from "@lesto/web";

import { loadAllCaseStudies, loadExperience, loadFaq, loadPlans, loadProcess } from "./content";
import {
  canonicalUrl,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "./site";
import { makeAbout } from "./ui/about";
import { makeHome } from "./ui/home";
import { ABOUT_ROUTE, makeSiteLayout } from "./ui/layout";
import { makeProcess } from "./ui/process";
import { makeCaseStudy, makeWorkIndex, makeWorkRequest } from "./ui/work";
import { previewCaseStudiesFromEnv, WORK_REQUEST_ROUTE, WORK_ROUTE } from "./work";

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
  readonly previewCaseStudies: boolean;
}

export async function buildAppConfig(
  options: BuildOptions = { previewCaseStudies: previewCaseStudiesFromEnv() },
): Promise<LestoAppConfig> {
  const { db } = await openSqlite(":memory:");
  const [studies, steps, plans, faq, experience] = await Promise.all([
    loadAllCaseStudies(),
    loadProcess(),
    loadPlans(),
    loadFaq(),
    loadExperience(),
  ]);

  let app = lesto()
    .styles("/styles.css")
    .layout(makeSiteLayout(studies.length > 0))
    .page("/", {
      static: true,
      component: makeHome(studies, plans, faq),
      metadata: () =>
        seoMetadata({
          title: `${SITE_NAME} · ${SITE_TAGLINE}`,
          description:
            "i fix + improve your website and the tools behind it, for one flat monthly price. cancel anytime.",
          route: "/",
          type: "website",
        }),
    })
    .page(ABOUT_ROUTE, {
      static: true,
      component: makeAbout(experience),
      metadata: () =>
        seoMetadata({
          title: `about · ${SITE_NAME}`,
          description: "i've been building websites since 2017, at agencies, startups and product companies. you work directly w/ me.",
          route: ABOUT_ROUTE,
          type: "website",
        }),
    })
    .page("/process", {
      static: true,
      component: makeProcess(steps),
      metadata: () =>
        seoMetadata({
          title: `how a one-project job works · ${SITE_NAME}`,
          description: "for one bigger job: we talk, i look around, you get one plan + one price per step, then i build it in small steps.",
          route: "/process",
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
          seoMetadata({
            title: `ask about a project · ${SITE_NAME}`,
            description: "want to hear more about one of these? email me and i'll walk you through it.",
            route: WORK_REQUEST_ROUTE,
            type: "website",
          }),
      });
  }

  const fullStudies = options.previewCaseStudies ? studies : [];
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
        return { ...base, meta: [...(base.meta ?? []), { name: "robots", content: "noindex" }] };
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
