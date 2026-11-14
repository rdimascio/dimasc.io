import type { CSSProperties, ReactElement } from "react";

import { ARTICLES_ROUTE, type Article, type CaseStudy, type FaqItem, type Plan } from "../content";
import { BRAND_LOGOS, logoSrc, opticalScale } from "../logos";
import {
  HIRE_ANCHOR,
  introCallHref,
  MAX_SUBSCRIPTION_CLIENTS,
  planHref,
  QUICK_FIX_MINUTES,
  SERVICE_AREA_COPY,
  SERVICE_AREA_SHORT,
  SITE_CHECK_CTA,
  SITE_CHECK_NAME,
  siteCheckHref,
} from "../site";
import { homeGraph } from "../structured-data";
import { PLAN_SERVICE, type PlanName, serviceBySlug, serviceRoute, SERVICES_ROUTE, type ServiceSlug } from "../services";
import { projectName, WORK_ROUTE } from "../work";
import { ABOUT_ROUTE, ArrowLink, Eyebrow, SectionHead, WIDTH } from "./layout";
import { ArticleList } from "./articles";
import { JsonLd } from "./json-ld";
import { CaseStudyGrid, RequestNote } from "./work";

export const REFUND_RULE = "monthly help: not happy in the first 7 days? cancel and i refund 75% of your first payment, even if i already delivered work. care is cancel anytime.";
export const NO_CONTRACT_LINE = "no long-term contract + no hourly bills.";
export const CAPACITY_LINE = "i only take a few clients at a time, so i can do all the work myself.";
export const START_HERE_LABEL = "start here";
export const STAFF_LINE = "monthly help is like having a senior software engineer on staff a few days a month, w/o hiring one. no hourly bills.";
export const SINCE_YEAR = 2017;
export const HERO_LEAD = "i built the platform behind 30k+ websites.";
export const HERO_TURN = "now i fix yours";
export const HERO_SUB = `i'm a senior software engineer in ${SERVICE_AREA_SHORT}, by day at every, a y combinator startup. since ${SINCE_YEAR} i've worked on sites for blackstone, stanford ecorner + serhant. now i fix + look after small-business sites myself.`;

export const SITE_CHECK_FEATURES = [
  "i look through your whole site",
  "you get a plain list of what's broken",
  `fixes under ${QUICK_FIX_MINUTES} min: free`,
  "bigger fixes go on care or monthly help, or get quoted as one project",
] as const;

export function hireAnchorLine(plans: readonly Plan[]): string | null {
  const monthly = plans.find((plan) => plan.name === "monthly help")?.price;
  if (monthly === undefined || monthly === null) return null;
  return `a full-time web developer costs about ${formatPrice(HIRE_ANCHOR.monthly)} a month in pay alone (${HIRE_ANCHOR.source}). monthly help is ${formatPrice(monthly)}.`;
}
const HOME_ARTICLE_COUNT = 3;

const HELP_WITH: readonly { label: string; service?: ServiceSlug }[] = [
  { label: "fix what's broken on your website", service: "fix-my-website" },
  { label: "new pages or a whole new site", service: "new-website" },
  { label: "a website that works on phones + shows up on google" },
  { label: "pages your staff can update themselves" },
  { label: "connect your tools so nothing gets typed twice", service: "monthly-help" },
  { label: "simple internal tools + reports" },
  { label: "automate the repetitive stuff" },
  { label: "answer the questions customers ask every day, automatically" },
];

const STEPS = [
  { title: "get a free site check", body: "i tell you what's broken. then pick care, monthly help or one price for one project. you get one list for everything you ask for." },
  { title: "add jobs to your list", body: "what's broken or slowing you down: a fix, a page, a new tool." },
  { title: "check the finished work", body: "most small jobs come back in 2 business days. i keep going until it's right." },
] as const;

const WHAT_YOU_GET = [
  { title: "one list for everything", body: "everything you asked for + where each one stands. no chasing." },
  { title: "one flat monthly price", body: "no hourly bills. you know the number before i start." },
  { title: "a reply within 1 business day", body: "monday to friday. no weekend or same-day emergency help." },
  { title: "pause anytime", body: "you're billed once a month. pause, and the unused days wait for you." },
  { title: "you own everything", body: "it all runs in your accounts, so you're never stuck w/ me." },
  {
    title: "i do the work",
    body: "no juniors, no outsourcing. i set up ai coding tools for a team of 80 engineers, and i use the same kind on your site. i still read + test every change.",
  },
] as const;

const BOARD = [
  { title: "contact form stopped sending emails", status: "done", tone: "bg-sage", meta: "2 days" },
  { title: "new services page staff can update", status: "ready for you to check", tone: "bg-sky", meta: "today" },
  { title: "weekly sales report in your inbox", status: "i'm working on it", tone: "bg-butter", meta: "started tue" },
  { title: "an automatic helper for common customer questions", status: "waiting its turn", tone: "bg-blush", meta: "next up" },
] as const;

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

function sectionIndex(position: number): string {
  return `(${String(position).padStart(2, "0")})`;
}

export function lowestPrice(plans: readonly Plan[]): number | null {
  const prices = plans
    .filter((plan) => plan.per === "month")
    .map((plan) => plan.price)
    .filter((price): price is number => price !== null);
  return prices.length === 0 ? null : Math.min(...prices);
}

export function startingPricesLine(plans: readonly Plan[]): string {
  const monthly = lowestPrice(plans);
  const parts = [SITE_CHECK_NAME, ...(monthly === null ? [] : [`care from ${formatPrice(monthly)}/month`])];
  return `${parts.join(", ")}, or one project for one price.`;
}

export function setupLine(setup: number): string {
  return `+ ${formatPrice(setup)} setup`;
}

function listNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function endSentence(text: string): string {
  return text.endsWith(".") ? text : `${text}.`;
}

export function planCtaHref(plan: Plan): string {
  return plan.price === null ? introCallHref() : planHref(plan.name);
}

function isPlanName(name: string): name is PlanName {
  return Object.hasOwn(PLAN_SERVICE, name);
}

function planService(plan: Plan): ServiceSlug | undefined {
  return isPlanName(plan.name) ? PLAN_SERVICE[plan.name] : undefined;
}

export function PlanCard({ plan, showMore = true }: { plan: Plan; showMore?: boolean }): ReactElement {
  const more = showMore ? planService(plan) : undefined;
  const quietTone = plan.price === null ? "bg-bg-soft border-line" : "bg-card border-line";
  const tone = plan.featured ? "night border-transparent" : quietTone;
  return (
    <div className={`reveal flex flex-col rounded-[28px] border p-7 sm:p-9 ${tone}`}>
      <h3 className="m-0 text-[1.25rem] font-medium">{plan.name}</h3>
      <p className="mt-2 mb-0 text-muted">{plan.summary}</p>
      <p className="mt-10 mb-0 flex items-baseline gap-1.5">
        <span className="text-[clamp(2.8rem,4.6vw,3.8rem)] leading-none tracking-[-0.055em] font-medium">
          {plan.price === null ? <span className="serif tracking-[-0.02em]">let's talk</span> : formatPrice(plan.price)}
        </span>
        {plan.price === null ? null : <span className="text-muted">{`/${plan.per}`}</span>}
      </p>
      {plan.setup === undefined ? null : <p className="mt-3 mb-0 text-[0.92rem] text-muted">{setupLine(plan.setup)}</p>}
      <ul className="mt-9 mb-10 p-0 list-none flex flex-col border-t border-line">
        {plan.features.map((feature) => (
          <li className="flex gap-3 border-b border-line py-3" key={feature}>
            <span className="text-accent" aria-hidden="true">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col items-start gap-4">
        <ArrowLink href={planCtaHref(plan)} tone={plan.featured ? "accent" : "ink"}>
          {plan.cta}
        </ArrowLink>
        {more === undefined ? null : (
          <a className="link-underline inline-block py-2 text-[0.92rem] text-muted hover:text-ink" href={serviceRoute(more)}>
            {`more about ${serviceBySlug(more).name}`}
          </a>
        )}
      </div>
    </div>
  );
}

function SiteCheckCard(): ReactElement {
  return (
    <div className="reveal flex flex-col rounded-[28px] border border-accent bg-card p-7 sm:p-9">
      <span className="self-start rounded-full bg-accent px-3 py-1 text-[0.72rem] font-medium text-on-accent">{START_HERE_LABEL}</span>
      <h3 className="mt-4 mb-0 text-[1.25rem] font-medium">{SITE_CHECK_NAME}</h3>
      <p className="mt-2 mb-0 text-muted">i tell you what's broken, in plain words.</p>
      <p className="mt-10 mb-0 text-[clamp(2.8rem,4.6vw,3.8rem)] leading-none tracking-[-0.055em] font-medium">free</p>
      <ul className="mt-9 mb-10 p-0 list-none flex flex-col border-t border-line">
        {SITE_CHECK_FEATURES.map((feature) => (
          <li className="flex gap-3 border-b border-line py-3" key={feature}>
            <span className="text-accent" aria-hidden="true">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col items-start gap-4">
        <ArrowLink href={siteCheckHref()} tone="accent">
          {SITE_CHECK_CTA}
        </ArrowLink>
      </div>
    </div>
  );
}

function ExampleBoard(): ReactElement {
  return (
    <figure className="reveal m-0 rounded-[28px] bg-card border border-line p-4 sm:p-5 shadow-[0_40px_80px_-40px_rgba(40,30,20,0.35)]">
      <figcaption className="flex items-center justify-between px-2 pb-4">
        <span className="font-medium">your job list</span>
        <span className="font-mono text-[0.72rem] tracking-[0.06em] text-muted">example</span>
      </figcaption>
      <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
        {BOARD.map((item) => (
          <li className="rounded-2xl border border-line bg-bg px-4 py-3.5 flex items-start justify-between gap-4" key={item.title}>
            <span className="text-[0.95rem] leading-snug">{item.title}</span>
            <span className="flex flex-col items-end gap-1 shrink-0">
              <span className={`rounded-full px-2.5 py-1 text-[0.72rem] font-medium text-ink ${item.tone}`}>{item.status}</span>
              <span className="font-mono text-[0.68rem] text-muted">{item.meta}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function Hero({ plans }: { plans: readonly Plan[] }): ReactElement {
  const pricesLine = startingPricesLine(plans);
  return (
    <section className={`${WIDTH} pt-10 sm:pt-16 pb-12 sm:pb-20`}>
      <Eyebrow>{`for small businesses in ${SERVICE_AREA_COPY}`}</Eyebrow>
      <h1 className="mt-8 sm:mt-10 mb-0 font-semibold leading-[0.98] tracking-[-0.055em] text-[clamp(3rem,9vw,9.6rem)] max-w-[13ch] [text-wrap:balance]">
        <span className="hero-line">
          <span>
            {`${HERO_LEAD} `}
            <span className="serif font-normal tracking-[-0.02em] text-muted">{HERO_TURN}</span>
            <span className="text-accent-bright">.</span>
          </span>
        </span>
      </h1>
      <div className="mt-12 sm:mt-16 grid gap-10 md:grid-cols-12 items-end">
        <p className="md:col-span-6 m-0 text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.35] tracking-[-0.02em] max-w-[32rem] [text-wrap:pretty]">
          {HERO_SUB}
        </p>
        <div className="md:col-span-6 flex flex-col gap-5 md:items-end">
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <ArrowLink href={siteCheckHref()} tone="accent">
              {SITE_CHECK_CTA}
            </ArrowLink>
            <a className="link-underline inline-block py-2 text-muted hover:text-ink" href="#pricing">
              see prices
            </a>
          </div>
          <p className="m-0 text-[0.95rem] text-muted md:text-right">{`${pricesLine} cancel care anytime.`}</p>
        </div>
      </div>
    </section>
  );
}

function LogoStrip(): ReactElement {
  const track = (hidden: boolean): ReactElement => (
    <ul className="marquee-track m-0 p-0 list-none" aria-hidden={hidden ? "true" : undefined}>
      {BRAND_LOGOS.map((logo) => (
        <li className="flex items-center px-6 sm:px-12" key={logo.slug}>
          <span
            aria-label={hidden ? undefined : logo.name}
            className="brand-logo"
            role={hidden ? undefined : "img"}
            style={{ "--logo": `url(${logoSrc(logo)})`, "--logo-scale": opticalScale(logo), aspectRatio: logo.ratio } as CSSProperties}
          />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="companies + clients i've built for"className="border-y border-line overflow-hidden py-7 sm:py-9">
      <div className="marquee">
        {track(false)}
        {track(true)}
      </div>
    </section>
  );
}

function HelpWith(): ReactElement {
  return (
    <section className={`${WIDTH} py-24 sm:py-32`}>
      <SectionHead
        aside={
          <a className="link-underline inline-block py-2 text-ink" href={SERVICES_ROUTE}>
            all services
          </a>
        }
        index={sectionIndex(1)}
        label="things i can help with"
        title="the usual stuff that eats your week."
      />
      <ol className="m-0 p-0 list-none grid sm:grid-cols-2 gap-x-10 border-b border-line md:ml-[calc(33.333%+0.5rem)]">
        {HELP_WITH.map((item, index) => (
          <li className="reveal flex gap-4 border-t border-line py-5" key={item.label}>
            <span className="font-mono text-[0.8rem] text-accent pt-1">{String(index + 1).padStart(2, "0")}</span>
            {item.service === undefined ? (
              <span className="text-[1.1rem] leading-snug tracking-[-0.01em]">{item.label}</span>
            ) : (
              <a className="link-underline text-[1.1rem] leading-snug tracking-[-0.01em] text-ink" href={serviceRoute(item.service)}>
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function HowItWorks(): ReactElement {
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="how-it-works">
      <SectionHead
        index={sectionIndex(2)}
        label="how it works"
        title={
          <>
            tell me what needs doing. <span className="serif">i do it.</span>
          </>
        }
      />
      <div className="grid gap-12 lg:grid-cols-12 items-start">
        <ol className="lg:col-span-7 m-0 p-0 list-none flex flex-col">
          {STEPS.map((step, index) => (
            <li className="reveal grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-t border-line py-8" key={step.title}>
              <span className="font-mono text-[0.85rem] text-accent pt-2">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="m-0 text-[clamp(1.8rem,3.4vw,2.8rem)] leading-none tracking-[-0.045em] font-medium">{step.title}</h3>
                <p className="m-0 mt-3 text-muted max-w-[28rem]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <ExampleBoard />
        </div>
      </div>
    </section>
  );
}

function Pricing({ plans }: { plans: readonly Plan[] }): ReactElement {
  const anchor = hireAnchorLine(plans);
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="pricing">
      <SectionHead
        index={sectionIndex(3)}
        label="prices"
        title={
          <>
            start w/ a free site check. <span className="serif text-muted">then care, monthly help or one project.</span>
          </>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 items-stretch">
        <SiteCheckCard />
        {plans.map((plan) => (
          <PlanCard key={plan.slug} plan={plan} />
        ))}
      </div>
      <p className="mt-10 mb-0 text-center text-ink">{STAFF_LINE}</p>
      {anchor === null ? null : <p className="mt-2 mb-0 text-center text-muted">{anchor}</p>}
      <p className="mt-2 mb-0 text-center text-muted">{`${NO_CONTRACT_LINE} ${REFUND_RULE}`}</p>
      <p className="mt-2 mb-0 text-center text-muted">{CAPACITY_LINE}</p>
      {MAX_SUBSCRIPTION_CLIENTS === null ? null : (
        <p className="mt-2 mb-0 text-center text-muted">i take {MAX_SUBSCRIPTION_CLIENTS} monthly clients max at a time.</p>
      )}
    </section>
  );
}

function WhatYouGet(): ReactElement {
  return (
    <section className="bg-bg-soft">
      <div className={`${WIDTH} py-24 sm:py-32`}>
        <SectionHead
          index={sectionIndex(4)}
          label="what you get"
          title={
            <>
              a senior engineer, <span className="serif">w/o hiring one.</span>
            </>
          }
        />
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {WHAT_YOU_GET.map((item, index) => (
            <div className="reveal border-t border-ink pt-5" key={item.title}>
              <span className="font-mono text-[0.72rem] text-muted">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="m-0 mt-4 mb-2 text-[1.2rem] tracking-[-0.02em] font-medium">{item.title}</h3>
              <p className="m-0 text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work({ studies }: { studies: readonly CaseStudy[] }): ReactElement | null {
  if (studies.length === 0) return null;
  return (
    <section className="night scroll-mt-16" id="work">
      <div className={`${WIDTH} py-24 sm:py-32`}>
        <SectionHead
          aside={
            <a className="link-underline inline-block py-2 text-ink" href={WORK_ROUTE}>
              all past work
            </a>
          }
          index={sectionIndex(5)}
          label="past work"
          title={
            <>
              stuff i've worked on <span className="serif text-accent">at agencies + product teams.</span>
            </>
          }
        />
        <CaseStudyGrid studies={studies} />
        <RequestNote />
      </div>
    </section>
  );
}

function SinceLine({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  const names = studies.map(projectName);
  return (
    <section className={`${WIDTH} py-20 sm:py-28`}>
      <div className="border-t border-ink pt-8 flex flex-wrap items-end justify-between gap-6">
        <p className="m-0 text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.15] tracking-[-0.035em] font-medium max-w-[34rem] [text-wrap:balance]">
          {endSentence(`software engineer since ${SINCE_YEAR}.${names.length === 0 ? "" : ` sites for ${listNames(names)}`}`)}
        </p>
        <ArrowLink href={ABOUT_ROUTE} tone="ghost">
          about me
        </ArrowLink>
      </div>
    </section>
  );
}

function LatestArticles({ articles }: { articles: readonly Article[] }): ReactElement | null {
  if (articles.length === 0) return null;
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32`}>
      <SectionHead
        aside={
          <a className="link-underline inline-block py-2 text-ink" href={ARTICLES_ROUTE}>
            all articles
          </a>
        }
        label="articles"
        title="stuff i've written."
      />
      <ArticleList articles={articles.slice(0, HOME_ARTICLE_COUNT)} />
    </section>
  );
}

function Faq({ faq }: { faq: readonly FaqItem[] }): ReactElement {
  return (
    <section className={`${WIDTH} pb-28 sm:pb-36`}>
      <SectionHead index={sectionIndex(6)} label="questions" title="stuff people ask." />
      <div className="md:ml-[calc(33.333%+0.5rem)] border-b border-line">
        {faq.map((item) => (
          <details className="group border-t border-line py-6" key={item.slug}>
            <summary className="flex justify-between gap-6 cursor-pointer list-none text-[clamp(1.1rem,1.6vw,1.3rem)] tracking-[-0.015em] font-medium rounded-md [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                className="grid place-items-center shrink-0 w-8 h-8 rounded-full border border-line text-muted transition-transform duration-300 group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <div className="prose mt-4 max-w-[40rem]" dangerouslySetInnerHTML={{ __html: item.html }} />
          </details>
        ))}
      </div>
    </section>
  );
}

export function Home({
  studies,
  plans,
  faq,
  articles,
}: {
  studies: readonly CaseStudy[];
  plans: readonly Plan[];
  faq: readonly FaqItem[];
  articles: readonly Article[];
}): ReactElement {
  return (
    <main>
      <JsonLd data={homeGraph(plans, faq)} />
      <Hero plans={plans} />
      <SinceLine studies={studies} />
      <LogoStrip />
      <HelpWith />
      <HowItWorks />
      <Pricing plans={plans} />
      <WhatYouGet />
      <Work studies={studies} />
      <LatestArticles articles={articles} />
      <Faq faq={faq} />
    </main>
  );
}

export function makeHome(
  studies: readonly CaseStudy[],
  plans: readonly Plan[],
  faq: readonly FaqItem[],
  articles: readonly Article[],
): () => ReactElement {
  return function BoundHome(): ReactElement {
    return <Home articles={articles} faq={faq} plans={plans} studies={studies} />;
  };
}
