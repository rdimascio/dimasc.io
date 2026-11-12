import type { ReactElement } from "react";

import type { CaseStudy, FaqItem, Plan } from "../content";
import { GITHUB_URL, introCallHref, introCallLabel, MAX_SUBSCRIPTION_CLIENTS, planHref } from "../site";
import { Eyebrow, SectionHead, WIDTH } from "./layout";
import { CaseStudyList } from "./work";

export const REFUND_RULE = "Cancel within 7 days of your first payment and get 75% back, even after work is delivered.";

const STEPS = [
  { title: "Subscribe", body: "Pick a plan. You get a private request board to add work to." },
  { title: "Request", body: "Add what's slowing you down: a fix, a page, an integration, an AI tool." },
  { title: "Receive", body: "Most small requests come back in two business days, and we revise until it's right." },
] as const;

const BENEFITS = [
  { title: "Private request board", body: "Every request, decision and status in one place. No chasing." },
  { title: "Fixed monthly price", body: "No hourly billing, no surprise invoices." },
  { title: "Reply within one business day", body: "Every request gets an answer by the next business day." },
  { title: "Pause anytime", body: "Quiet month? Pause, and keep the days you haven't used." },
  { title: "You own everything", body: "It all runs in your accounts, so you're never locked in." },
  { title: "Work directly with me", body: "No account managers and no handoffs. I build and test every change." },
] as const;

export const EXAMPLES = [
  { request: "Fix a broken checkout or booking link", time: "1 to 3 business days" },
  { request: "A new page your staff can edit", time: "About 2 business days" },
  { request: "Connect two tools so data stops being typed twice", time: "1 to 2 weeks" },
  { request: "An AI assistant that answers common customer questions", time: "About 2 weeks" },
  { request: "A new Shopify store with your products loaded", time: "4 to 6 weeks" },
] as const;

const CAPABILITIES = [
  { title: "Web and commerce", items: ["Marketing sites", "Shopify stores", "Pages your staff can edit", "Speed and search basics"] },
  { title: "Systems", items: ["Booking and payments", "Integrations between tools", "Moving off old software", "Reports you can trust"] },
  { title: "AI and internal tools", items: ["Dashboards and admin tools", "AI assistants and automations", "Workflows that remove busywork", "Monitoring and alerts"] },
] as const;

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

function PlanCard({ plan }: { plan: Plan }): ReactElement {
  const tone = plan.featured ? "bg-ink text-bg border-ink" : "bg-bg border-line";
  const muted = plan.featured ? "opacity-70" : "text-muted";
  const button = plan.featured ? "bg-bg text-ink" : "bg-ink text-bg";
  return (
    <div className={`flex flex-col rounded-3xl border p-7 sm:p-8 ${tone}`}>
      <h3 className="m-0 text-[1.2rem] font-medium">{plan.name}</h3>
      <p className={`mt-2 mb-0 ${muted}`}>{plan.summary}</p>
      <p className="mt-8 mb-0 flex items-baseline gap-1">
        <span className="text-[clamp(2.4rem,4vw,3.2rem)] leading-none tracking-[-0.045em] font-medium">
          {plan.price === null ? "Let's talk" : formatPrice(plan.price)}
        </span>
        {plan.price === null ? null : <span className={muted}>/month</span>}
      </p>
      <ul className="mt-8 mb-10 p-0 list-none flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li className="flex gap-3" key={feature}>
            <span className="text-accent" aria-hidden="true">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        className={`mt-auto inline-flex justify-center items-center gap-2 rounded-full px-5 py-3 font-medium hover:opacity-90 ${button}`}
        href={plan.price === null ? introCallHref() : planHref(plan.name)}
      >
        {plan.cta} <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

function About(): ReactElement {
  return (
    <section className={`${WIDTH} py-16`}>
      <SectionHead label="Who you work with" />
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start">
        <div
          className="w-28 h-28 rounded-full bg-ink text-bg grid place-items-center text-[2rem] font-medium tracking-[-0.04em]"
          aria-hidden="true"
        >
          RD
        </div>
        <div className="max-w-[38rem]">
          <p className="m-0 text-[clamp(1.3rem,2.2vw,1.7rem)] leading-[1.35] tracking-[-0.02em] [text-wrap:pretty]">
            I'm Ryan DiMascio. I've built websites, stores and software for more than ten years, at agencies, startups and product companies.
          </p>
          <p className="mt-5 mb-0 text-muted">
            I also work full time as a software engineer, so I keep this to a small number of clients and reply to every request within one business day. You always deal with me, not a team you've never met.
          </p>
          <p className="mt-6 mb-0">
            <a className="font-medium underline underline-offset-4" href={GITHUB_URL}>
              GitHub
            </a>
          </p>
        </div>
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
      <section className={`${WIDTH} pt-20 sm:pt-32 pb-20`}>
        <Eyebrow>For gyms, studios, clinics, shops and local businesses</Eyebrow>
        <h1 className="mt-8 mb-0 text-[clamp(2.8rem,8.5vw,7rem)] leading-[0.94] tracking-[-0.05em] font-medium max-w-[13ch] [text-wrap:balance]">
          A software engineer on subscription.
        </h1>
        <div className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] border-t border-line pt-8">
          <div className="flex flex-wrap gap-3 items-start">
            <a className="inline-flex items-center gap-2 rounded-full bg-ink text-bg px-5 py-3 font-medium hover:opacity-90" href="#pricing">
              See plans <span aria-hidden="true">→</span>
            </a>
            <a className="inline-flex rounded-full border border-line px-5 py-3 font-medium hover:border-ink" href={introCallHref()}>
              {introCallLabel()}
            </a>
          </div>
          <p className="m-0 text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.4] tracking-[-0.015em] text-ink-2 max-w-[34rem]">
            Your website, store, booking and the tools behind them, fixed and improved every week for one flat monthly price. Most small requests come back in two business days. Pause or cancel anytime.
          </p>
        </div>
      </section>

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="How it works" title="Subscribe. Request. Receive." />
        <ol className="m-0 p-0 list-none grid gap-px bg-line sm:grid-cols-3 border border-line rounded-3xl overflow-hidden">
          {STEPS.map((step, index) => (
            <li className="bg-bg p-7 sm:p-8" key={step.title}>
              <span className="font-mono text-[0.85rem] text-accent">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 mb-2 text-[1.6rem] tracking-[-0.035em] font-medium">{step.title}</h3>
              <p className="m-0 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="What a request looks like" title="Real examples, with honest time ranges." />
        <ul className="m-0 p-0 list-none border-b border-line md:ml-[calc(33.333%+0.33rem)]">
          {EXAMPLES.map((example) => (
            <li className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-line py-4" key={example.request}>
              <span>{example.request}</span>
              <span className="font-mono text-[0.85rem] text-muted">{example.time}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="Membership" title="What a small tech team gives you, without hiring one." />
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div className="border-t border-line pt-5" key={benefit.title}>
              <h3 className="m-0 mb-2 text-[1.1rem] font-medium">{benefit.title}</h3>
              <p className="m-0 text-muted">{benefit.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="What I build" title="Practical software for businesses without a tech team." />
        <div className="grid gap-10 sm:grid-cols-3 md:ml-[calc(33.333%+0.33rem)]">
          {CAPABILITIES.map((group) => (
            <div key={group.title}>
              <h3 className="m-0 mb-4 text-[1rem] font-medium">{group.title}</h3>
              <ul className="m-0 p-0 list-none flex flex-col gap-2 text-muted">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={`${WIDTH} py-16 scroll-mt-20`} id="pricing">
        <SectionHead label="Plans" title="One flat monthly price. Pause or cancel anytime." />
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.slug} plan={plan} />
          ))}
        </div>
        <p className="mt-8 mb-0 text-center text-muted">
          <span className="text-ink font-medium">Try it for a week.</span> {REFUND_RULE}
        </p>
        {MAX_SUBSCRIPTION_CLIENTS === null ? null : (
          <p className="mt-2 mb-0 text-center text-muted">I take at most {MAX_SUBSCRIPTION_CLIENTS} subscription clients at a time.</p>
        )}
      </section>

      <About />

      {studies.length === 0 ? null : (
        <section className={`${WIDTH} py-16`}>
          <SectionHead label="Selected work" />
          <CaseStudyList studies={studies} />
        </section>
      )}

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="Questions" title="Frequently asked." />
        <div className="md:ml-[calc(33.333%+0.33rem)] border-b border-line">
          {faq.map((item) => (
            <details className="group border-t border-line py-5" key={item.slug}>
              <summary className="flex justify-between gap-6 cursor-pointer list-none text-[1.1rem] font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="prose mt-3 max-w-[40rem]" dangerouslySetInnerHTML={{ __html: item.html }} />
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

export function makeHome(
  studies: readonly CaseStudy[],
  plans: readonly Plan[],
  faq: readonly FaqItem[],
): () => ReactElement {
  return function BoundHome(): ReactElement {
    return <Home faq={faq} plans={plans} studies={studies} />;
  };
}
