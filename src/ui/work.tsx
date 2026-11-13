import type { ReactElement } from "react";

import type { CaseStudy } from "../content";
import { CONTACT_EMAIL } from "../site";
import { projectName, requestAnchor, requestMailto, screenshotSrc, WORK_REQUEST_ROUTE, WORK_ROUTE } from "../work";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE } from "./layout";

export const REQUEST_LINE = "want to hear more about one of these? email me and i'll walk you through it.";

function indexLabel(position: number): string {
  return String(position + 1).padStart(2, "0");
}

function CaseStudyCard({ study, position }: { study: CaseStudy; position: number }): ReactElement {
  return (
    <li className="reveal md:[&:nth-child(even)]:mt-32">
      <a className="work-card block rounded-[26px]" href={requestAnchor(study)}>
        <div className="relative overflow-hidden rounded-[22px] border border-line bg-bg-soft aspect-[16/11]">
          <img
            alt={`${projectName(study)} home page on a desktop screen`}
            className="shot-desktop absolute inset-0 w-full h-full object-cover object-top"
            height={900}
            loading="lazy"
            src={screenshotSrc(study, "desktop")}
            width={1440}
          />
          <img
            alt=""
            className="shot-mobile absolute right-[6%] top-[18%] w-[23%] h-auto rounded-[14px] border border-[color-mix(in_srgb,var(--ink)_14%,transparent)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]"
            height={844}
            loading="lazy"
            src={screenshotSrc(study, "mobile")}
            width={390}
          />
        </div>
        <div className="mt-6 grid grid-cols-[2.2rem_minmax(0,1fr)_auto] gap-x-3 items-baseline">
          <span className="font-mono text-[0.75rem] text-muted">{indexLabel(position)}</span>
          <h3 className="m-0 text-[clamp(1.35rem,2.2vw,1.75rem)] leading-tight tracking-[-0.03em] font-medium">{projectName(study)}</h3>
          <span className="card-arrow text-[1.2rem] text-muted" aria-hidden="true">
            ↗
          </span>
          <span />
          <p className="m-0 mt-2 text-muted leading-relaxed max-w-[34rem]">{study.summary}</p>
          <span />
          <span />
          <p className="m-0 mt-4 font-mono text-[0.7rem] tracking-[0.14em] text-muted">{study.industry}</p>
        </div>
      </a>
    </li>
  );
}

export function CaseStudyGrid({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  if (studies.length === 0) {
    return (
      <div className="border border-dashed border-line rounded-2xl p-8 sm:p-10 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-center">
        <p className="m-0 text-[1.2rem] tracking-[-0.015em] max-w-[32rem]">
          Case studies are being written. Ask me about recent work and I'll walk you through it.
        </p>
        <a className="font-medium underline underline-offset-4 md:justify-self-end" href={`mailto:${CONTACT_EMAIL}`}>
          Ask about recent work
        </a>
      </div>
    );
  }
  return (
    <ul className="m-0 p-0 list-none grid gap-x-8 lg:gap-x-12 gap-y-16 md:grid-cols-2">
      {studies.map((study, position) => (
        <CaseStudyCard key={study.slug} position={position} study={study} />
      ))}
    </ul>
  );
}

export function RequestNote(): ReactElement {
  return (
    <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
      <p className="m-0 text-[clamp(1.2rem,2vw,1.5rem)] tracking-[-0.02em]">
        {REQUEST_LINE}
      </p>
      <ArrowLink href={WORK_REQUEST_ROUTE} tone="ghost">
        ask about a project
      </ArrowLink>
    </div>
  );
}

function WorkIndex({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  return (
    <main className="night pb-28">
      <div className={PAGE}>
        <Eyebrow>past work · {String(studies.length).padStart(2, "0")}</Eyebrow>
        <h1 className={`${HEADING} mt-8`}>
          past <span className="serif text-accent">work</span>
        </h1>
        <p className={`${LEDE} mt-8 mb-20`}>websites i've worked on, at agencies + product teams.</p>
        <CaseStudyGrid studies={studies} />
        <RequestNote />
      </div>
    </main>
  );
}

function RequestPage({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  return (
    <main className={PAGE}>
      <a className="font-mono text-[0.78rem] tracking-[0.1em] text-muted hover:text-ink" href={WORK_ROUTE}>
        ← past work
      </a>
      <h1 className={`${HEADING} mt-8`}>ask about a project</h1>
      <p className={`${LEDE} mt-8 mb-16`}>
        {REQUEST_LINE} pick one below + it opens an email to me.
      </p>
      <ul className="m-0 p-0 list-none border-b border-line">
        {studies.map((study) => (
          <li
            className="scroll-mt-24 border-t border-line py-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center target:bg-card target:px-5 target:rounded-2xl"
            id={study.slug}
            key={study.slug}
          >
            <span className="text-[1.2rem] font-medium tracking-[-0.02em]">{projectName(study)}</span>
            <span className="text-muted">{study.summary}</span>
            <a
              className="inline-flex justify-self-start items-center gap-2 rounded-full bg-ink text-bg px-5 py-2.5 font-medium hover:opacity-90"
              href={requestMailto(study)}
            >
              ask about this project <span aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 mb-0 text-muted">
        or just write to{" "}
        <a className="font-medium text-ink underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </main>
  );
}

function Facts({ study }: { study: CaseStudy }): ReactElement {
  const rows = [
    ...(study.client === undefined ? [] : [["client", study.client] as const]),
    ["industry", study.industry] as const,
    ["year", String(study.year)] as const,
    ["services", study.services.join(", ")] as const,
    ["stack", study.stack.join(", ")] as const,
  ];
  return (
    <dl className="m-0 flex flex-col gap-5 text-[0.95rem]">
      {rows.map(([label, value]) => (
        <div className="border-t border-line pt-3" key={label}>
          <dt className="font-mono text-[0.72rem] tracking-[0.12em] text-muted mb-1">{label}</dt>
          <dd className="m-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Screens({ study }: { study: CaseStudy }): ReactElement {
  return (
    <div className="mt-16 grid gap-5 grid-cols-[minmax(0,3.6fr)_minmax(0,1fr)] items-start">
      <img
        alt={`${projectName(study)} on a desktop screen`}
        className="block w-full h-auto rounded-2xl border border-line"
        height={900}
        src={screenshotSrc(study, "desktop")}
        width={1440}
      />
      <img
        alt={`${projectName(study)} on a phone screen`}
        className="block w-full h-auto rounded-2xl border border-line"
        height={844}
        src={screenshotSrc(study, "mobile")}
        width={390}
      />
    </div>
  );
}

function CaseStudyPage({ study }: { study: CaseStudy }): ReactElement {
  return (
    <main className={PAGE}>
      <a className="font-mono text-[0.78rem] tracking-[0.1em] text-muted hover:text-ink" href={WORK_ROUTE}>
        ← past work
      </a>
      <h1 className={`${HEADING} mt-8 max-w-[18ch]`}>{study.title}</h1>
      <p className={`${LEDE} mt-8`}>{study.summary}</p>
      <Screens study={study} />
      <div className="mt-16 grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside>
          <Facts study={study} />
        </aside>
        <article className="prose max-w-[40rem]" dangerouslySetInnerHTML={{ __html: study.html }} />
      </div>
    </main>
  );
}

export function makeWorkIndex(studies: readonly CaseStudy[]): () => ReactElement {
  return function BoundWorkIndex(): ReactElement {
    return <WorkIndex studies={studies} />;
  };
}

export function makeWorkRequest(studies: readonly CaseStudy[]): () => ReactElement {
  return function BoundWorkRequest(): ReactElement {
    return <RequestPage studies={studies} />;
  };
}

export function makeCaseStudy(study: CaseStudy): () => ReactElement {
  return function BoundCaseStudy(): ReactElement {
    return <CaseStudyPage study={study} />;
  };
}
