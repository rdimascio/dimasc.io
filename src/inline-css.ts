import { readdir } from "node:fs/promises";
import path from "node:path";

export const STYLESHEET_HREF = "/styles.css";
const STYLESHEET_LINK = /<link rel="stylesheet" href="\/styles\.css"\s*\/?>/g;

export function inlineStylesheet(html: string, css: string): string {
  const safeCss = css.replaceAll("</style", "<\\/style");
  return html.replace(STYLESHEET_LINK, () => `<style>${safeCss}</style>`);
}

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(full);
      return Promise.resolve(entry.name.endsWith(".html") ? [full] : []);
    }),
  );
  return nested.flat();
}

export async function inlineStylesheetInSite(siteDir: string): Promise<number> {
  const css = await Bun.file(path.join(siteDir, STYLESHEET_HREF.slice(1))).text();
  let changed = 0;
  for (const file of await htmlFiles(siteDir)) {
    const html = await Bun.file(file).text();
    const inlined = inlineStylesheet(html, css);
    if (inlined === html) continue;
    await Bun.write(file, inlined);
    changed += 1;
  }
  return changed;
}
