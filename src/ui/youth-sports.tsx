import type { ReactElement } from "react";

import type { Plan } from "../content";
import { AI_TOOLS, CONTACT_EMAIL, INTRO_CALL_CTA, introCallHref, SERVICE_AREA_COPY } from "../site";
import { LOOK_AFTER_LINE } from "../offer";
import { breadcrumbLd, pageGraph } from "../structured-data";
import {
  YOUTH_SPORTS_HEADLINE,
  YOUTH_SPORTS_LEDE,
  YOUTH_SPORTS_MORE,
  YOUTH_SPORTS_NAME,
  YOUTH_SPORTS_PROOF,
  YOUTH_SPORTS_QUESTIONS,
  YOUTH_SPORTS_ROUTE,
  YOUTH_SPORTS_TOOLS_NOTE,
  YOUTH_SPORTS_WHO,
} from "../youth-sports";
import { IntroCallBand, LadderList, PricesLink } from "./offer";
import { JsonLd } from "./json-ld";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE, SectionHead } from "./layout";

function Section({ label, children }: { label: string; children: ReactElement }): ReactElement {
  return (
    <section className="mt-20 sm:mt-28">
      <SectionHead label={label} />
      <div className="md:ml-[calc(33.333%+0.5rem)] max-w-[44rem]">{children}</div>
    </section>
  );
}

function Checklist({ items }: { items: readonly string[] }): ReactElement {
  return (
    <ul className="m-0 p-0 list-none border-b border-line">
      {items.map((item) => (
        <li className="flex gap-3 border-t border-line py-4 text-[1.1rem] leading-snug" key={item}>
          <span className="text-accent" aria-hidden="true">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function YouthSportsPage({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(breadcrumbLd([{ name: YOUTH_SPORTS_NAME, route: YOUTH_SPORTS_ROUTE }]))} />
      <Eyebrow>{`${YOUTH_SPORTS_NAME} · ${SERVICE_AREA_COPY}`}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{YOUTH_SPORTS_HEADLINE}</h1>
      <p className={`${LEDE} mt-8`}>{YOUTH_SPORTS_LEDE}</p>
      <p className="mt-4 mb-0 text-muted max-w-[38rem]">{YOUTH_SPORTS_WHO}</p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <ArrowLink href={introCallHref()} tone="accent">
          {INTRO_CALL_CTA}
        </ArrowLink>
        <a className="link-underline inline-block py-2 text-muted hover:text-ink" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </div>

      <Section label="what parents ask, answered">
        <Checklist items={YOUTH_SPORTS_QUESTIONS} />
      </Section>

      <Section label="what else it can take off your plate">
        <Checklist items={YOUTH_SPORTS_MORE} />
      </Section>

      <Section label="where it runs">
        <div className="grid gap-3">
          <p className="m-0 text-[1.1rem]">{`it runs inside ${AI_TOOLS}.`}</p>
          <p className="m-0 text-muted">{YOUTH_SPORTS_TOOLS_NOTE}</p>
          <p className="m-0 text-muted">{LOOK_AFTER_LINE}</p>
        </div>
      </Section>

      <Section label="what i'm working on">
        <p className="m-0 text-[1.1rem] leading-relaxed">{YOUTH_SPORTS_PROOF}</p>
      </Section>

      <Section label="what it costs">
        <div className="grid gap-6">
          <IntroCallBand />
          <LadderList plans={plans} />
          <PricesLink />
        </div>
      </Section>
    </main>
  );
}

export function makeYouthSports(plans: readonly Plan[]): () => ReactElement {
  return function BoundYouthSports(): ReactElement {
    return <YouthSportsPage plans={plans} />;
  };
}
