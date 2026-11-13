import { SITE_NAME } from "./site";

export function renderNotFound(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Not found · ${SITE_NAME}</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="max-w-[36rem] mx-auto py-28 px-6 text-center">
      <h1 class="text-5xl mb-2 tracking-[-0.04em] font-semibold">404</h1>
      <p class="text-muted">That page isn't here. Go to the <a class="underline underline-offset-4" href="/">home page</a> or see the <a class="underline underline-offset-4" href="/work">work</a>.</p>
    </main>
  </body>
</html>`;
}
