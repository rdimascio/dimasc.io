import { defineSites } from "@lesto/sites";

import { loadAllCaseStudies } from "./src/content";
import { ABOUT_ROUTE } from "./src/site";
import { previewCaseStudiesFromEnv, workRoutes } from "./src/work";

export default defineSites([
  {
    name: "www",
    render: "static",
    basePath: "/",
    pages: async () => {
      const studies = await loadAllCaseStudies();
      return ["/", ABOUT_ROUTE, "/process", ...workRoutes(studies, previewCaseStudiesFromEnv())];
    },
  },
]);
