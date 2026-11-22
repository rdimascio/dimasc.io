export const SERVICES_ROUTE = "/services";
export const ORANGE_COUNTY_ROUTE = "/orange-county";

export type PlanName = "care" | "monthly help" | "one project";

export type ServiceSlug =
  | "fix-my-website"
  | "new-website"
  | "online-booking"
  | "online-store"
  | "website-care"
  | "monthly-help"
  | "squarespace-wix-help";

export interface ServiceFaq {
  readonly question: string;
  readonly answer: string;
}

export interface ComparisonRow {
  readonly topic: string;
  readonly typical: string;
  readonly mine: string;
}

export interface StayOrMove {
  readonly stay: readonly string[];
  readonly move: readonly string[];
}

export interface Service {
  readonly slug: ServiceSlug;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly summary: string;
  readonly lede: string;
  readonly who: string;
  readonly includes: readonly string[];
  readonly steps: readonly string[];
  readonly stepsLabel?: string;
  readonly plan: PlanName | null;
  readonly costNote: string;
  readonly faq: readonly ServiceFaq[];
  readonly related: readonly ServiceSlug[];
  readonly comparison?: readonly ComparisonRow[];
  readonly stayOrMove?: StayOrMove;
}

const FIRST_MONTH_NOTE = "in the first month i look through your whole site, get access, and set up backups + monitoring.";

export const SERVICES: readonly Service[] = [
  {
    slug: "fix-my-website",
    name: "fix my website",
    title: "fix my website: free site check, orange county",
    description: "something broken on your website? i check it for free + tell you what's broken. if the fix takes me under 30 min, it's free too.",
    summary: "a free site check. i tell you what's broken. fixes under 30 min are free.",
    lede: "something broken on your site? send it to me. i'm a senior software engineer, so i find why it broke, not just patch it. the check is free, + if the fix takes me under 30 min, i just do it, free.",
    who: "for small business owners whose site mostly works, but one thing is broken + nobody's around to fix it.",
    includes: [
      "a contact form that stopped sending",
      "a page that looks wrong on phones",
      "a button that does nothing when you tap it",
      "something that used to work + now doesn't",
    ],
    stepsLabel: "what happens after you send it",
    steps: [
      "you send me your site + what's bugging you",
      "i reply within 1 business day",
      "i look through your site for free + send you a plain list of what's broken",
      "fixes under 30 min: i just do them, free",
      "bigger fixes go on care or monthly help, or get quoted as one project. no hourly bills",
    ],
    plan: null,
    costNote: "the site check is free, + so are fixes under 30 min. bigger fixes go on care ($199/month) or monthly help ($1,500/month), or get quoted as one project.",
    faq: [
      { question: "what does the site check cost?", answer: "nothing. you don't have to sign up for anything." },
      {
        question: "what if it's bigger than a quick fix?",
        answer: "i tell you before i start. it can go on care or monthly help, or get quoted as one project. your call.",
      },
      { question: "do i need to know what's wrong?", answer: "no. tell me what you see, like \"the form doesn't send\", + i find the cause." },
      {
        question: "who looks at my site?",
        answer:
          "me. i've been a software engineer since 2017. at 10up i was tech lead on holt international's site. i was a front-end engineer there on blackstone + stanford ecorner. at luxury presence i built the platform behind 30k+ websites + was tech lead on the mls home search behind serhant.com.",
      },
      { question: "how fast do you reply?", answer: "within 1 business day, monday to friday. no weekend or same-day emergency help." },
    ],
    related: ["website-care", "monthly-help", "new-website"],
  },
  {
    slug: "new-website",
    name: "a new website",
    title: "small business website design, orange county",
    description: "a new website for your small business, built in small steps. you see one price per step before i start + can stop after any step.",
    summary: "a new site, built in small steps. one price per step, agreed before i start.",
    lede: "your site is old, slow or hard to update, + fixing it piece by piece doesn't make sense anymore. i build you a new one, in small steps, w/ one price per step. i was tech lead on holt international's site. i was a front-end engineer on blackstone + stanford ecorner. yours gets built the same way: tested before you see it, and yours to keep.",
    who: "for owners who've outgrown their site, or never had a real one.",
    includes: [
      "a site that works on phones",
      "pages your staff can update themselves",
      "built so google can read it. no ranking promises",
      "everything runs in your own accounts",
    ],
    steps: [
      "we talk first, then i look at what you have",
      "you get one price for each step, agreed before i start",
      "you pay step by step + can stop after any step",
      "help after launch if you want it",
    ],
    plan: "one project",
    costNote: "a new site is one project, quoted per step. you see each price before i start.",
    faq: [
      {
        question: "how much does a new website cost?",
        answer: "it depends on what you need, so i quote it one step at a time. you see each price before i start + can stop after any step.",
      },
      {
        question: "do i really need a new one?",
        answer: "maybe not. if a few fixes get you there, i'll say so + we start w/ a free site check.",
      },
      {
        question: "who owns the site?",
        answer: "you do. it runs in your own accounts, so it keeps working if we stop working together.",
      },
      {
        question: "can my staff update it?",
        answer: "yes. i set it up so you + your staff can change text, photos + hours w/o me.",
      },
      {
        question: "do you write the words + take the photos?",
        answer: "no. logo, brand design, writing + photos aren't included, but i'm happy to work w/ whoever does them.",
      },
    ],
    related: ["fix-my-website", "online-store", "website-care"],
  },
  {
    slug: "online-booking",
    name: "online booking",
    title: "online booking for gyms + studios",
    description: "let customers book from their phone. i add booking to your website or connect the tool you already use, for gyms, studios + small businesses.",
    summary: "booking on your site that works on phones + doesn't make you type things twice.",
    lede: "people should be able to book from their phone in a few taps. i add booking to your site, or connect the booking tool you already use. getting two systems to talk to each other is what i do all day as a software engineer.",
    who: "for gyms, studios, clinics + anyone who takes classes or appointments.",
    includes: [
      "help picking a booking tool, or keeping the one you have",
      "booking on your site that works on phones",
      "connect it to your other tools so nothing gets typed twice",
      "help moving your customer list if you switch tools",
    ],
    steps: [
      "tell me how people book w/ you now",
      "i look at your site + the tools you use",
      "you get one price for each step, agreed before i start",
      "i build it in small steps, so you see it working as we go",
    ],
    plan: "one project",
    costNote: "setting up booking is usually one project, quoted per step. ongoing changes can go on monthly help.",
    faq: [
      {
        question: "do i have to switch booking software?",
        answer: "no. if what you have works, i connect it to your site. if it doesn't, i tell you what i'd look at + why before you pay for anything.",
      },
      {
        question: "who pays for the booking tool?",
        answer: "you do, directly. the tool's monthly fee gets billed to you, not through me.",
      },
      {
        question: "who owns it?",
        answer: "you do. it all runs in your own accounts, so it keeps working if we stop working together.",
      },
      {
        question: "what does it cost to set up booking?",
        answer: "it's usually one project, quoted per step. you see each price before i start. changes later can go on monthly help.",
      },
    ],
    related: ["online-store", "monthly-help", "new-website"],
  },
  {
    slug: "online-store",
    name: "an online store",
    title: "shopify + online store help for small shops",
    description: "set up a new online store or fix the one you have, w/o hiring an agency. one price per step, agreed before i start. you own the store.",
    summary: "set up a new store, move to a better one or fix the one you have.",
    lede: "sell online w/ a senior software engineer in your corner, not an agency. i set up a new store, move you to a better one, or fix the one you have. when the store + your other tools won't connect, i fix that part too.",
    who: "for small shops + makers who want to sell online, or sell more online.",
    includes: [
      "a new store on a platform like shopify",
      "fix checkout, product pages + anything that looks off on phones",
      "pages your staff can update themselves",
      "connect the store to your other tools",
    ],
    steps: [
      "tell me what you sell + how you sell it now",
      "i look at what you have + tell you what i'd pick + why",
      "you get one price for each step, agreed before i start",
      "i build it in small steps + you can stop after any step",
    ],
    plan: "one project",
    costNote: "a new store is one project, quoted per step. one broken thing on a store you have starts w/ a free site check.",
    faq: [
      {
        question: "which store platform should i use?",
        answer: "it depends on what you sell + how. i tell you what i'd pick + why before you pay for anything.",
      },
      {
        question: "who pays for the store platform?",
        answer: "you do, directly. its monthly fee gets billed to you, not through me.",
      },
      {
        question: "who owns the store?",
        answer: "you do. it runs in your own accounts, so it keeps working if we stop working together.",
      },
      {
        question: "can you fix my store w/o rebuilding it?",
        answer: "usually, yes. one broken thing starts w/ a free site check. if the fix takes me under 30 min, it's free.",
      },
    ],
    related: ["online-booking", "new-website", "fix-my-website"],
  },
  {
    slug: "website-care",
    name: "website care",
    title: "website maintenance, $199/month, orange county",
    description: "care from a senior software engineer, not a plugin-update plan. $199/month: updates, monitoring + up to 2 small fixes a month. cancel anytime.",
    summary: "an engineer watching your site: updates, monitoring + up to 2 small fixes a month. $199/month, cancel anytime.",
    lede: "a senior software engineer keeping an eye on your site. not a plugin-update plan. $199/month, cancel anytime.",
    who: "for owners who don't want to think about updates, or find out the site is down from a customer.",
    includes: [
      "updates, done for you. i check the site still works after each one",
      "uptime + security monitoring that tells me when something breaks",
      "up to 2 small fixes a month, done by me. i find the cause, not just the symptom",
      "a reply within 1 business day, from me",
    ],
    steps: [
      "email me to ask about care",
      "i look through your site first, then set up updates + monitoring",
      "something breaks? tell me. up to 2 small fixes a month are covered",
      "bigger stuff goes on monthly help or gets quoted as one project",
    ],
    plan: "care",
    costNote: `$199/month. ${FIRST_MONTH_NOTE} no long-term contract, cancel anytime.`,
    faq: [
      {
        question: "how is this different from a $50 maintenance plan?",
        answer:
          "a lot of those are someone logging in once a month to click update on plugins. that works till an update breaks your booking form. then you need someone who can read the code + find out why. that's the part i do. i'm a senior software engineer. at luxury presence i worked on the platform behind 30k+ websites and cut how often it broke by 60%.",
      },
      {
        question: "are you a wordpress person?",
        answer: "i've worked w/ wordpress, but i'm a software engineer, not a plugin installer. if the fix is a setting, i change the setting. if it's code, i fix the code.",
      },
      {
        question: "what does care cover?",
        answer: "updates, uptime + security monitoring and up to 2 small fixes a month, all done by me. i reply within 1 business day.",
      },
      { question: "is hosting included?", answer: "no. your website host's monthly fee gets billed to you directly." },
    ],
    comparison: [
      { topic: "who does it", typical: "whoever is on the ticket", mine: "me, a senior software engineer, every time" },
      { topic: "updates", typical: "click update once a month", mine: "update, then check the site still works" },
      {
        topic: "when an update breaks something",
        typical: "\"that's out of scope\"",
        mine: "i find the cause + fix it. up to 2 small fixes a month are covered",
      },
      {
        topic: "when it's bigger than a small fix",
        typical: "a surprise invoice",
        mine: "i tell you before i start. it goes on monthly help or gets quoted as one project",
      },
      { topic: "if you leave", typical: "depends on the contract", mine: "cancel anytime. everything stays in your accounts" },
    ],
    related: ["fix-my-website", "monthly-help"],
  },
  {
    slug: "monthly-help",
    name: "monthly help",
    title: "monthly website help for small businesses",
    description: "$1,500/month for a senior software engineer a few days a month, w/o hiring one. one job at a time, most small jobs done in 2 business days.",
    summary: "a senior engineer a few days a month. one job at a time, as many as you need.",
    lede: "like having a senior software engineer on staff a few days a month, w/o hiring one. no hourly bills.",
    who: "for owners w/ a steady list of website + tool jobs, not just one fix.",
    includes: [
      "fix what's broken on your website",
      "new pages your staff can update themselves",
      "connect your tools so nothing gets typed twice",
      "simple internal tools + reports",
    ],
    steps: [
      "add jobs to your list: a fix, a page, a new tool",
      "i work through them in order, one at a time",
      "most small jobs come back in 2 business days",
      "check the finished work. i keep going until it's right",
    ],
    plan: "monthly help",
    costNote: `$1,500/month. ${FIRST_MONTH_NOTE} no long-term contract, pause or cancel anytime.`,
    faq: [
      {
        question: "how fast do i get stuff back?",
        answer: "most small jobs are done in 2 business days. bigger ones get split into smaller pieces, so you see progress every couple days.",
      },
      {
        question: "how does pausing work?",
        answer: "monthly help is billed once a month. pause whenever, and the unused days wait for you till you come back.",
      },
      {
        question: "what if it's not a fit?",
        answer: "not happy in the first 7 days? cancel and i refund 75% of your first payment, even if i already delivered work.",
      },
      {
        question: "what counts as a job?",
        answer: "a fix, a new page, connecting two tools, a simple report. one at a time, as many as you need in the month.",
      },
    ],
    related: ["website-care", "online-booking", "new-website"],
  },
  {
    slug: "squarespace-wix-help",
    name: "squarespace + wix help",
    title: "squarespace, wix + wordpress help, orange county",
    description:
      "site on squarespace, wix, godaddy or wordpress? i fix what's broken + tell you straight if you should stay or move. the site check is free.",
    summary: "fixes for sites on squarespace, wix, godaddy + wordpress. stay or move, i'll tell you straight.",
    lede: "your site is on squarespace, wix, godaddy or wordpress, + something's off. i fix it on the platform you already have. you might not need to move, + i'll tell you straight if you do.",
    who: "for owners who built the site themselves, or had someone build it + can't reach them anymore.",
    includes: [
      "a contact or booking form that stopped sending",
      "pages that look wrong on phones",
      "a domain or email that broke after a change",
      "page titles, descriptions + heavy images that make it hard for google to read your site",
      "booking, payment or newsletter tools that won't connect",
    ],
    stepsLabel: "what happens after you send it",
    steps: [
      "you send me your site + what's bugging you",
      "i look through it for free + send you a plain list of what's broken",
      "fixes under 30 min: i just do them, free",
      "bigger fixes go on care or monthly help, or get quoted as one project",
    ],
    plan: null,
    costNote:
      "the site check is free, + so are fixes under 30 min. bigger fixes go on care ($199/month) or monthly help ($1,500/month), or get quoted as one project. a move to a new platform is one project, quoted per step.",
    stayOrMove: {
      stay: [
        "the site mostly works + you can update it yourself",
        "the problem is a setting, the layout or one broken form",
        "the monthly fee feels fair for what you get",
      ],
      move: [
        "the platform won't let you do something you need, like booking that talks to your other tools",
        "you pay for add-ons to patch things the platform should do",
        "the site is slow on phones + no setting fixes it",
      ],
    },
    faq: [
      {
        question: "do you work on squarespace + wix sites?",
        answer:
          "yes. i'm a software engineer, not a squarespace or wix partner. these builders hide most of the code, so most fixes are a setting, the layout, the domain or a tool plugged into the site.",
      },
      {
        question: "should i move off squarespace or wix?",
        answer:
          "usually not. if a few fixes get you there, i'll say so. i only suggest a move when the platform itself is what's in the way, + you see the price for each step before i start.",
      },
      {
        question: "can you fix my godaddy site?",
        answer: "probably. godaddy sells a site builder + wordpress hosting, + they break in different ways. the free site check tells you which one you have + what's wrong.",
      },
      {
        question: "what about wordpress?",
        answer: "i've worked w/ wordpress, but i'm a software engineer, not a plugin installer. if the fix is a setting, i change the setting. if it's code, i fix the code.",
      },
      {
        question: "who owns the site if i move?",
        answer: "you do. it runs in your own accounts, so it keeps working if we stop working together.",
      },
    ],
    related: ["fix-my-website", "website-care", "new-website"],
  },
];

export const PLAN_SERVICE: Readonly<Record<PlanName, ServiceSlug>> = {
  care: "website-care",
  "monthly help": "monthly-help",
  "one project": "new-website",
};

export function serviceRoute(slug: ServiceSlug): string {
  return `${SERVICES_ROUTE}/${slug}`;
}

export function serviceBySlug(slug: ServiceSlug): Service {
  const service = SERVICES.find((candidate) => candidate.slug === slug);
  if (service === undefined) throw new Error(`unknown service "${slug}"`);
  return service;
}

export function serviceRoutes(): string[] {
  return [SERVICES_ROUTE, ...SERVICES.map((service) => serviceRoute(service.slug)), ORANGE_COUNTY_ROUTE];
}
