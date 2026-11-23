import type { ReactElement } from "react";

import type { Plan } from "../content";
import {
  AI_HEADLINE,
  AI_LEDE,
  aiFaq,
  aiPlanCreditLine,
  ladderPlans,
  ladderSummary,
  LOOK_AFTER_LINE,
  NOT_INCLUDED,
  ORANGE_COUNTY_HEADLINE,
  ORANGE_COUNTY_ROUTE,
  PRICING_TERMS,
  RUNS_IN_LINE,
  STEPS,
} from "../offer";
import { AI_NAME, AI_PRICES_ANCHOR, AI_ROUTE, CONTACT_EMAIL, INTRO_CALL_CTA, introCallHref, SERVICE_AREA_COPY, SERVICE_AREA_SHORT } from "../site";
import { breadcrumbLd, businessLd, faqPageLd, pageGraph, type QuestionAnswer, serviceLd } from "../structured-data";
import { WORK_ROUTE } from "../work";
import { YOUTH_SPORTS_ROUTE } from "../youth-sports";
import { JsonLd } from "./json-ld";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE } from "./layout";
import { Checklist, ExampleCards, IntroCallBand, LadderList, NumberedSteps, PageSection, PlanCard, WhoForLists, WideSection } from "./offer";

export const AI_CRUMB = { name: AI_NAME, route: AI_ROUTE } as const;
export const ORANGE_COUNTY_CRUMB = { name: SERVICE_AREA_SHORT, route: ORANGE_COUNTY_ROUTE } as const;
export const PAST_WORK_LINE =
  "i was tech lead on holt international's site + the mls home search behind serhant.com, which ran every luxury presence customer's listing search. i was a front-end engineer on blackstone + stanford ecorner.";
export const AREA_LINE = `i'm a senior software engineer based in ${SERVICE_AREA_COPY}. i set up ai for owner-run businesses here + nearby, like in tustin + corona. happy to meet in person around oc.`;
export const WHY_ME_LINE =
  "a lot of local ai help is an agency selling a chatbot, then leaving you with it. i'm an engineer. i've been a software engineer since 2017 + built the platform behind 30k+ websites. i set it up in the tools you already use, then i keep it working.";

function PrimaryCta(): ReactElement {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <ArrowLink href={introCallHref()} tone="accent">
        {INTRO_CALL_CTA}
      </ArrowLink>
      <a className="link-underline inline-block py-2 text-muted hover:text-ink" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>
    </div>
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

function AiPage({ plans }: { plans: readonly Plan[] }): ReactElement {
  const questions = aiFaq(plans);
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(serviceLd({ name: AI_NAME, description: AI_LEDE, route: AI_ROUTE, plans }), breadcrumbLd([AI_CRUMB]), faqPageLd(questions))} />
      <Eyebrow>{`${AI_NAME} · ${SERVICE_AREA_COPY}`}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{AI_HEADLINE}</h1>
      <p className={`${LEDE} mt-8`}>{AI_LEDE}</p>
      <p className="mt-4 mb-0 max-w-[38rem] font-mono text-[0.85rem] leading-relaxed" data-price-line="">
        {ladderSummary(plans)}
      </p>
      <PrimaryCta />

      <WideSection label="what it can do">
        <ExampleCards />
      </WideSection>

      <PageSection label="where it runs">
        <div className="grid gap-3">
          <p className="m-0 text-[1.1rem]">{RUNS_IN_LINE}</p>
          <p className="m-0 text-muted">{LOOK_AFTER_LINE}</p>
        </div>
      </PageSection>

      <WideSection label="how it works">
        <NumberedSteps steps={STEPS} />
      </WideSection>

      <WideSection id={AI_PRICES_ANCHOR} label="prices">
        <div className="grid gap-6">
          <IntroCallBand />
          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            {ladderPlans(plans).map((plan) => (
              <PlanCard key={plan.slug} plan={plan} />
            ))}
          </div>
          <p className="m-0 text-muted">{`the ai plan is ${aiPlanCreditLine()} ${PRICING_TERMS}`}</p>
        </div>
      </WideSection>

      <PageSection label="not included">
        <Checklist items={NOT_INCLUDED} mark="×" />
      </PageSection>

      <PageSection label="who it's for">
        <WhoForLists columns={false} />
      </PageSection>

      <PageSection label="questions">
        <Questions faq={questions} />
      </PageSection>

      <PageSection label="related">
        <ul className="m-0 p-0 list-none flex flex-wrap gap-x-8 gap-y-1">
          <li>
            <a className="link-underline inline-block py-2 text-ink" href={YOUTH_SPORTS_ROUTE}>
              for youth sports
            </a>
          </li>
          <li>
            <a className="link-underline inline-block py-2 text-ink" href={ORANGE_COUNTY_ROUTE}>
              {`ai help in ${SERVICE_AREA_SHORT}`}
            </a>
          </li>
          <li>
            <a className="link-underline inline-block py-2 text-ink" href={WORK_ROUTE}>
              past work
            </a>
          </li>
        </ul>
      </PageSection>
    </main>
  );
}

function OrangeCountyPage({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(businessLd(plans), breadcrumbLd([ORANGE_COUNTY_CRUMB]))} />
      <Eyebrow>{SERVICE_AREA_COPY}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{ORANGE_COUNTY_HEADLINE}</h1>
      <p className={`${LEDE} mt-8`}>{AREA_LINE}</p>
      <PrimaryCta />

      <WideSection label="what it can do">
        <ExampleCards />
      </WideSection>

      <PageSection label="who i help">
        <WhoForLists columns={false} />
      </PageSection>

      <PageSection label="why me">
        <p className="m-0 text-[1.1rem] leading-relaxed">{WHY_ME_LINE}</p>
      </PageSection>

      <PageSection label="what it costs">
        <div className="grid gap-4">
          <LadderList plans={plans} />
          <a className="link-underline inline-block py-2 text-ink" href={AI_ROUTE}>
            {`more about ${AI_NAME}`}
          </a>
        </div>
      </PageSection>

      <PageSection label="past work">
        <div className="grid gap-4">
          <p className="m-0 text-[1.1rem]">{PAST_WORK_LINE}</p>
          <a className="link-underline inline-block py-2 text-ink" href={WORK_ROUTE}>
            see past work
          </a>
        </div>
      </PageSection>
    </main>
  );
}

export function makeAi(plans: readonly Plan[]): () => ReactElement {
  return function BoundAi(): ReactElement {
    return <AiPage plans={plans} />;
  };
}

export function makeOrangeCounty(plans: readonly Plan[]): () => ReactElement {
  return function BoundOrangeCounty(): ReactElement {
    return <OrangeCountyPage plans={plans} />;
  };
}
