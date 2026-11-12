import type { ReactElement } from "react";

import type { CaseStudy, Experience, FaqItem, Plan } from "../content";
import { introCallHref, introCallLabel, MAX_SUBSCRIPTION_CLIENTS, planHref } from "../site";
import { projectName, WORK_ROUTE } from "../work";
import { ExperienceTimeline } from "./experience";
import { ABOUT_ROUTE, ArrowLink, Eyebrow, SectionHead, WIDTH } from "./layout";
import { CaseStudyGrid, RequestNote } from "./work";

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

function sectionIndex(position: number): string {
  return `(${String(position).padStart(2, "0")})`;
}

function PlanCard({ plan }: { plan: Plan }): ReactElement {
  const quietTone = plan.price === null ? "bg-bg-soft border-line" : "bg-card border-line";
  const tone = plan.featured ? "night border-transparent" : quietTone;
  return (
    <div className={`reveal flex flex-col rounded-[28px] border p-7 sm:p-9 ${tone}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="m-0 text-[1.25rem] font-medium">{plan.name}</h3>
        {plan.featured ? (
          <span className="rounded-full border border-line px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted">
            Two at a time
          </span>
        ) : null}
      </div>
      <p className="mt-2 mb-0 text-muted">{plan.summary}</p>
      <p className="mt-10 mb-0 flex items-baseline gap-1.5">
        <span className="text-[clamp(2.8rem,4.6vw,3.8rem)] leading-none tracking-[-0.055em] font-medium">
          {plan.price === null ? <span className="serif tracking-[-0.02em]">Let's talk</span> : formatPrice(plan.price)}
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

const BOARD = [
  { title: "Fix the broken booking link on the homepage", status: "Done", tone: "bg-sage", meta: "2 days" },
  { title: "New summer camp page staff can edit", status: "In review", tone: "bg-sky", meta: "Today" },
  { title: "Send new members to the email list automatically", status: "In progress", tone: "bg-butter", meta: "Started Tue" },
  { title: "AI assistant for common parent questions", status: "Queued", tone: "bg-blush", meta: "Next up" },
] as const;

function ExampleBoard(): ReactElement {
  return (
    <figure className="reveal m-0 rounded-[28px] bg-card border border-line p-4 sm:p-5 shadow-[0_40px_80px_-40px_rgba(40,30,20,0.35)]">
      <figcaption className="flex items-center justify-between px-2 pb-4">
        <span className="font-medium">Your request board</span>
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">Example</span>
      </figcaption>
      <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
        {BOARD.map((item) => (
          <li className="rounded-2xl border border-line bg-bg px-4 py-3.5 flex items-start justify-between gap-4" key={item.title}>
            <span className="text-[0.95rem] leading-snug">{item.title}</span>
            <span className="flex flex-col items-end gap-1 shrink-0">
              <span className={`rounded-full px-2.5 py-1 text-[0.72rem] font-medium text-[#141311] ${item.tone}`}>{item.status}</span>
              <span className="font-mono text-[0.68rem] text-muted">{item.meta}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function Hero(): ReactElement {
  return (
    <section className={`${WIDTH} pt-10 sm:pt-16 pb-12 sm:pb-20`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Eyebrow>Software engineer on subscription</Eyebrow>
        <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted max-sm:hidden">For gyms, studios, clinics, shops and local businesses</p>
      </div>
      <h1 className="mt-8 sm:mt-10 mb-0 font-semibold leading-[0.84] tracking-[-0.065em] text-[clamp(4.4rem,17vw,16.5rem)]">
        <span className="hero-line">
          <span>Ryan</span>
        </span>
        <span className="hero-line">
          <span>
            DiMascio<span className="text-accent-bright">.</span>
          </span>
        </span>
      </h1>
      <div className="mt-10 sm:mt-12 grid gap-10 md:grid-cols-12 items-end">
        <p className="md:col-span-7 m-0 text-[clamp(1.45rem,2.7vw,2.4rem)] leading-[1.12] tracking-[-0.035em] font-medium max-w-[34rem] [text-wrap:balance]">
          A software engineer on subscription. <span className="serif text-muted font-normal">Fixed and improved every week,</span> for one flat monthly price.
        </p>
        <div className="md:col-span-5 flex flex-col gap-6 md:items-end">
          <p className="m-0 text-ink-2 leading-relaxed max-w-[26rem] md:text-right">
            Your website, store, booking and the tools behind them. Most small requests come back in two business days.
          </p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <ArrowLink href="#pricing" tone="accent">
              See plans
            </ArrowLink>
            <a className="inline-flex items-center rounded-full border border-line px-6 py-3 font-medium hover:border-ink transition-colors" href={introCallHref()}>
              {introCallLabel()}
            </a>
          </div>
          <p className="m-0 text-[0.88rem] text-muted">Pause or cancel anytime · 75% back in the first week</p>
        </div>
      </div>
    </section>
  );
}

function Marquee({ studies }: { studies: readonly CaseStudy[] }): ReactElement | null {
  if (studies.length === 0) return null;
  const names = studies.map(projectName);
  const track = (hidden: boolean): ReactElement => (
    <ul className="marquee-track m-0 p-0 list-none" aria-hidden={hidden ? "true" : undefined}>
      {names.map((name) => (
        <li className="flex items-center gap-10 pr-10 text-[clamp(1.6rem,3.4vw,2.8rem)] tracking-[-0.04em] font-medium whitespace-nowrap" key={name}>
          {name}
          <span className="serif text-accent text-[0.8em]" aria-hidden="true">
            ✳
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Selected clients" className="border-y border-line overflow-hidden py-6">
      <div className="marquee">
        {track(false)}
        {track(true)}
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
          aside={<a className="link-underline text-ink" href={WORK_ROUTE}>All work</a>}
          index={sectionIndex(1)}
          label="Selected work"
          title={
            <>
              Sites and products <span className="serif text-accent">I have worked on.</span>
            </>
          }
        />
        <CaseStudyGrid studies={studies} />
        <RequestNote />
      </div>
    </section>
  );
}

function HowItWorks(): ReactElement {
  return (
    <section className={`${WIDTH} py-24 sm:py-32`}>
      <SectionHead
        index={sectionIndex(2)}
        label="How it works"
        title={
          <>
            Subscribe. Request. <span className="serif">Receive.</span>
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

function Examples(): ReactElement {
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32`}>
      <SectionHead index={sectionIndex(3)} label="What a request looks like" title="Real examples, with honest time ranges." />
      <ul className="m-0 p-0 list-none border-b border-line md:ml-[calc(33.333%+0.5rem)]">
        {EXAMPLES.map((example) => (
          <li className="reveal grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6 border-t border-line py-5" key={example.request}>
            <span className="text-[1.1rem] tracking-[-0.01em]">{example.request}</span>
            <span className="font-mono text-[0.82rem] text-muted sm:text-right">{example.time}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Membership(): ReactElement {
  return (
    <section className="bg-bg-soft">
      <div className={`${WIDTH} py-24 sm:py-32`}>
        <SectionHead
          index={sectionIndex(4)}
          label="Membership"
          title={
            <>
              What a small tech team gives you, <span className="serif">without hiring one.</span>
            </>
          }
        />
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <div className="reveal border-t border-ink pt-5" key={benefit.title}>
              <span className="font-mono text-[0.72rem] text-muted">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="m-0 mt-4 mb-2 text-[1.2rem] tracking-[-0.02em] font-medium">{benefit.title}</h3>
              <p className="m-0 text-muted">{benefit.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-24 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow>What I build</Eyebrow>
            <p className="m-0 mt-5 text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.15] tracking-[-0.03em] font-medium max-w-[18rem]">
              Practical software for businesses without a tech team.
            </p>
          </div>
          <div className="md:col-span-8 grid gap-10 sm:grid-cols-3">
            {CAPABILITIES.map((group) => (
              <div className="reveal" key={group.title}>
                <h3 className="m-0 mb-4 text-[1rem] font-medium">{group.title}</h3>
                <ul className="m-0 p-0 list-none flex flex-col gap-2 text-muted">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceSection({ experience }: { experience: readonly Experience[] }): ReactElement | null {
  if (experience.length === 0) return null;
  return (
    <section className={`${WIDTH} py-24 sm:py-32`} id="experience">
      <SectionHead
        aside={<a className="link-underline text-ink" href={ABOUT_ROUTE}>About me</a>}
        index={sectionIndex(5)}
        label="Experience"
        title={
          <>
            More than ten years of building for the web, <span className="serif text-muted">at agencies, startups and product companies.</span>
          </>
        }
      />
      <ExperienceTimeline items={experience} />
    </section>
  );
}

function Pricing({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <section className={`${WIDTH} py-24 sm:py-32 scroll-mt-16`} id="pricing">
      <SectionHead
        index={sectionIndex(6)}
        label="Plans"
        title={
          <>
            One flat monthly price. <span className="serif text-muted">Pause or cancel anytime.</span>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3 items-stretch">
        {plans.map((plan) => (
          <PlanCard key={plan.slug} plan={plan} />
        ))}
      </div>
      <p className="mt-10 mb-0 text-center text-muted">
        <span className="text-ink font-medium">Try it for a week.</span> {REFUND_RULE}
      </p>
      {MAX_SUBSCRIPTION_CLIENTS === null ? null : (
        <p className="mt-2 mb-0 text-center text-muted">I take at most {MAX_SUBSCRIPTION_CLIENTS} subscription clients at a time.</p>
      )}
    </section>
  );
}

function Faq({ faq }: { faq: readonly FaqItem[] }): ReactElement {
  return (
    <section className={`${WIDTH} pb-28 sm:pb-36`}>
      <SectionHead index={sectionIndex(7)} label="Questions" title="Frequently asked." />
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
  experience,
}: {
  studies: readonly CaseStudy[];
  plans: readonly Plan[];
  faq: readonly FaqItem[];
  experience: readonly Experience[];
}): ReactElement {
  return (
    <main>
      <Hero />
      <Marquee studies={studies} />
      <Work studies={studies} />
      <HowItWorks />
      <Examples />
      <Membership />
      <ExperienceSection experience={experience} />
      <Pricing plans={plans} />
      <Faq faq={faq} />
    </main>
  );
}

export function makeHome(
  studies: readonly CaseStudy[],
  plans: readonly Plan[],
  faq: readonly FaqItem[],
  experience: readonly Experience[],
): () => ReactElement {
  return function BoundHome(): ReactElement {
    return <Home experience={experience} faq={faq} plans={plans} studies={studies} />;
  };
}
