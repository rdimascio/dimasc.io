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

- Case studies: `content/case-studies/<slug>.md`, served at `/work/<slug>`. Copy `_template.md`. A file with `draft: true` is never built.
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
