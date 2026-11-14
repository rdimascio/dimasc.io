export const SERVICES_ROUTE = "/services";
export const ORANGE_COUNTY_ROUTE = "/orange-county";

export type PlanName = "fix it" | "care" | "monthly help" | "one project";

export type ServiceSlug = "fix-my-website" | "new-website" | "online-booking" | "online-store" | "website-care" | "monthly-help";

export interface ServiceFaq {
  readonly question: string;
  readonly answer: string;
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
  readonly plan: PlanName;
  readonly costNote: string;
  readonly faq: readonly ServiceFaq[];
  readonly related: readonly ServiceSlug[];
}

export const SERVICES: readonly Service[] = [
  {
    slug: "fix-my-website",
    name: "fix my website",
    title: "fix my website: $500 flat, orange county",
    description: "something broken on your website? i fix one thing for $500 flat, paid upfront. if i can't fix it, you get your $500 back.",
    summary: "one thing broken? one fix, $500 flat. if i can't fix it, you get your money back.",
    lede: "one thing broken on your site? send it to me. i fix it for $500 flat. if i can't fix it, you get your $500 back.",
    who: "for small business owners whose site mostly works, but one thing is broken + nobody's around to fix it.",
    includes: [
      "a contact form that stopped sending",
      "a page that looks wrong on phones",
      "a button that does nothing when you tap it",
      "something that used to work + now doesn't",
    ],
    steps: [
      "email me what's broken + a link to your site",
      "if it's bigger than one fix, i tell you before i start",
      "you pay $500 upfront + i fix it, usually in about a week",
      "want someone watching it after? care is $199/month",
    ],
    plan: "fix it",
    costNote: "one fix, one fixed price. if i can't fix it, you get your $500 back.",
    faq: [
      { question: "what if you can't fix it?", answer: "you get your $500 back." },
      {
        question: "what if it's bigger than one fix?",
        answer: "i tell you before i start. then we can split it up, put it on monthly help or quote it as one project. your call.",
      },
      { question: "do i need to know what's wrong?", answer: "no. tell me what you see, like \"the form doesn't send\", + i find the cause." },
      { question: "do i have to sign up for a monthly plan?", answer: "no. one fix is one payment. care is there if you want someone keeping an eye on it after." },
    ],
    related: ["website-care", "monthly-help", "new-website"],
  },
  {
    slug: "new-website",
    name: "a new website",
    title: "small business website design, orange county",
    description: "a new website for your small business, built in small steps. you see one price per step before i start + can stop after any step.",
    summary: "a new site, built in small steps. one price per step, agreed before i start.",
    lede: "your site is old, slow or hard to update, + fixing it piece by piece doesn't make sense anymore. i build you a new one, in small steps, w/ one price per step.",
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
        answer: "maybe not. if a few fixes get you there, i'll say so + we start w/ one fix.",
      },
      {
        question: "who owns the site?",
        answer: "you do. it runs in your own accounts, so it keeps working if we stop working together.",
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
    lede: "people should be able to book from their phone in a few taps. i add booking to your site, or connect the booking tool you already use.",
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
    ],
    related: ["online-store", "monthly-help", "new-website"],
  },
  {
    slug: "online-store",
    name: "an online store",
    title: "shopify + online store help for small shops",
    description: "set up a new online store or fix the one you have, w/o hiring an agency. one price per step, agreed before i start. you own the store.",
    summary: "set up a new store, move to a better one or fix the one you have.",
    lede: "sell online w/o hiring an agency. i set up a new store, move you to a better one, or fix the one you have.",
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
    costNote: "a new store is one project, quoted per step. one broken thing on a store you have is one $500 fix.",
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
    ],
    related: ["online-booking", "new-website", "fix-my-website"],
  },
  {
    slug: "website-care",
    name: "website care",
    title: "website maintenance, $199/month, orange county",
    description: "care is $199/month: updates, uptime + security monitoring, up to 2 small fixes a month + a reply within 1 business day. cancel anytime.",
    summary: "updates, monitoring + up to 2 small fixes a month. $199/month, cancel anytime.",
    lede: "for when your site mostly works + you want someone keeping an eye on it. $199/month, cancel anytime.",
    who: "for owners who don't want to think about updates, or find out the site is down from a customer.",
    includes: ["updates, done for you", "uptime + security monitoring", "up to 2 small fixes a month", "a reply within 1 business day"],
    steps: [
      "email me to ask about care",
      "i set up updates + monitoring on your site",
      "something breaks? tell me. up to 2 small fixes a month are covered",
      "bigger stuff goes on monthly help or gets quoted as one project",
    ],
    plan: "care",
    costNote: "$199/month. cancel anytime.",
    faq: [
      {
        question: "what does care cover?",
        answer: "updates, uptime + security monitoring and up to 2 small fixes a month. i reply within 1 business day.",
      },
      {
        question: "what if i need more than that?",
        answer: "anything bigger goes on monthly help or gets quoted as one project. i tell you before i start.",
      },
      { question: "is hosting included?", answer: "no. your website host's monthly fee gets billed to you directly." },
      { question: "can i cancel?", answer: "yes, anytime." },
    ],
    related: ["fix-my-website", "monthly-help"],
  },
  {
    slug: "monthly-help",
    name: "monthly help",
    title: "monthly website help for small businesses",
    description: "$1,500/month for a website person a few days a month, w/o hiring one. one job at a time, most small jobs done in 2 business days.",
    summary: "a website person a few days a month. one job at a time, as many as you need.",
    lede: "like having a website person on staff a few days a month, w/o hiring one. no hourly bills.",
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
    costNote: "$1,500/month. pause or cancel anytime.",
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
    ],
    related: ["website-care", "online-booking", "new-website"],
  },
];

export const PLAN_SERVICE: Readonly<Record<PlanName, ServiceSlug>> = {
  "fix it": "fix-my-website",
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
