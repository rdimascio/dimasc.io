import type { ReactElement } from "react";

import type { ProcessStep } from "../content";
import { HEADING, LEDE, SHELL } from "./layout";

function ProcessPage({ steps }: { steps: readonly ProcessStep[] }): ReactElement {
  return (
    <main className={SHELL}>
      <h1 className={HEADING}>How I work</h1>
      <p className={LEDE}>
        Every project follows the same steps. You see the research behind each decision, a flat price before work starts, and something working at the end of each step.
      </p>
      <ol className="list-none p-0 m-0">
        {steps.map((step) => (
          <li className="border-t border-line py-8" id={step.slug} key={step.slug}>
            <span className="text-faint text-[0.85rem]">Step {step.step}</span>
            <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] mt-1 mb-3">{step.title}</h2>
            <div className="prose" dangerouslySetInnerHTML={{ __html: step.html }} />
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
