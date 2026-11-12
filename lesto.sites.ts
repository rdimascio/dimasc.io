import { defineSites } from "@lesto/sites";

import { loadAllCaseStudies } from "./src/content";
import { previewCaseStudiesFromEnv, workRoutes } from "./src/work";

export default defineSites([
  {
    name: "www",
    render: "static",
    basePath: "/",
    pages: async () => {
      const studies = await loadAllCaseStudies();
      return ["/", "/process", ...workRoutes(studies, previewCaseStudiesFromEnv())];
    },
  },
]);
