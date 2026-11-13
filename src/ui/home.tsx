import type { CSSProperties, ReactElement } from "react";

import type { CaseStudy, FaqItem, Plan } from "../content";
import { BRAND_LOGOS, logoSrc, opticalScale } from "../logos";
import { fixRequestHref, introCallHref, MAX_SUBSCRIPTION_CLIENTS, planHref } from "../site";
import { projectName, WORK_ROUTE } from "../work";
import { ABOUT_ROUTE, ArrowLink, Eyebrow, SectionHead, WIDTH } from "./layout";
import { CaseStudyGrid, RequestNote } from "./work";

export const REFUND_RULE = "monthly help: not happy in the first 7 days? cancel and i refund 75% of your first payment, even if i already delivered work. care is cancel anytime.";
export const STAFF_LINE = "monthly help is like having a website person on staff a few days a month, w/o hiring one. no hourly bills.";
export const SINCE_YEAR = 2017;

const HELP_WITH = [
  "fix what's broken on your website",
  "new pages or a whole new site",
  "a website that works on phones + shows up on google",
  "pages your staff can update themselves",
  "connect your tools so nothing gets typed twice",
  "simple internal tools + reports",
  "automate the repetitive stuff",
  "answer the questions customers ask every day, automatically",
] as const;

const STEPS = [
  { title: "pick a plan", body: "care, monthly help or one price for one project. you get one list for everything you ask for." },
  { title: "add jobs to your list", body: "what's broken or slowing you down: a fix, a page, a new tool." },
  { title: "check the finished work", body: "most small jobs come back in 2 business days. i keep going until it's right." },
] as const;

const WHAT_YOU_GET = [
  { title: "one list for everything", body: "everything you asked for + where each one stands. no chasing." },
  { title: "one flat monthly price", body: "no hourly bills, no surprise invoices." },
  { title: "a reply within 1 business day", body: "monday to friday. no weekend or same-day emergency help." },
  { title: "pause anytime", body: "you're billed once a month. pause, and the unused days wait for you." },
  { title: "you own everything", body: "it all runs in your accounts, so you're never stuck w/ me." },
  { title: "you work w/ me", body: "i do all the work myself + test every change. i use modern tools, including ai, to work faster." },
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
  const prices = plans.map((plan) => plan.price).filter((price): price is number => price !== null);
  return prices.length === 0 ? null : Math.min(...prices);
}

function listNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function endSentence(text: string): string {
  return text.endsWith(".") ? text : `${text}.`;
}

function PlanCard({ plan }: { plan: Plan }): ReactElement {
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
        {plan.price === null ? null : <span className="text-muted">/month</span>}
      </p>
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
      <div className="mt-auto">
        <ArrowLink href={plan.price === null ? introCallHref() : planHref(plan.name)} tone={plan.featured ? "accent" : "ink"}>
          {plan.cta}
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
  const fromPrice = lowestPrice(plans);
  return (
    <section className={`${WIDTH} pt-10 sm:pt-16 pb-12 sm:pb-20`}>
      <Eyebrow>for small businesses</Eyebrow>
      <h1 className="mt-8 sm:mt-10 mb-0 font-semibold leading-[0.98] tracking-[-0.055em] text-[clamp(3rem,9vw,9.6rem)] max-w-[13ch] [text-wrap:balance]">
        <span className="hero-line">
          <span>
            i make websites, <span className="serif font-normal tracking-[-0.02em] text-muted">and fix the one you have</span>
            <span className="text-accent-bright">.</span>
          </span>
        </span>
      </h1>
      <div className="mt-12 sm:mt-16 grid gap-10 md:grid-cols-12 items-end">
        <p className="md:col-span-6 m-0 text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.35] tracking-[-0.02em] max-w-[32rem] [text-wrap:pretty]">
          i fix + improve your website and the tools behind it. most small fixes are done in 2 business days.
        </p>
        <div className="md:col-span-6 flex flex-col gap-5 md:items-end">
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <ArrowLink href={fixRequestHref()} tone="accent">
              email me what's broken
            </ArrowLink>
            <a className="inline-flex items-center rounded-full border border-line px-6 py-3 font-medium hover:border-ink transition-colors" href="#pricing">
              see prices
            </a>
          </div>
          {fromPrice === null ? null : (
            <p className="m-0 text-[0.95rem] text-muted md:text-right">
              from {formatPrice(fromPrice)}/month, or one project for one price. cancel anytime.
            </p>
          )}
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
    <section aria-label="brands i've worked with" className="border-y border-line overflow-hidden py-7 sm:py-9">
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
      <SectionHead index={sectionIndex(1)} label="things i can help with" title="the usual stuff that eats your week." />
      <ol className="m-0 p-0 list-none grid sm:grid-cols-2 gap-x-10 border-b border-line md:ml-[calc(33.333%+0.5rem)]">
        {HELP_WITH.map((item, index) => (
          <li className="reveal flex gap-4 border-t border-line py-5" key={item}>
            <span className="font-mono text-[0.8rem] text-accent pt-1">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-[1.1rem] leading-snug tracking-[-0.01em]">{item}</span>
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
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="pricing">
      <SectionHead
        index={sectionIndex(3)}
        label="prices"
        title={
          <>
            care, monthly help <span className="serif text-muted">or one project for one price.</span>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3 items-stretch">
        {plans.map((plan) => (
          <PlanCard key={plan.slug} plan={plan} />
        ))}
      </div>
      <p className="mt-10 mb-0 text-center text-ink">{STAFF_LINE}</p>
      <p className="mt-2 mb-0 text-center text-muted">{REFUND_RULE}</p>
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
              a website person, <span className="serif">w/o hiring one.</span>
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
          {endSentence(`building websites since ${SINCE_YEAR}${names.length === 0 ? "" : `, for ${listNames(names)}`}`)}
        </p>
        <ArrowLink href={ABOUT_ROUTE} tone="ghost">
          about me
        </ArrowLink>
      </div>
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
}: {
  studies: readonly CaseStudy[];
  plans: readonly Plan[];
  faq: readonly FaqItem[];
}): ReactElement {
  return (
    <main>
      <Hero plans={plans} />
      <LogoStrip />
      <HelpWith />
      <HowItWorks />
      <Pricing plans={plans} />
      <WhatYouGet />
      <Work studies={studies} />
      <SinceLine studies={studies} />
      <Faq faq={faq} />
    </main>
  );
}

export function makeHome(studies: readonly CaseStudy[], plans: readonly Plan[], faq: readonly FaqItem[]): () => ReactElement {
  return function BoundHome(): ReactElement {
    return <Home faq={faq} plans={plans} studies={studies} />;
  };
}
