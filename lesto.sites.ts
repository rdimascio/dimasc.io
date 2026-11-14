import { defineSites } from "@lesto/sites";

import { loadAllCaseStudies, loadArticles } from "./src/content";
import { previewDraftsFromEnv } from "./src/preview";
import { siteRoutes } from "./src/sitemap";

export default defineSites([
  {
    name: "www",
    render: "static",
    basePath: "/",
    pages: async () => {
      const previewDrafts = previewDraftsFromEnv();
      const [studies, articles] = await Promise.all([loadAllCaseStudies(), loadArticles(previewDrafts)]);
      return siteRoutes(studies, articles, previewDrafts);
    },
  },
]);
