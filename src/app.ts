import type { LestoAppConfig } from "@lesto/kernel";
import { openSqlite } from "@lesto/runtime";
import type { PageMetadata } from "@lesto/web";
import { lesto } from "@lesto/web";

import { loadAllCaseStudies, loadExperience, loadFaq, loadPlans, loadProcess } from "./content";
import { canonicalUrl, SITE_NAME, SITE_URL } from "./site";
import { makeAbout } from "./ui/about";
import { makeHome } from "./ui/home";
import { ABOUT_ROUTE, makeSiteLayout } from "./ui/layout";
import { makeProcess } from "./ui/process";
import { makeCaseStudy, makeWorkIndex, makeWorkRequest } from "./ui/work";
import { previewCaseStudiesFromEnv, WORK_REQUEST_ROUTE, WORK_ROUTE } from "./work";

export { canonicalUrl, SITE_URL };

const OG_IMAGE = `${SITE_URL}/og.svg`;

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
      { property: "og:description", content: input.description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: input.title },
      { name: "twitter:description", content: input.description },
      { name: "twitter:image", content: OG_IMAGE },
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
      component: makeHome(studies, plans, faq, experience),
      metadata: () =>
        seoMetadata({
          title: `${SITE_NAME} · Software subscriptions for small businesses`,
          description:
            "A software engineer on subscription for one flat monthly price: websites, stores, integrations and AI tools. Most small requests back in two business days. Pause or cancel anytime.",
          route: "/",
          type: "website",
        }),
    })
    .page(ABOUT_ROUTE, {
      static: true,
      component: makeAbout(experience),
      metadata: () =>
        seoMetadata({
          title: `About · ${SITE_NAME}`,
          description: "Ryan DiMascio: building websites, stores and software since 2017, at agencies, startups and product companies.",
          route: ABOUT_ROUTE,
          type: "website",
        }),
    })
    .page("/process", {
      static: true,
      component: makeProcess(steps),
      metadata: () =>
        seoMetadata({
          title: `How custom projects run · ${SITE_NAME}`,
          description: "Custom projects: discovery, research, a recommendation, a reviewed flat quote, then small steps that each ship.",
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
            title: `Work · ${SITE_NAME}`,
            description: "Selected work. Full case studies are shared on request.",
            route: WORK_ROUTE,
            type: "website",
          }),
      })
      .page(WORK_REQUEST_ROUTE, {
        static: true,
        component: makeWorkRequest(studies),
        metadata: () =>
          seoMetadata({
            title: `Request a case study · ${SITE_NAME}`,
            description: "Full case studies are shared on request. Email me with the project you want to read about.",
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
