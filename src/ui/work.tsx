import type { ReactElement } from "react";

import type { CaseStudy } from "../content";
import { HEADING, LEDE, SHELL } from "./layout";

export function CaseStudyList({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  if (studies.length === 0) {
    return <p className="text-muted">Case studies are being written. Ask me about recent work in the meantime.</p>;
  }
  return (
    <ul className="list-none p-0 m-0 grid gap-4 md:grid-cols-2">
      {studies.map((study) => (
        <li key={study.route}>
          <a className="block border border-line rounded-2xl p-6 h-full hover:border-ink" href={study.route}>
            <span className="text-faint text-[0.85rem]">
              {study.industry} · {study.year}
            </span>
            <h3 className="text-[1.1rem] font-semibold text-ink my-1">{study.title}</h3>
            <p className="text-muted m-0">{study.summary}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}

function WorkIndex({ studies }: { studies: readonly CaseStudy[] }): ReactElement {
  return (
    <main className={SHELL}>
      <h1 className={HEADING}>Work</h1>
      <p className={LEDE}>What I built, why, and how it turned out.</p>
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
    <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-[0.95rem] border-y border-line py-5 mb-10">
      {rows.map(([label, value]) => (
        <div className="contents" key={label}>
          <dt className="text-faint">{label}</dt>
          <dd className="m-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CaseStudyPage({ study }: { study: CaseStudy }): ReactElement {
  return (
    <main className={SHELL}>
      <p className="text-[0.9rem] mb-6">
        <a className="text-muted hover:text-ink" href="/work">
          ← Work
        </a>
      </p>
      <h1 className={HEADING}>{study.title}</h1>
      <p className={LEDE}>{study.summary}</p>
      <Facts study={study} />
      <article className="prose" dangerouslySetInnerHTML={{ __html: study.html }} />
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
