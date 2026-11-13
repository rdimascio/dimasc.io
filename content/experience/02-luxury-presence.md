---
company: "luxury presence"
url: "https://www.luxurypresence.com"
description: "luxury presence makes websites, a crm and marketing tools for real estate agents, teams and brokerages. i started as a ui tech lead and grew into platform + developer tooling work."
period: "may 2022 – dec 2024"
# TODO(ryan): Which year was each hackathon?
# TODO(ryan): The full search demo shows another person on camera near the end, so only the clip is published. Should the full video go up too?
current: false
order: 2
roles:
  - title: "senior software engineer ii, developer experience"
    points:
      - "built command-line tools for 80 engineers to run all the services on their own laptops w/ docker, node.js and process-compose. setup went from hours to minutes."
      - "shipped ai-assisted engineering workflows w/ git worktrees and stacked pull requests, so features + code review moved faster."
      - "released throwaway test environments, so each feature gets tested on its own w/o fighting over a shared one."
      - "built an internal plugin system so every team uses the same tools."
  - title: "senior software engineer, fullstack"
    points:
      - "built and scaled one next.js platform that runs 30k+ websites, for clients like ryan serhant, josh flagg and the umansky team."
      - "set up infrastructure on docker, kubernetes and argo cd that grows w/ traffic, serving 10 million+ requests a day."
      - "cut load time on property pages by 87% (p95, 2.3s to 300ms)."
      - "cut the incident rate by 60% w/ health checks, clean shutdowns and monitoring."
      - "added playwright tests + artillery load tests to every deploy."
  - title: "software engineer, frontend"
    points:
      - "led the move from an old ruby on rails app to next.js + typescript: 300k users across 10k sites, w/ zero downtime."
      - "designed one repo of separately deployed services, and helped build the graphql api gateway behind the web + react native apps."
      - "built the ui component library + design system w/ typescript, react, radix, vite and storybook."
  - title: "senior ui engineer, tech lead"
    points:
      - "delivered a production-ready website template for the ryan serhant partnership within 30 days."
      - "made template work 20% faster w/ a token-based design system."
      - "built tools for the creative team: a git-to-postgres sync, a vite + react preview app and a deploy cli."
demos:
  - slug: "natural-language-search"
    title: "plain-english home search"
    event: "hackweek demo"
    summary: "type a home search the way you'd say it. the search turns it into real listing filters."
    points:
      - "searches like \"miami oceanfront under …\" or \"3 beds rental in palm springs with a pool\""
      - "fills in place, listing type, beds + property type, then shows matches on the map"
      - "built solo on a real estate listing site"
    clip: "natural-language-search-clip.mp4"
    poster: "natural-language-search-poster.webp"
    width: 1280
    height: 800
  - slug: "local-dev-app"
    title: "ai-assisted dev app"
    event: "hackathon demo"
    summary: "a desktop app that sets up a dev workspace, runs everything and turns a plain request into a reviewed code change."
    points:
      - "make a workspace from a few code repos + start each piece in one click"
      - "ask for a change, like \"improve the webpack build time\""
      - "read what it found + its plan, ok it, then check the issues it flags before the change goes up for review"
      - "built solo"
    clip: "local-dev-app-clip.mp4"
    poster: "local-dev-app-poster.webp"
    full: "local-dev-app-full.mp4"
    width: 1280
    height: 720
---
