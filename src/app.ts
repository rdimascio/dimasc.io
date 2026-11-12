import type { LestoAppConfig } from "@lesto/kernel";
import { openSqlite } from "@lesto/runtime";
import type { PageMetadata } from "@lesto/web";
import { lesto } from "@lesto/web";

import { loadCaseStudies, loadFaq, loadPlans, loadProcess } from "./content";
import { canonicalUrl, SITE_NAME, SITE_URL } from "./site";
import { makeHome } from "./ui/home";
import { SiteLayout } from "./ui/layout";
import { makeProcess } from "./ui/process";
import { makeCaseStudy, makeWorkIndex } from "./ui/work";

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

export async function buildAppConfig(): Promise<LestoAppConfig> {
  const { db } = await openSqlite(":memory:");
  const [studies, steps, plans, faq] = await Promise.all([loadCaseStudies(), loadProcess(), loadPlans(), loadFaq()]);

  let app = lesto()
    .styles("/styles.css")
    .layout(SiteLayout)
    .page("/", {
      static: true,
      component: makeHome(studies, plans, faq),
      metadata: () =>
        seoMetadata({
          title: `${SITE_NAME} · Software subscriptions for small businesses`,
          description:
            "A software engineer on call for one flat monthly price: websites, stores, integrations and AI tools, delivered in about two business days. Pause or cancel anytime.",
          route: "/",
          type: "website",
        }),
    })
    .page("/work", {
      static: true,
      component: makeWorkIndex(studies),
      metadata: () =>
        seoMetadata({
          title: `Work · ${SITE_NAME}`,
          description: "Case studies: what I built, why, and how it turned out.",
          route: "/work",
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

  for (const study of studies) {
    app = app.page(study.route, {
      static: true,
      component: makeCaseStudy(study),
      metadata: () =>
        seoMetadata({
          title: `${study.title} · ${SITE_NAME}`,
          description: study.summary,
          route: study.route,
          type: "article",
        }),
    });
  }

  return {
    db,
    app,
    migrations: "skip",
    ui: { dialect: "react", css: "app/styles/app.css", cssScanRoot: "src" },
  };
}
