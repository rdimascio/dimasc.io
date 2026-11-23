import type { ReactElement } from "react";

import type { ProcessStep } from "../content";
import { PROCESS_ROUTE } from "../sitemap";
import { breadcrumbLd, pageGraph } from "../structured-data";
import { JsonLd } from "./json-ld";
import { Eyebrow, HEADING, LEDE, PAGE } from "./layout";
import { AI_NAME } from "../site";

export const PROCESS_TITLE = "how it works, step by step";
export const PROCESS_LEDE =
  "from a free 15-min call to ai that takes busywork off your plate. flat prices, agreed before i start. you test it before it goes live, + i keep it working after.";

function stepNumber(step: number): string {
  return String(step).padStart(2, "0");
}

export function ProcessRows({ steps }: { steps: readonly ProcessStep[] }): ReactElement {
  return (
    <ol className="m-0 p-0 list-none border-b border-line">
      {steps.map((step) => (
        <li
          className="grid gap-3 md:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] border-t border-line py-7"
          key={step.slug}
        >
          <span className="font-mono text-[0.85rem] text-accent">{stepNumber(step.step)}</span>
          <h3 className="m-0 text-[1.35rem] leading-tight tracking-[-0.025em] font-medium">{step.title}</h3>
          <p className="m-0 text-muted">{step.summary}</p>
        </li>
      ))}
    </ol>
  );
}

function ProcessPage({ steps }: { steps: readonly ProcessStep[] }): ReactElement {
  return (
    <main className={PAGE}>
      <JsonLd data={pageGraph(breadcrumbLd([{ name: PROCESS_TITLE, route: PROCESS_ROUTE }]))} />
      <Eyebrow>{AI_NAME}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{PROCESS_TITLE}</h1>
      <p className={`${LEDE} mt-8`}>
        {PROCESS_LEDE}
      </p>
      <ol className="mt-20 m-0 p-0 list-none">
        {steps.map((step) => (
          <li
            className="grid gap-4 md:gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] border-t border-ink py-10"
            id={step.slug}
            key={step.slug}
          >
            <div>
              <span className="font-mono text-[0.85rem] text-accent">{stepNumber(step.step)}</span>
              <h2 className="mt-3 mb-0 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight tracking-[-0.035em] font-medium">
                {step.title}
              </h2>
            </div>
            <div className="prose max-w-[38rem]" dangerouslySetInnerHTML={{ __html: step.html }} />
          </li>
        ))}
      </ol>
    </main>
  );
}

export function makeProcess(steps: readonly ProcessStep[]): () => ReactElement {
  return function BoundProcess(): ReactElement {
    return <ProcessPage steps={steps} />;
  };
}
