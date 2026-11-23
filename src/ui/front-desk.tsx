import type { ReactElement, ReactNode } from "react";

import { listedPlans, type Plan } from "../content";
import {
  FRONT_DESK_HEADLINE,
  FRONT_DESK_INCLUDES,
  FRONT_DESK_LEDE,
  FRONT_DESK_NOT_INCLUDED,
  FRONT_DESK_SETUP_STEPS,
  frontDeskFaq,
  ORANGE_COUNTY_ROUTE,
  WEBSITE_FIX_LEDE,
} from "../front-desk";
import {
  CONTACT_EMAIL,
  FRONT_DESK_CHECK_CTA,
  FRONT_DESK_NAME,
  FRONT_DESK_ROUTE,
  FRONT_DESK_TOOLS,
  freeCheckHref,
  SERVICE_AREA_COPY,
  SERVICE_AREA_SHORT,
  WEBSITE_FIX_ANCHOR,
} from "../site";
import { breadcrumbLd, businessLd, faqPageLd, pageGraph, type QuestionAnswer, serviceLd } from "../structured-data";
import { WORK_ROUTE } from "../work";
import { YOUTH_SPORTS_ROUTE } from "../youth-sports";
import {
  CheckBand,
  frontDeskPlan,
  frontDeskPriceLine,
  LOOK_AFTER_LINE,
  NOT_FOR,
  NOT_FOR_LINE,
  PlanCard,
  PRICING_TERMS,
  WHO_FOR,
  WHO_FOR_LINE,
  websiteFixPlan,
} from "./home";
import { JsonLd } from "./json-ld";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE, SectionHead } from "./layout";

export const FRONT_DESK_CRUMB = { name: FRONT_DESK_NAME, route: FRONT_DESK_ROUTE } as const;
export const ORANGE_COUNTY_CRUMB = { name: SERVICE_AREA_SHORT, route: ORANGE_COUNTY_ROUTE } as const;
export const PAST_WORK_LINE =
  "i was tech lead on holt international's site + the mls home search behind serhant.com, which ran every luxury presence customer's listing search. i was a front-end engineer on blackstone + stanford ecorner.";
export const AREA_LINE = `i'm a senior software engineer based in ${SERVICE_AREA_COPY}. i set up ai front desks for owner-run businesses here + nearby, like in tustin + corona. happy to meet in person around oc.`;
export const WHY_ME_LINE =
  "a lot of local ai help is an agency selling a chatbot, then leaving you with it. i'm an engineer. i've been a software engineer since 2017 + built the platform behind 30k+ websites. i set it up in the tools you already use, then i keep it working.";
export const ORANGE_COUNTY_HEADLINE = `ai setup for local businesses in ${SERVICE_AREA_SHORT}.`;

export function frontDeskQuestions(plans: readonly Plan[]): readonly QuestionAnswer[] {
  return frontDeskFaq(frontDeskPriceLine(plans), PRICING_TERMS);
}

function Section({ label, id, children }: { label: string; id?: string; children: ReactNode }): ReactElement {
  return (
    <section className="mt-20 sm:mt-28 scroll-mt-24" id={id}>
      <SectionHead label={label} />
      <div className="md:ml-[calc(33.333%+0.5rem)] max-w-[44rem]">{children}</div>
    </section>
  );
}

function Checklist({ items, mark = "✓" }: { items: readonly string[]; mark?: string }): ReactElement {
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

function Steps({ steps }: { steps: readonly string[] }): ReactElement {
  return (
    <ol className="m-0 p-0 list-none border-b border-line">
      {steps.map((step, index) => (
        <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border-t border-line py-4 text-[1.1rem] leading-snug" key={step}>
          <span className="font-mono text-[0.85rem] text-accent pt-1">{String(index + 1).padStart(2, "0")}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function Questions({ faq }: { faq: readonly QuestionAnswer[] }): ReactElement {
  return (
    <div className="border-b border-line">
      {faq.map((item) => (
        <details className="group border-t border-line py-6" key={item.question}>
          <summary className="flex justify-between gap-6 cursor-pointer list-none text-[clamp(1.1rem,1.6vw,1.3rem)] tracking-[-0.015em] font-medium rounded-md [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              className="grid place-items-center shrink-0 w-8 h-8 rounded-full border border-line text-muted transition-transform duration-300 group-open:rotate-45"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <p className="mt-4 mb-0 max-w-[40rem] text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function PrimaryCta(): ReactElement {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <ArrowLink href={freeCheckHref()} tone="accent">
        {FRONT_DESK_CHECK_CTA}
      </ArrowLink>
      <a className="link-underline inline-block py-2 text-muted hover:text-ink" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}

function WhoFor(): ReactElement {
  return (
    <div className="grid gap-10">
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

function FrontDeskPage({ plans }: { plans: readonly Plan[] }): ReactElement {
  const listed = listedPlans(plans);
  const questions = frontDeskQuestions(plans);
  const websiteFix = websiteFixPlan(plans);
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd
        data={pageGraph(
          serviceLd({ name: FRONT_DESK_NAME, description: frontDeskPlan(plans).summary, route: FRONT_DESK_ROUTE, plans: listed }),
          breadcrumbLd([FRONT_DESK_CRUMB]),
          faqPageLd(questions),
        )}
      />
      <Eyebrow>{`${FRONT_DESK_NAME} · ${SERVICE_AREA_COPY}`}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{FRONT_DESK_HEADLINE}</h1>
      <p className={`${LEDE} mt-8`}>{FRONT_DESK_LEDE}</p>
      <p className="mt-4 mb-0 max-w-[38rem] font-mono text-[0.85rem] leading-relaxed" data-price-line="">
        {frontDeskPriceLine(plans)}
      </p>
      <PrimaryCta />

      <Section label="what it does">
        <Checklist items={FRONT_DESK_INCLUDES} />
      </Section>

      <Section label="where it runs">
        <div className="grid gap-3">
          <p className="m-0 text-[1.1rem]">{`it runs inside the stuff you already use: ${FRONT_DESK_TOOLS}.`}</p>
          <p className="m-0 text-muted">{LOOK_AFTER_LINE}</p>
        </div>
      </Section>

      <Section label="how setup works">
        <Steps steps={FRONT_DESK_SETUP_STEPS} />
      </Section>

      <Section label="what it costs">
        <div className="grid gap-6">
          <CheckBand />
          <PlanCard plan={frontDeskPlan(plans)} showMore={false} />
          <p className="m-0 text-muted">{PRICING_TERMS}</p>
        </div>
      </Section>

      <Section label="not included">
        <Checklist items={FRONT_DESK_NOT_INCLUDED} mark="×" />
      </Section>

      <Section id={WEBSITE_FIX_ANCHOR} label="website fix">
        <div className="grid gap-6">
          <p className="m-0 text-[1.1rem]">{WEBSITE_FIX_LEDE}</p>
          {websiteFix === undefined ? null : <PlanCard plan={websiteFix} showMore={false} />}
        </div>
      </Section>

      <Section label="who it's for">
        <WhoFor />
      </Section>

      <Section label="questions">
        <Questions faq={questions} />
      </Section>

      <Section label="related">
        <ul className="m-0 p-0 list-none flex flex-wrap gap-x-8 gap-y-1">
          <li>
            <a className="link-underline inline-block py-2 text-ink" href={YOUTH_SPORTS_ROUTE}>
              for youth sports
            </a>
          </li>
          <li>
            <a className="link-underline inline-block py-2 text-ink" href={ORANGE_COUNTY_ROUTE}>
              {`ai setup in ${SERVICE_AREA_SHORT}`}
            </a>
          </li>
          <li>
            <a className="link-underline inline-block py-2 text-ink" href={WORK_ROUTE}>
              past work
            </a>
          </li>
        </ul>
      </Section>
    </main>
  );
}

function OrangeCountyPage({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(businessLd(listedPlans(plans)), breadcrumbLd([ORANGE_COUNTY_CRUMB]))} />
      <Eyebrow>{SERVICE_AREA_COPY}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{ORANGE_COUNTY_HEADLINE}</h1>
      <p className={`${LEDE} mt-8`}>{AREA_LINE}</p>
      <PrimaryCta />

      <Section label="who i help">
        <WhoFor />
      </Section>

      <Section label="why me">
        <p className="m-0 text-[1.1rem] leading-relaxed">{WHY_ME_LINE}</p>
      </Section>

      <Section label="what it costs">
        <div className="grid gap-4">
          <p className="m-0 text-[1.1rem]">{`${FRONT_DESK_NAME}: ${frontDeskPriceLine(plans)}`}</p>
          <a className="link-underline inline-block py-2 text-ink" href={FRONT_DESK_ROUTE}>
            {`more about the ${FRONT_DESK_NAME}`}
          </a>
        </div>
      </Section>

      <Section label="past work">
        <div className="grid gap-4">
          <p className="m-0 text-[1.1rem]">{PAST_WORK_LINE}</p>
          <a className="link-underline inline-block py-2 text-ink" href={WORK_ROUTE}>
            see past work
          </a>
        </div>
      </Section>
    </main>
  );
}

export function makeFrontDesk(plans: readonly Plan[]): () => ReactElement {
  return function BoundFrontDesk(): ReactElement {
    return <FrontDeskPage plans={plans} />;
  };
}

export function makeOrangeCounty(plans: readonly Plan[]): () => ReactElement {
  return function BoundOrangeCounty(): ReactElement {
    return <OrangeCountyPage plans={plans} />;
  };
}
