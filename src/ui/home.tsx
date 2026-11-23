import type { CSSProperties, ReactElement } from "react";

import { ARTICLES_ROUTE, type Article, type CaseStudy, type FaqItem, listedPlans, type Plan } from "../content";
import { BRAND_LOGOS, logoSrc, opticalScale } from "../logos";
import {
  FRONT_DESK_CHECK_CTA,
  FRONT_DESK_CHECK_MINUTES,
  FRONT_DESK_CHECK_NAME,
  FRONT_DESK_NAME,
  FRONT_DESK_ROUTE,
  FRONT_DESK_TOOLS,
  freeCheckHref,
  introCallHref,
  planHref,
  SERVICE_AREA_COPY,
  websiteFixHref,
} from "../site";
import { homeGraph } from "../structured-data";
import { WORK_ROUTE } from "../work";
import { YOUTH_SPORTS_ROUTE } from "../youth-sports";
import { ABOUT_ROUTE, ArrowLink, Eyebrow, SectionHead, WIDTH } from "./layout";
import { ArticleList } from "./articles";
import { JsonLd } from "./json-ld";
import { CaseStudyGrid, RequestNote } from "./work";

export const START_HERE_LABEL = "start here";
export const SINCE_YEAR = 2017;
export const HERO_EYEBROW = `ai setup for local businesses in ${SERVICE_AREA_COPY}`;
export const HERO_LEAD = "you're missing calls.";
export const HERO_TURN = "i can fix that";
export const CREDENTIALS = [
  "tech lead on holt international + the serhant.com mls home search.",
  "front-end engineer on blackstone + stanford ecorner.",
  `software engineer since ${SINCE_YEAR}. by day at every, a y combinator startup.`,
] as const;
export const WHAT_IT_DOES = [
  "picks up the calls you miss",
  "texts people back",
  "answers booking questions",
  "replies to your google reviews",
] as const;
export const RUNS_IN_LINE = `it runs inside the stuff you already use: ${FRONT_DESK_TOOLS}.`;
export const LOOK_AFTER_LINE = "i set it up, i watch it, i fix it when it breaks. you don't touch it.";
export const CHECK_LINE = `i call your business after hours, like a customer would, + count the google reviews nobody answered. then i show you what that costs in dollars. ${FRONT_DESK_CHECK_MINUTES} minutes.`;
export const PRICING_TERMS = "software billed at cost, no markup. no hourly bills.";
export const PROJECT_PRICE_LABEL = { price: "quoted", suffix: "up front" } as const;
export const WHO_FOR = [
  "youth sports academies + kids' activity centers",
  "gyms, studios + med spas",
  "home services, like hvac, plumbing, landscaping + cleaning",
] as const;
export const WHO_FOR_LINE = `owner-run, 2-30 staff, in ${SERVICE_AREA_COPY}. people book w/ you by phone or app.`;
export const NOT_FOR = [
  "banks, fintech, payments, lending or insurance",
  "back office work for anyone: bookkeeping, accounting, payroll, invoicing, spend tools, hr or benefits",
  "startups + venture-backed companies",
  "restaurants, for now",
  "a custom ai product built from scratch for you to own",
] as const;
export const NOT_FOR_LINE = "i say no to these, + i'm happy to point you somewhere else.";
export const WEBSITE_FIX_NAME = "website fix or rebuild";
const COMPACT_PLAN_BULLETS = 4;
const HOME_ARTICLE_COUNT = 3;

const STEPS = [
  { title: "get a free check", body: "i show you the calls + reviews you're missing, in dollars." },
  { title: "i set it up", body: "in the tools you already pay for, using your hours, prices + faq." },
  { title: "i keep it working", body: "i check it every week + fix what's off." },
] as const;

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

function sectionIndex(position: number): string {
  return `(${String(position).padStart(2, "0")})`;
}

export function frontDeskPlan(plans: readonly Plan[]): Plan & { price: number; setup: number } {
  const plan = plans.find((candidate) => candidate.name === FRONT_DESK_NAME);
  if (plan?.price === null || plan?.price === undefined || plan.setup === undefined) {
    throw new Error(`the "${FRONT_DESK_NAME}" plan needs a monthly price + a setup price`);
  }
  return { ...plan, price: plan.price, setup: plan.setup };
}

function minimumLine(plan: Plan): string {
  return plan.minimumMonths === undefined ? "" : ` ${plan.minimumMonths} months, then month to month.`;
}

export function frontDeskPriceLine(plans: readonly Plan[]): string {
  const plan = frontDeskPlan(plans);
  return `${formatPrice(plan.setup)} to set up. ${formatPrice(plan.price)} a month after that.${minimumLine(plan)}`;
}

export function frontDeskShortPrice(plans: readonly Plan[]): string {
  const plan = frontDeskPlan(plans);
  return `${formatPrice(plan.setup)} to set up, then ${formatPrice(plan.price)}/month.`;
}

export function setupLine(plan: Plan): string | null {
  if (plan.setup === undefined) return null;
  return `+ ${formatPrice(plan.setup)} to set up.${minimumLine(plan)}`;
}

export function priceSuffix(plan: Plan): string {
  return plan.per === "site" ? "flat, per site" : `/${plan.per}`;
}

export function websiteFixPlan(plans: readonly Plan[]): Plan | undefined {
  return plans.find((candidate) => candidate.name === WEBSITE_FIX_NAME);
}

export function planCtaHref(plan: Plan): string {
  return plan.price === null ? introCallHref() : planHref(plan.name);
}

const PLAN_MORE: Readonly<Record<string, { href: () => string; label: string }>> = {
  [FRONT_DESK_NAME]: { href: () => FRONT_DESK_ROUTE, label: `more about the ${FRONT_DESK_NAME}` },
  [WEBSITE_FIX_NAME]: { href: websiteFixHref, label: "more about the website fix" },
};

function PlanPrice({ plan }: { plan: Plan }): ReactElement {
  const amount = "text-[clamp(2.8rem,4.6vw,3.8rem)] leading-none tracking-[-0.055em] font-medium";
  if (plan.price === null) {
    return (
      <p className="mt-8 mb-0 flex items-baseline gap-1.5">
        <span className={`${amount} serif tracking-[-0.02em]`}>{PROJECT_PRICE_LABEL.price}</span>
        <span className="text-muted">{PROJECT_PRICE_LABEL.suffix}</span>
      </p>
    );
  }
  const setup = setupLine(plan);
  return (
    <>
      <p className="mt-8 mb-0 flex items-baseline gap-1.5">
        <span className={amount}>{formatPrice(plan.price)}</span>
        <span className="text-muted">{priceSuffix(plan)}</span>
      </p>
      {setup === null ? null : <p className="mt-3 mb-0 text-muted">{setup}</p>}
    </>
  );
}

export function PlanCard({
  plan,
  showMore = true,
  compact = false,
}: {
  plan: Plan;
  showMore?: boolean;
  compact?: boolean;
}): ReactElement {
  const more = showMore ? PLAN_MORE[plan.name] : undefined;
  const quietTone = plan.price === null ? "bg-bg-soft border-line" : "bg-card border-line";
  const tone = plan.featured ? "night border-line" : quietTone;
  const features = compact ? plan.features.slice(0, COMPACT_PLAN_BULLETS) : plan.features;
  return (
    <div className={`reveal flex flex-col rounded-[28px] border p-8 sm:p-10 ${tone}`}>
      <h3 className="m-0 text-[1.25rem] font-medium">{plan.name}</h3>
      {compact ? null : <p className="mt-2 mb-0 text-muted">{plan.summary}</p>}
      <PlanPrice plan={plan} />
      <ul className="mt-9 mb-10 p-0 list-none flex flex-col border-t border-line">
        {features.map((feature) => (
          <li className="flex gap-3 border-b border-line py-3.5" key={feature}>
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
          <a className="link-underline inline-block py-2 text-[0.92rem] text-muted hover:text-ink" href={more.href()}>
            {more.label}
          </a>
        )}
      </div>
    </div>
  );
}

export function CheckBand(): ReactElement {
  return (
    <div className="reveal rounded-[28px] border border-accent bg-card p-8 sm:p-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div>
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-[0.72rem] font-medium text-on-accent">{START_HERE_LABEL}</span>
        <h3 className="mt-5 mb-0 text-[clamp(2rem,4vw,3.2rem)] leading-none tracking-[-0.045em] font-medium">{FRONT_DESK_CHECK_NAME}</h3>
        <p className="mt-4 mb-0 text-[1.1rem] text-muted max-w-[34rem]">{CHECK_LINE}</p>
      </div>
      <div>
        <ArrowLink href={freeCheckHref()} tone="accent">
          {FRONT_DESK_CHECK_CTA}
        </ArrowLink>
      </div>
    </div>
  );
}

export const LOGO_COPIES_PER_TRACK = 4;

function LogoStrip(): ReactElement {
  const copies = Array.from({ length: LOGO_COPIES_PER_TRACK }, (_, copy) => copy);
  const track = (hidden: boolean): ReactElement => (
    <ul className="marquee-track m-0 p-0 list-none" aria-hidden={hidden ? "true" : undefined}>
      {copies.flatMap((copy) =>
        BRAND_LOGOS.map((logo) => {
          const isRepeat = hidden || copy > 0;
          return (
            <li
              aria-hidden={!hidden && isRepeat ? "true" : undefined}
              className={`flex items-center px-5 sm:px-10${copy > 0 ? " marquee-repeat" : ""}`}
              key={`${copy}-${logo.slug}`}
            >
              <span
                aria-label={isRepeat ? undefined : logo.name}
                className="brand-logo"
                role={isRepeat ? undefined : "img"}
                style={{ "--logo": `url(${logoSrc(logo)})`, "--logo-scale": opticalScale(logo), aspectRatio: logo.ratio } as CSSProperties}
              />
            </li>
          );
        }),
      )}
    </ul>
  );
  return (
    <section aria-label="companies + clients i've built for" className="logo-strip border-t border-line overflow-hidden py-5 sm:py-6">
      <div className="marquee">
        {track(false)}
        {track(true)}
      </div>
    </section>
  );
}

function Hero(): ReactElement {
  return (
    <section className="hero flex flex-col">
      <div className={`${WIDTH} w-full flex-1 flex flex-col justify-center pt-8 sm:pt-12 pb-8 sm:pb-12`}>
        <Eyebrow>{HERO_EYEBROW}</Eyebrow>
        <h1 className="mt-6 sm:mt-8 mb-0 font-semibold leading-[0.98] tracking-[-0.055em] text-[clamp(2.6rem,7vw,7.4rem)] max-w-[14ch] md:max-w-[17ch] [text-wrap:balance]">
          <span className="hero-line">
            <span>
              {`${HERO_LEAD} `}
              <span className="serif font-normal tracking-[-0.02em] text-muted">{HERO_TURN}</span>
              <span className="text-accent-bright">.</span>
            </span>
          </span>
        </h1>
        <div className="mt-8 sm:mt-12 grid gap-7 md:grid-cols-12 md:items-end">
          <ul className="md:col-span-7 m-0 p-0 list-none flex flex-col gap-1.5 text-[0.98rem] sm:text-[1.08rem] leading-snug text-muted">
            {CREDENTIALS.map((line) => (
              <li className="flex gap-2.5" key={line}>
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="md:col-span-5 flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end">
            <ArrowLink href={freeCheckHref()} tone="accent">
              {FRONT_DESK_CHECK_CTA}
            </ArrowLink>
            <a className="link-underline inline-block py-2 text-muted hover:text-ink" href={ABOUT_ROUTE}>
              about me
            </a>
          </div>
        </div>
      </div>
      <LogoStrip />
    </section>
  );
}

function WhatItDoes(): ReactElement {
  return (
    <section className={`${WIDTH} py-24 sm:py-32`} id="ai-front-desk">
      <SectionHead
        aside={
          <a className="link-underline inline-block py-2 text-ink" href={YOUTH_SPORTS_ROUTE}>
            for youth sports
          </a>
        }
        index={sectionIndex(1)}
        label={FRONT_DESK_NAME}
        title={
          <>
            the front desk <span className="serif">that doesn't miss calls.</span>
          </>
        }
      />
      <div className="md:ml-[calc(33.333%+0.5rem)]">
        <ul className="m-0 p-0 list-none grid sm:grid-cols-2 gap-x-10 border-b border-line">
          {WHAT_IT_DOES.map((item) => (
            <li className="reveal flex gap-3 border-t border-line py-5 text-[1.1rem] leading-snug tracking-[-0.01em]" key={item}>
              <span className="text-accent" aria-hidden="true">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 mb-0 text-[1.1rem] max-w-[40rem]">{RUNS_IN_LINE}</p>
        <p className="mt-3 mb-0 text-[1.1rem] text-muted max-w-[40rem]">{LOOK_AFTER_LINE}</p>
        <a className="link-underline mt-6 inline-block py-2 text-ink" href={FRONT_DESK_ROUTE}>
          {`more about the ${FRONT_DESK_NAME}`}
        </a>
      </div>
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
            i set it up. <span className="serif">you don't touch it.</span>
          </>
        }
      />
      <ol className="m-0 p-0 list-none grid gap-x-10 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li className="reveal border-t border-line py-8" key={step.title}>
            <span className="font-mono text-[0.85rem] text-accent">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="m-0 mt-4 text-[clamp(1.6rem,2.6vw,2.2rem)] leading-none tracking-[-0.045em] font-medium">{step.title}</h3>
            <p className="m-0 mt-3 text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Pricing({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="pricing">
      <SectionHead
        index={sectionIndex(3)}
        label="prices"
        title={
          <>
            one offer. <span className="serif text-muted">one price.</span>
          </>
        }
      />
      <CheckBand />
      <div className="mt-6 grid gap-6 lg:grid-cols-2 items-stretch">
        {listedPlans(plans).map((plan) => (
          <PlanCard key={plan.slug} plan={plan} />
        ))}
      </div>
      <p className="mt-10 mb-0 text-center text-ink">{PRICING_TERMS}</p>
    </section>
  );
}

function WhoFor(): ReactElement {
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="who-its-for">
      <SectionHead index={sectionIndex(4)} label="who it's for" title="local businesses that book by phone or app." />
      <div className="md:ml-[calc(33.333%+0.5rem)] grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="m-0 mb-3 text-[1.1rem] font-medium">for</h3>
          <ul className="m-0 p-0 list-none border-b border-line">
            {WHO_FOR.map((item) => (
              <li className="flex gap-3 border-t border-line py-4 leading-snug" key={item}>
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 mb-0 text-muted">{WHO_FOR_LINE}</p>
        </div>
        <div>
          <h3 className="m-0 mb-3 text-[1.1rem] font-medium">not for</h3>
          <ul className="m-0 p-0 list-none border-b border-line">
            {NOT_FOR.map((item) => (
              <li className="flex gap-3 border-t border-line py-4 leading-snug" key={item}>
                <span className="text-muted" aria-hidden="true">
                  ×
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 mb-0 text-muted">{NOT_FOR_LINE}</p>
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
              sites i've <span className="serif text-accent">worked on.</span>
            </>
          }
        />
        <CaseStudyGrid compact studies={studies} />
        <RequestNote />
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
    <section className={`${WIDTH} py-24 sm:py-32`}>
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
      <JsonLd data={homeGraph(listedPlans(plans), faq)} />
      <Hero />
      <WhatItDoes />
      <HowItWorks />
      <Pricing plans={plans} />
      <WhoFor />
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
