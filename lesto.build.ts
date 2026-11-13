import { readdir } from "node:fs/promises";
import path from "node:path";

import type { BuildHook } from "@lesto/cli";
import { defineStaticSite } from "@lesto/sites";

import { SITE_URL } from "./src/app";
import { HEADERS_FILE, OG_IMAGE_PATH, OG_IMAGE_SOURCE } from "./src/site";
import { outputPathFor, PERSONAL_PAGES, personalPageHtml } from "./src/personal";
import { loadArticles } from "./src/content";
import { articlesFeed, FEED_ROUTE } from "./src/feed";
import { SIGNATURE_INITIAL } from "./src/signature";
import { STATIC_ASSET_DIRS } from "./src/work";

const FAVICON_SIZE = 64;
const FAVICON_INSET = 9;
const FAVICON_STROKE_PX = 2.2;

function faviconSvg(): string {
  const [minX = 0, minY = 0, width = 1, height = 1] = SIGNATURE_INITIAL.viewBox.split(" ").map(Number);
  const scale = (FAVICON_SIZE - FAVICON_INSET * 2) / Math.max(width, height);
  const offsetX = (FAVICON_SIZE - width * scale) / 2 - minX * scale;
  const offsetY = (FAVICON_SIZE - height * scale) / 2 - minY * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FAVICON_SIZE} ${FAVICON_SIZE}"><rect width="${FAVICON_SIZE}" height="${FAVICON_SIZE}" rx="14" fill="#141311"/><path fill="#f3f0ea" stroke="#f3f0ea" stroke-linejoin="round" stroke-width="${(FAVICON_STROKE_PX / scale).toFixed(1)}" transform="translate(${offsetX.toFixed(2)} ${offsetY.toFixed(2)}) scale(${scale.toFixed(5)})" d="${SIGNATURE_INITIAL.d}"/></svg>`;
}

const FONT_FILES = [
  { from: "node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2", to: "fonts/Geist-Variable.woff2" },
  { from: "node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2", to: "fonts/GeistMono-Variable.woff2" },
  { from: "node_modules/geist/LICENSE.txt", to: "fonts/LICENSE.txt" },
  {
    from: "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
    to: "fonts/InstrumentSerif-Italic.woff2",
  },
  { from: "node_modules/@fontsource/instrument-serif/LICENSE", to: "fonts/InstrumentSerif-LICENSE.txt" },
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
    favicon: faviconSvg(),
  }).emit(site.sink);

  await site.sink(OG_IMAGE_PATH.slice(1), new Uint8Array(await Bun.file(OG_IMAGE_SOURCE).arrayBuffer()));
  await site.sink("_headers", HEADERS_FILE);

  const publishedArticles = await loadArticles(false);
  if (publishedArticles.length > 0) await site.sink(FEED_ROUTE.slice(1), articlesFeed(publishedArticles));

  for (const font of FONT_FILES) {
    await site.sink(font.to, new Uint8Array(await Bun.file(font.from).arrayBuffer()));
  }

  for (const dir of STATIC_ASSET_DIRS) {
    for (const fileName of await readdir(dir.from)) {
      if (!dir.extensions.some((extension) => fileName.endsWith(extension))) continue;
      const bytes = await Bun.file(path.join(dir.from, fileName)).arrayBuffer();
      await site.sink(`${dir.to}/${fileName}`, new Uint8Array(bytes));
    }
  }

  for (const page of PERSONAL_PAGES) {
    await site.sink(page.script.slice(1), await bundle(page.entry));
    await site.sink(outputPathFor(page.route), personalPageHtml(page));
  }
};

export default onBuilt;
