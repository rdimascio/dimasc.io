---
company: "Luxury Presence"
url: "https://www.luxurypresence.com"
description: "Luxury Presence makes websites, a CRM and marketing tools for residential real estate agents, teams and brokerages. I joined as a UI tech lead and grew into platform and developer experience work."
period: "From May 2022"
# TODO(ryan): When did I leave Luxury Presence (month and year)?
# TODO(ryan): Which year was each hackathon?
# TODO(ryan): The full search demo shows another person on camera near the end, so only the clip is published. Should the full video go up too?
current: false
order: 2
roles:
  - title: "Senior Software Engineer II, Developer Experience"
    points:
      - "Built CLI tooling for 80 engineers to run the microservices locally with Docker, Node.js and process-compose. Setup went from hours to minutes."
      - "Shipped AI-assisted engineering workflows with git worktrees and PR stacking, for faster delivery and code review."
      - "Released ephemeral environments, so each feature is tested in isolation with no staging conflicts."
      - "Built an internal plugin system so teams adopt the same tooling."
  - title: "Senior Software Engineer, Fullstack"
    points:
      - "Built and scaled a multi-tenant Next.js platform that serves 30K+ websites, for clients such as Ryan Serhant, Josh Flagg and the Umansky Team."
      - "Designed horizontally scalable infrastructure on Docker, Kubernetes and Argo CD, serving 10M+ requests/day."
      - "Cut p95 latency on property pages by 87%, from 2.3s to 300ms."
      - "Cut the incident rate by 60% with health checks, graceful shutdowns and monitoring."
      - "Added Playwright tests and Artillery load tests to CI/CD."
  - title: "Software Engineer, Frontend"
    points:
      - "Led the move from a legacy Ruby on Rails app to Next.js and TypeScript: 300k users across 10k sites, with zero downtime."
      - "Designed a monorepo of independently deployed microservices, and contributed to the GraphQL API gateway behind the web and React Native apps."
      - "Built the UI component library and design system with TypeScript, React, Radix, Vite and Storybook."
  - title: "Senior UI Engineer, Tech Lead"
    points:
      - "Delivered a production-ready website template for the Ryan Serhant partnership within 30 days."
      - "Made template development 20% faster with a token-based design system."
      - "Built tooling for the creative team: a Git-to-Postgres sync, a Vite and React preview app, and a deployment CLI."
demos:
  - slug: "natural-language-search"
    title: "Natural language home search"
    event: "Hackweek demo"
    summary: "Type a home search the way you would say it. The search turns it into real listing filters."
    points:
      - "Queries like \"miami oceanfront under …\" or \"3 beds rental in palm springs with a pool\""
      - "Fills in place, listing type, beds and property type, then shows matches on the map"
      - "Built solo on a real estate listing site"
    clip: "natural-language-search-clip.mp4"
    poster: "natural-language-search-poster.webp"
    width: 1280
    height: 800
  - slug: "local-dev-app"
    title: "AI-assisted local development app"
    event: "Hackathon demo"
    summary: "A desktop app that sets up a workspace of repositories, runs the services, and turns a plain request into a reviewed code change."
    points:
      - "Create a workspace from several repositories and start each service in one click"
      - "Ask for a change, such as \"Improve the webpack build time\""
      - "Read the research and the plan, approve it, then review the issues it finds before a pull request"
      - "Built solo"
    clip: "local-dev-app-clip.mp4"
    poster: "local-dev-app-poster.webp"
    full: "local-dev-app-full.mp4"
    width: 1280
    height: 720
---
