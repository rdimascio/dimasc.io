import type { ReactElement, ReactNode } from "react";

import type { Plan } from "../content";
import {
  aiPlanCreditLine,
  EXAMPLES,
  INTRO_CALL_LINE,
  ladderPlans,
  minimumLine,
  NOT_FOR,
  NOT_FOR_LINE,
  type PricedPlan,
  planPriceText,
  type Step,
  WHO_FOR,
  WHO_FOR_LINE,
  AI_PLAN_NAME,
} from "../offer";
import { aiPricesHref, INTRO_CALL_CTA, INTRO_CALL_NAME, introCallHref } from "../site";
import { ArrowLink, SectionHead } from "./layout";

export const START_HERE_LABEL = "start here";

export function Checklist({ items, mark = "✓" }: { items: readonly string[]; mark?: "✓" | "×" }): ReactElement {
  return (
    <ul className="m-0 p-0 list-none border-b border-line">
      {items.map((item) => (
        <li className="flex gap-3 border-t border-line py-4 text-[1.1rem] leading-snug" key={item}>
          <span className={mark === "✓" ? "text-accent" : "text-muted"} aria-hidden="true">
            {mark}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function NumberedSteps({ steps }: { steps: readonly Step[] }): ReactElement {
  return (
    <ol className="m-0 p-0 list-none grid gap-x-10 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li className="reveal border-t border-line py-8" key={step.title}>
          <span className="font-mono text-[0.85rem] text-accent">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="m-0 mt-4 text-[clamp(1.5rem,2.4vw,2rem)] leading-none tracking-[-0.045em] font-medium">{step.title}</h3>
          <p className="m-0 mt-3 text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function ExampleCards(): ReactElement {
  return (
    <ul className="m-0 p-0 list-none grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {EXAMPLES.map((example) => (
        <li className="reveal rounded-[22px] border border-line bg-card p-6 sm:p-7" key={example.title}>
          <h3 className="m-0 text-[1.2rem] tracking-[-0.02em] font-medium">{example.title}</h3>
          <p className="mt-3 mb-0 text-muted leading-snug">{example.body}</p>
        </li>
      ))}
    </ul>
  );
}

function planNote(plan: PricedPlan): string {
  if (plan.name === AI_PLAN_NAME) return aiPlanCreditLine();
  return minimumLine(plan);
}

export function LadderList({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <ol className="m-0 p-0 list-none border-b border-line" data-ladder="">
      {ladderPlans(plans).map((plan, index) => (
        <li
          className="grid gap-2 md:gap-6 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)] border-t border-line py-6"
          key={plan.slug}
        >
          <span className="font-mono text-[0.85rem] text-accent pt-1">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="m-0 text-[1.35rem] leading-tight tracking-[-0.025em] font-medium">{plan.name}</h3>
          <p className="m-0 text-[1.1rem]">{planPriceText(plan)}</p>
          <p className="m-0 text-muted">
            {plan.summary} {planNote(plan)}
          </p>
        </li>
      ))}
    </ol>
  );
}

function PlanPrice({ plan }: { plan: PricedPlan }): ReactElement {
  const note = planNote(plan);
  return (
    <>
      <p className="mt-8 mb-0 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-none tracking-[-0.045em] font-medium">{planPriceText(plan)}</p>
      {note === "" ? null : <p className="mt-3 mb-0 text-muted">{note}</p>}
    </>
  );
}

export function PlanCard({ plan }: { plan: PricedPlan }): ReactElement {
  const tone = plan.featured ? "night border-line" : "bg-card border-line";
  return (
    <div className={`reveal flex flex-col rounded-[28px] border p-8 sm:p-10 ${tone}`}>
      <h3 className="m-0 text-[1.25rem] font-medium">{plan.name}</h3>
      <p className="mt-2 mb-0 text-muted">{plan.summary}</p>
      <PlanPrice plan={plan} />
      <ul className="mt-9 mb-10 p-0 list-none flex flex-col border-t border-line">
        {plan.features.map((feature) => (
          <li className="flex gap-3 border-b border-line py-3.5" key={feature}>
            <span className="text-accent" aria-hidden="true">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <ArrowLink href={introCallHref()} tone={plan.featured ? "accent" : "ink"}>
          {plan.cta}
        </ArrowLink>
      </div>
    </div>
  );
}

export function IntroCallBand(): ReactElement {
  return (
    <div className="reveal rounded-[28px] border border-accent bg-card p-8 sm:p-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div>
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-[0.72rem] font-medium text-on-accent">{START_HERE_LABEL}</span>
        <h3 className="mt-5 mb-0 text-[clamp(2rem,4vw,3.2rem)] leading-none tracking-[-0.045em] font-medium">{INTRO_CALL_NAME}</h3>
        <p className="mt-4 mb-0 text-[1.1rem] text-muted max-w-[34rem]">{INTRO_CALL_LINE}</p>
      </div>
      <div>
        <ArrowLink href={introCallHref()} tone="accent">
          {INTRO_CALL_CTA}
        </ArrowLink>
      </div>
    </div>
  );
}

export function PricesLink(): ReactElement {
  return (
    <a className="link-underline inline-block py-2 text-ink" href={aiPricesHref()}>
      all prices
    </a>
  );
}

export function WhoForLists({ columns = true }: { columns?: boolean }): ReactElement {
  return (
    <div className={`grid gap-10 ${columns ? "md:grid-cols-2" : ""}`}>
      <div>
        <h3 className="m-0 mb-3 text-[1.1rem] font-medium">for</h3>
        <Checklist items={WHO_FOR} />
        <p className="mt-4 mb-0 text-muted">{WHO_FOR_LINE}</p>
      </div>
      <div>
        <h3 className="m-0 mb-3 text-[1.1rem] font-medium">not for</h3>
        <Checklist items={NOT_FOR} mark="×" />
        <p className="mt-4 mb-0 text-muted">{NOT_FOR_LINE}</p>
      </div>
    </div>
  );
}

export function PageSection({ label, id, children }: { label: string; id?: string; children: ReactNode }): ReactElement {
  return (
    <section className="mt-20 sm:mt-28 scroll-mt-24" id={id}>
      <SectionHead label={label} />
      <div className="md:ml-[calc(33.333%+0.5rem)] max-w-[44rem]">{children}</div>
    </section>
  );
}

export function WideSection({ label, id, children }: { label: string; id?: string; children: ReactNode }): ReactElement {
  return (
    <section className="mt-20 sm:mt-28 scroll-mt-24" id={id}>
      <SectionHead label={label} />
      {children}
    </section>
  );
}
