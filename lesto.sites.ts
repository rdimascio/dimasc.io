import { defineSites } from "@lesto/sites";

import { loadCaseStudies } from "./src/content";

export default defineSites([
  {
    name: "www",
    render: "static",
    basePath: "/",
    pages: async () => {
      const studies = await loadCaseStudies();
      return ["/", "/work", "/process", ...studies.map((study) => study.route)];
    },
  },
]);
