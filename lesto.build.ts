import { readdir } from "node:fs/promises";
import path from "node:path";

import type { BuildHook } from "@lesto/cli";
import { defineStaticSite } from "@lesto/sites";

import { SITE_URL } from "./src/app";
import { ogImage } from "./src/og";
import { outputPathFor, PERSONAL_PAGES, personalPageHtml } from "./src/personal";
import { SCREENSHOT_SOURCE_DIR, screenshotOutputPath } from "./src/work";

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#111113"/><text x="32" y="43" font-family="system-ui, sans-serif" font-size="30" font-weight="700" text-anchor="middle" fill="#fff">RD</text></svg>`;

const FONT_FILES = [
  { from: "node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2", to: "fonts/Geist-Variable.woff2" },
  { from: "node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2", to: "fonts/GeistMono-Variable.woff2" },
  { from: "node_modules/geist/LICENSE.txt", to: "fonts/LICENSE.txt" },
] as const;

async function bundle(entry: string): Promise<string> {
  const result = await Bun.build({
    entrypoints: [entry],
    target: "browser",
    minify: true,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
  });
  const output = result.outputs[0];
  if (!result.success || output === undefined) {
    throw new Error(`bundle failed for ${entry}: ${result.logs.map((log) => log.message).join("; ")}`);
  }
  return output.text();
}

const onBuilt: BuildHook = async ({ sites }) => {
  const site = sites.find((candidate) => candidate.name === "www");
  if (site === undefined) return;

  await defineStaticSite({
    siteUrl: SITE_URL,
    routes: site.routes,
    og: ogImage(),
    favicon: FAVICON,
  }).emit(site.sink);

  for (const font of FONT_FILES) {
    await site.sink(font.to, new Uint8Array(await Bun.file(font.from).arrayBuffer()));
  }

  for (const fileName of await readdir(SCREENSHOT_SOURCE_DIR)) {
    if (!fileName.endsWith(".webp")) continue;
    const bytes = await Bun.file(path.join(SCREENSHOT_SOURCE_DIR, fileName)).arrayBuffer();
    await site.sink(screenshotOutputPath(fileName), new Uint8Array(bytes));
  }

  for (const page of PERSONAL_PAGES) {
    await site.sink(page.script.slice(1), await bundle(page.entry));
    await site.sink(outputPathFor(page.route), personalPageHtml(page));
  }
};

export default onBuilt;
