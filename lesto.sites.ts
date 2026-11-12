import { defineSites } from "@lesto/sites";

import { loadCaseStudies } from "./src/content";

export default defineSites([
  {
    name: "www",
    render: "static",
    basePath: "/",
    pages: async () => {
      const studies = await loadCaseStudies();
      const work = studies.length > 0 ? ["/work", ...studies.map((study) => study.route)] : [];
      return ["/", "/process", ...work];
    },
  },
]);
