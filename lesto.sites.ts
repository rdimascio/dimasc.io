import { defineSites } from "@lesto/sites";

import { loadAllCaseStudies, loadArticles } from "./src/content";
import { articleRoutes } from "./src/feed";
import { ABOUT_ROUTE } from "./src/site";
import { previewDraftsFromEnv } from "./src/preview";
import { workRoutes } from "./src/work";

export default defineSites([
  {
    name: "www",
    render: "static",
    basePath: "/",
    pages: async () => {
      const previewDrafts = previewDraftsFromEnv();
      const [studies, articles] = await Promise.all([loadAllCaseStudies(), loadArticles(previewDrafts)]);
      return ["/", ABOUT_ROUTE, "/process", ...workRoutes(studies, previewDrafts), ...articleRoutes(articles)];
    },
  },
]);
