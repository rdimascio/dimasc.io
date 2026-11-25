import type { ReactElement } from "react";

import { AGENTS_KIT_ROUTE, AGENTS_TEARDOWN_ROUTE, TEARDOWN_CTA } from "../agents";
import { SITE_NAME } from "../site";
import { Eyebrow, FocusLayout, HEADING, LEDE, PAGE, WIDTH } from "./layout";

export const AGENTS_HEADLINE = "the guardrails i use to let coding agents ship real code";
export const AGENTS_TITLE = `agent guardrails · ${SITE_NAME}`;
export const AGENTS_DESCRIPTION = "the guardrails i use to let coding agents ship real code. free starter kit + a free 20 min teardown of your agent setup.";
export const AGENTS_LEDE =
  "if your team's agents keep shipping stuff you end up cleaning up, i'll go through your setup with you on a free 20 min call and tell you what i'd change.";
export const KIT_LINE =
  "3 hooks you drop into your coding agent's settings. plain node, no dependencies, tests included, MIT so do whatever you want w/ it.";
export const KIT_LINK_LABEL = "get the starter kit on github";

export const KIT_HOOKS = [
  {
    name: "force-push guard",
    line: "stops the agent from force pushing over commits it never saw. the only force push it lets through is a lease pinned to a sha you actually looked at.",
  },
  {
    name: "evidence first",
    line: "when your prompt says something's broken, failing or rate limited, it tells the agent to go find the real error and the cause before it touches any code",
  },
  {
    name: "claims need receipts",
    line: "if the agent says tests pass or it merged something and no test or git command ran that turn, it gets sent back to actually check",
  },
] as const;

function AgentsPage(): ReactElement {
  return (
    <main>
      <div className={PAGE}>
        <Eyebrow>for startup eng teams</Eyebrow>
        <h1 className={`${HEADING} mt-8 max-w-[18ch]`}>{AGENTS_HEADLINE}</h1>
        <p className={`${LEDE} mt-10`}>{AGENTS_LEDE}</p>
        <div className="mt-10">
          <a
            className="inline-flex items-center rounded-full bg-accent text-on-accent px-7 py-4 font-medium hover:opacity-90 transition-opacity"
            href={AGENTS_TEARDOWN_ROUTE}
            rel="nofollow"
          >
            {TEARDOWN_CTA}
          </a>
        </div>
      </div>
      <section aria-labelledby="kit-title" className={`${WIDTH} pt-28 sm:pt-36 pb-28`}>
        <div className="grid gap-10 md:grid-cols-12 border-t border-ink pt-8">
          <div className="md:col-span-5">
            <Eyebrow>free starter kit</Eyebrow>
            <h2 className="mt-6 mb-0 text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.02] tracking-[-0.035em] font-medium" id="kit-title">
              agent-guardrails
            </h2>
            <p className="mt-6 mb-0 text-muted text-[1.1rem] leading-relaxed max-w-[28rem]">{KIT_LINE}</p>
            <a
              className="mt-8 inline-flex items-center rounded-full border border-line px-6 py-3 font-medium hover:border-ink transition-colors"
              href={AGENTS_KIT_ROUTE}
              rel="nofollow"
            >
              {KIT_LINK_LABEL}
            </a>
          </div>
          <ul className="md:col-span-7 m-0 p-0 list-none grid gap-8">
            {KIT_HOOKS.map((hook) => (
              <li className="border-t border-line pt-5" key={hook.name}>
                <h3 className="m-0 font-mono text-[0.95rem] tracking-[0.02em]">{hook.name}</h3>
                <p className="mt-3 mb-0 text-muted text-[1.05rem] leading-relaxed">{hook.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

export function makeAgents(): () => ReactElement {
  return function BoundAgents(): ReactElement {
    return (
      <FocusLayout>
        <AgentsPage />
      </FocusLayout>
    );
  };
}
