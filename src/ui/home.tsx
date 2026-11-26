import type { CSSProperties, ReactElement } from "react";

import { ARTICLES_ROUTE, type Article, type CaseStudy, type FaqItem, type Plan } from "../content";
import { BRAND_LOGOS, logoSrc, opticalScale } from "../logos";
import { HIRE_ANCHOR, introCallHref, planHref, QUICK_FIX_MINUTES, SERVICE_AREA_COPY, SITE_CHECK_CTA, SITE_CHECK_NAME, siteCheckHref } from "../site";
import { homeGraph } from "../structured-data";
import { PLAN_SERVICE, type PlanName, serviceBySlug, serviceRoute, SERVICES, SERVICES_ROUTE, type ServiceSlug } from "../services";
import { WORK_ROUTE } from "../work";
import { ABOUT_ROUTE, ArrowLink, Eyebrow, SectionHead, WIDTH } from "./layout";
import { ArticleList } from "./articles";
import { JsonLd } from "./json-ld";
import { CaseStudyGrid, RequestNote } from "./work";

export const START_HERE_LABEL = "start here";
export const SINCE_YEAR = 2017;
export const HERO_LEAD = `i've built websites + software since ${SINCE_YEAR}.`;
export const HERO_TURN = "now i fix yours";
export const CREDENTIALS = [
  "tech lead on holt international's site.",
  "front-end engineer on blackstone + stanford ecorner.",
  `software engineer since ${SINCE_YEAR}, still full-time by day.`,
] as const;
export const SITE_CHECK_LINE = "i look through your whole site + send a plain list of what's broken.";
export const QUICK_FIX_LINE = `fixes under ${QUICK_FIX_MINUTES} min: free.`;
export const PRICING_TERMS = "no contracts. no hourly bills. pause or cancel anytime.";
export const PROJECT_PRICE_LABEL = { price: "quoted", suffix: "up front" } as const;
const COMPACT_PLAN_BULLETS = 4;

export function hireAnchorLine(plans: readonly Plan[]): string | null {
  const monthly = plans.find((plan) => plan.name === "monthly help")?.price;
  if (monthly === undefined || monthly === null) return null;
  return `a full-time web developer costs about ${formatPrice(HIRE_ANCHOR.monthly)} a month in pay alone (${HIRE_ANCHOR.source}). monthly help is ${formatPrice(monthly)}.`;
}
const HOME_ARTICLE_COUNT = 3;

const STEPS = [
  { title: "get a free site check", body: "a plain list of what's broken." },
  { title: "pick how we work", body: "care, monthly help or one project." },
  { title: "check the finished work", body: "most small jobs are back in 2 business days." },
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

export function planCtaHref(plan: Plan): string {
  return plan.price === null ? introCallHref() : planHref(plan.name);
}

function isPlanName(name: string): name is PlanName {
  return Object.hasOwn(PLAN_SERVICE, name);
}

function planService(plan: Plan): ServiceSlug | undefined {
  return isPlanName(plan.name) ? PLAN_SERVICE[plan.name] : undefined;
}

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
  return (
    <p className="mt-8 mb-0 flex items-baseline gap-1.5">
      <span className={amount}>{formatPrice(plan.price)}</span>
      <span className="text-muted">{`/${plan.per}`}</span>
    </p>
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
  const more = showMore ? planService(plan) : undefined;
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
          <a className="link-underline inline-block py-2 text-[0.92rem] text-muted hover:text-ink" href={serviceRoute(more)}>
            {`more about ${serviceBySlug(more).name}`}
          </a>
        )}
      </div>
    </div>
  );
}

function SiteCheckBand(): ReactElement {
  return (
    <div className="reveal rounded-[28px] border border-accent bg-card p-8 sm:p-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div>
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-[0.72rem] font-medium text-on-accent">{START_HERE_LABEL}</span>
        <h3 className="mt-5 mb-0 text-[clamp(2rem,4vw,3.2rem)] leading-none tracking-[-0.045em] font-medium">{SITE_CHECK_NAME}</h3>
        <p className="mt-4 mb-0 text-[1.1rem] text-muted max-w-[34rem]">
          {`${SITE_CHECK_LINE} `}
          <span className="text-ink font-medium">{QUICK_FIX_LINE}</span>
        </p>
      </div>
      <div>
        <ArrowLink href={siteCheckHref()} tone="accent">
          {SITE_CHECK_CTA}
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
        <Eyebrow>{`for small businesses in ${SERVICE_AREA_COPY}`}</Eyebrow>
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
            <ArrowLink href={siteCheckHref()} tone="accent">
              {SITE_CHECK_CTA}
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
      <ul className="m-0 p-0 list-none grid sm:grid-cols-2 gap-x-10 border-b border-line md:ml-[calc(33.333%+0.5rem)]">
        {SERVICES.map((service) => (
          <li className="reveal border-t border-line" key={service.slug}>
            <a className="group flex items-center justify-between gap-4 py-5 text-[1.1rem] leading-snug tracking-[-0.01em] text-ink" href={serviceRoute(service.slug)}>
              <span className="link-underline">{service.name}</span>
              <span className="text-muted transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
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
  const anchor = hireAnchorLine(plans);
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="pricing">
      <SectionHead
        index={sectionIndex(3)}
        label="prices"
        title={
          <>
            flat prices. <span className="serif text-muted">no surprises.</span>
          </>
        }
      />
      <SiteCheckBand />
      <div className="mt-6 grid gap-6 lg:grid-cols-3 items-stretch">
        {plans.map((plan) => (
          <PlanCard key={plan.slug} compact plan={plan} showMore={false} />
        ))}
      </div>
      <p className="mt-10 mb-0 text-center text-ink">{PRICING_TERMS}</p>
      {anchor === null ? null : <p className="mt-2 mb-0 mx-auto max-w-[44rem] text-center text-[0.92rem] text-muted">{anchor}</p>}
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
          index={sectionIndex(4)}
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
      <SectionHead index={sectionIndex(5)} label="questions" title="stuff people ask." />
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
      <Hero />
      <HelpWith />
      <HowItWorks />
      <Pricing plans={plans} />
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
