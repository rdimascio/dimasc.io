import path from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright-core";

import { AGENTS_OG_IMAGE } from "../src/site";

const ROOT = path.resolve(import.meta.dir, "..");
const TEMPLATE = path.join(import.meta.dir, "og-agents.html");
const OUTPUT = path.join(ROOT, AGENTS_OG_IMAGE.source);
const MAX_BYTES = 300 * 1024;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: AGENTS_OG_IMAGE.width, height: AGENTS_OG_IMAGE.height },
    deviceScaleFactor: 1,
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
