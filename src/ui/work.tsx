import type { ReactElement } from "react";

import type { CaseStudy } from "../content";
import { CONTACT_EMAIL } from "../site";
import { projectName, requestAnchor, requestMailto, screenshotSrc, WORK_ROUTE } from "../work";
import { Eyebrow, HEADING, LEDE, PAGE } from "./layout";

export const REQUEST_LINE = "Full case studies are shared on request.";

function CaseStudyCard({ study }: { study: CaseStudy }): ReactElement {
  return (
    <li>
      <a className="group flex flex-col h-full rounded-3xl border border-line bg-card overflow-hidden hover:border-ink" href={requestAnchor(study)}>
        <img
          alt={`${projectName(study)} home page`}
          className="block w-full aspect-[16/10] object-cover object-top border-b border-line bg-bg-soft"
          height={900}
          loading="lazy"
          src={screenshotSrc(study, "desktop")}
          width={1440}
        />
        <span className="flex flex-col gap-2 p-6">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted">{study.industry}</span>
          <h3 className="m-0 text-[1.25rem] leading-tight tracking-[-0.025em] font-medium group-hover:underline underline-offset-4">
            {projectName(study)}
          </h3>
          <p className="m-0 text-muted">{study.summary}</p>
        </span>
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
    <ul className="m-0 p-0 list-none grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {studies.map((study) => (
        <CaseStudyCard key={study.slug} study={study} />
      ))}
    </ul>
  );
}

function WorkIndex({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  return (
    <main className={PAGE}>
      <Eyebrow>Work</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>Selected work</h1>
      <p className={`${LEDE} mt-8 mb-16`}>{REQUEST_LINE}</p>
      <CaseStudyGrid studies={studies} />
    </main>
  );
}

function RequestPage({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  return (
    <main className={PAGE}>
      <a className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-muted hover:text-ink" href={WORK_ROUTE}>
        ← Work
      </a>
      <h1 className={`${HEADING} mt-8`}>Request a case study</h1>
      <p className={`${LEDE} mt-8 mb-16`}>
        {REQUEST_LINE} Email me and say which project you want to read about.
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
              Request this case study <span aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 mb-0 text-muted">
        Or write to{" "}
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
    ...(study.client === undefined ? [] : [["Client", study.client] as const]),
    ["Industry", study.industry] as const,
    ["Year", String(study.year)] as const,
    ["Services", study.services.join(", ")] as const,
    ["Stack", study.stack.join(", ")] as const,
  ];
  return (
    <dl className="m-0 flex flex-col gap-5 text-[0.95rem]">
      {rows.map(([label, value]) => (
        <div className="border-t border-line pt-3" key={label}>
          <dt className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted mb-1">{label}</dt>
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
      <a className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-muted hover:text-ink" href={WORK_ROUTE}>
        ← Work
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
