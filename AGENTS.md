# dimasc.io

Ryan DiMascio's studio site: a static Lesto 0.2 app on Cloudflare Workers. Every page is prerendered by `lesto build` into `out/www`. `worker.ts` serves those files and a 404, and handles one form: `POST /check`.

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
- Full case study pages (`/work/<slug>`) are not public. They build only with `PREVIEW_DRAFTS=1`, marked noindex.
- `TODO(ryan):` marks a question only Ryan can answer. A case study with such a line must stay `draft: true`, or the build fails.
- Process steps: `content/process/NN-name.md`, ordered by `step`.
- Articles: `content/articles/<slug>.md`, served at `/articles/<slug>`. Copy `_template.md`. `draft: true` keeps it off the public site; set `draft: false` to publish. The articles index, nav link, home section and `/articles/feed.xml` appear only once one article is published.
- Preview drafts (articles and full case studies): `PREVIEW_DRAFTS=1 bun run build`, then `bunx wrangler dev`.
- Work history: `content/experience/NN-company.md`, shown on `/` and `/about`. Unknown facts stay as `# TODO(ryan):` YAML comments and are never rendered. Demo videos live in `assets/demos` (clip under 4 MB, full video under 25 MB) and are served at `/media/demos`.
- Studio pages ship no executable script. JSON-LD data blocks (`application/ld+json`, built in `src/structured-data.ts`) are allowed. One approved exception: the Cloudflare Turnstile `api.js` script, on the site check form page only. Motion is CSS only (view transitions, scroll-driven reveals) and is off under `prefers-reduced-motion`.
- Site check form: shown on `/services/fix-my-website#check`, posts to `/check` (`src/check.ts`), plain HTML. The only script is the Turnstile widget. The Worker checks the `cf-turnstile-response` token with siteverify (secret: the `TURNSTILE_SECRET_KEY` Worker secret) before it stores anything. A missing or failed token, a hostname outside `TURNSTILE_HOSTNAMES`, or a siteverify error gets a retry page with the form re-filled (escaped) and a fresh widget, with no store and no email. Failures log only an event name and the siteverify error codes (Workers Logs). Local tests use Cloudflare's test keys. Each request is stored in the `REQUESTS` KV namespace under `check:<iso time>:<id>`, then emailed to `ryan@dimasc.io` when an `EMAIL` (`send_email`) binding exists. Per-IP limit: the `CHECK_LIMITER` binding. Never log a request's fields; log only its id.
- Read stored requests: `bunx wrangler kv key list --binding REQUESTS --remote --prefix check:`, then `bunx wrangler kv key get --binding REQUESTS --remote "<key>"`.
- Frontmatter schemas live in `lesto.content.ts`. A file that fails its schema fails the build.

## Rules

- Never publish a phone number or a street address, in copy or in JSON-LD.
- Never name a client without their permission. Leave `client` out instead.
- Only numbers that can be proved. No invented results.
- Never mention internal or employer work, its tools or its ticket ids.
- No third-party scripts or analytics without Ryan's yes. The Turnstile script on the form page is the one approved exception.
- No logic in code comments.
- Conventional single-line commits: `type(scope): summary`.
- Secrets: none in this repo. Never commit `.env` or `.dev.vars`.
- Do not touch `out/` or `bun.lock` by hand.
