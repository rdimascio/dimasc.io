import path from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright-core";

import { AGENTS_OG_IMAGE, AGENTS_OG_IMAGE_MAX_BYTES, AGENTS_OG_IMAGE_SCALE } from "../src/site";

const ROOT = path.resolve(import.meta.dir, "..");
const TEMPLATE = path.join(import.meta.dir, "og-agents.html");
const OUTPUT = path.join(ROOT, AGENTS_OG_IMAGE.source);
const MAX_BYTES = AGENTS_OG_IMAGE_MAX_BYTES;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: AGENTS_OG_IMAGE.width / AGENTS_OG_IMAGE_SCALE, height: AGENTS_OG_IMAGE.height / AGENTS_OG_IMAGE_SCALE },
    deviceScaleFactor: AGENTS_OG_IMAGE_SCALE,
  });
  await page.goto(pathToFileURL(TEMPLATE).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: OUTPUT, type: "png" });
} finally {
  await browser.close();
}

const bytes = Bun.file(OUTPUT).size;
if (bytes > MAX_BYTES) throw new Error(`${AGENTS_OG_IMAGE.source} is ${bytes} bytes, over ${MAX_BYTES}`);
console.log(`wrote ${AGENTS_OG_IMAGE.source} (${bytes} bytes)`);
