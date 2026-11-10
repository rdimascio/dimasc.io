import type { BuildHook } from "@lesto/cli";
import { defineStaticSite } from "@lesto/sites";

import { SITE_URL } from "./src/app";
import { ogImage } from "./src/og";

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#111113"/><text x="32" y="43" font-family="system-ui, sans-serif" font-size="30" font-weight="700" text-anchor="middle" fill="#fff">RD</text></svg>`;

const onBuilt: BuildHook = async ({ sites }) => {
  const site = sites.find((candidate) => candidate.name === "www");
  if (site === undefined) return;
  await defineStaticSite({
    siteUrl: SITE_URL,
    routes: site.routes,
    og: ogImage(),
    favicon: FAVICON,
  }).emit(site.sink);
};

export default onBuilt;
