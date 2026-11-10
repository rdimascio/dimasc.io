import type { ReactElement } from "react";

import type { CaseStudy } from "../content";
import { CONTACT_EMAIL } from "../site";
import { Eyebrow, HEADING, LEDE, PAGE } from "./layout";

export function CaseStudyList({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
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
    <ul className="m-0 p-0 list-none border-b border-line">
      {studies.map((study) => (
        <li key={study.route}>
          <a
            className="group grid gap-2 md:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] border-t border-line py-7"
            href={study.route}
          >
            <span className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-muted">
              {study.industry} · {study.year}
            </span>
            <h3 className="m-0 text-[1.35rem] leading-tight tracking-[-0.025em] font-medium group-hover:underline underline-offset-4">
              {study.title}
            </h3>
            <p className="m-0 text-muted">{study.summary}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}

function WorkIndex({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  return (
    <main className={PAGE}>
      <Eyebrow>Work</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>Selected work</h1>
      <p className={`${LEDE} mt-8 mb-16`}>What I built, why, and how it turned out.</p>
      <CaseStudyList studies={studies} />
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

function CaseStudyPage({ study }: { study: CaseStudy }): ReactElement {
  return (
    <main className={PAGE}>
      <a className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-muted hover:text-ink" href="/work">
        ← Work
      </a>
      <h1 className={`${HEADING} mt-8 max-w-[18ch]`}>{study.title}</h1>
      <p className={`${LEDE} mt-8`}>{study.summary}</p>
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

export function makeCaseStudy(study: CaseStudy): () => ReactElement {
  return function BoundCaseStudy(): ReactElement {
    return <CaseStudyPage study={study} />;
  };
}
