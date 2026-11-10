export interface PersonalPage {
  readonly route: string;
  readonly title: string;
  readonly entry: string;
  readonly script: string;
  readonly backdrop: string;
}

export const PERSONAL_PAGES: readonly PersonalPage[] = [
  { route: "/ava", title: "ava lu", entry: "app/pixel/ava-entry.tsx", script: "/pixel/ava.js", backdrop: "#0a0510" },
  { route: "/rhys", title: "rhys", entry: "app/pixel/rhys-entry.tsx", script: "/pixel/rhys.js", backdrop: "#051520" },
];

export function personalPageHtml(page: PersonalPage): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${page.title}</title>
    <link rel="stylesheet" href="/styles.css" />
    <script type="module" src="${page.script}"></script>
  </head>
  <body style="margin:0;background:${page.backdrop}">
    <div id="root"></div>
  </body>
</html>`;
}

export function outputPathFor(route: string): string {
  return `${route.slice(1)}/index.html`;
}
