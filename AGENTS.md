# dimasc.io

Ryan DiMascio's studio site: a static Lesto 0.2 app on Cloudflare Workers. Every page is prerendered by `lesto build` into `out/www`, and `worker.ts` only serves those files and a 404.

## Commands

| Task | Command |
|---|---|
| Install | `bun install` |
| Dev server | `bun run dev` |
| Full check before any push | `bun run gate` (typecheck, tests, build) |
| Deploy | `bun run deploy`, only when Ryan says so |

## Content

- Case studies: `content/case-studies/<slug>.md`. Copy `_template.md`. Screenshots: `assets/work/<slug>-desktop.webp` (1440x900) and `<slug>-mobile.webp` (390x844), under 300 KB each.
- Every case study gets a public card on `/` and `/work`. Cards link to `/work/request`, which offers a prefilled email. Cards show only public facts.
- Full case study pages (`/work/<slug>`) are not public. They build only with `PREVIEW_CASE_STUDIES=1`, marked noindex. Preview: `PREVIEW_CASE_STUDIES=1 bun run build`, then `bunx wrangler dev`.
- `TODO(ryan):` marks a question only Ryan can answer. A case study with such a line must stay `draft: true`, or the build fails.
- Process steps: `content/process/NN-name.md`, ordered by `step`.
- Frontmatter schemas live in `lesto.content.ts`. A file that fails its schema fails the build.

## Rules

- Never name a client without their permission. Leave `client` out instead.
- Only numbers that can be proved. No invented results.
- Never mention internal or employer work, its tools or its ticket ids.
- No third-party scripts or analytics without Ryan's yes.
- No logic in code comments.
- Conventional single-line commits: `type(scope): summary`.
- Secrets: none in this repo. Never commit `.env` or `.dev.vars`.
- Do not touch `out/` or `bun.lock` by hand.
