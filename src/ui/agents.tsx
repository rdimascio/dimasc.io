import type { ReactElement } from "react";

import { AGENTS_KIT_ROUTE, AGENTS_TEARDOWN_ROUTE, TEARDOWN_CTA } from "../agents";
import { SITE_NAME } from "../site";
import { Eyebrow, FocusLayout, HEADING, LEDE, PAGE, WIDTH } from "./layout";

export const AGENTS_EYEBROW = "for founders with paying users";
export const AGENTS_HEADLINE = "your app has paying users. now it needs a senior engineer";
export const AGENTS_TITLE = `senior engineer by subscription · ${SITE_NAME}`;
export const AGENTS_DESCRIPTION =
  "a senior engineer for founders whose ai-built app has paying users. reviewed PRs in your repo, $4,995/month, pause anytime. free repo check.";
export const AGENTS_LEDE =
  "you built it w/ lovable, bolt, replit or cursor, and now real users are finding the holes. i fix them + ship your requests as reviewed PRs in your repo, about one every 2 days.";
export const CHECK_LINE = "send me your app + a read-only repo invite. i send back a 10 min video w/ the 3 things that break first. no call.";

export const PLAN_NAME = "your senior engineer, monthly";
export const PLAN_PRICE = "$4,995/month. the first 2 founders pay $3,995, locked while they stay. pause or cancel anytime.";
export const PLAN_CAPACITY = "i take 2 founders at a time.";
export const PLAN_INCLUDES = [
  "month 1 starts w/ a safety pass: logins, who can see whose data, leaked keys, double charges. fixed as PRs you can merge.",
  "after that, unlimited requests, one at a time. big ones get split into 2 day chunks.",
  "every change is a reviewed PR in your repo, and you own all of it.",
  "async only: github issues in, a short video when it ships. no standing calls.",
] as const;
export const NOT_COVERED = "not covered: on-call or uptime promises, payment, payroll or other regulated money code, app store releases, rewrites from scratch.";
export const KIT_LINE = "the guardrails i run my own coding agents with are open source.";
export const KIT_LINK_LABEL = "see them on github";

function AgentsPage(): ReactElement {
  return (
    <main>
      <div className={PAGE}>
        <Eyebrow>{AGENTS_EYEBROW}</Eyebrow>
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
          <p className="mt-5 mb-0 text-muted max-w-[34rem]">{CHECK_LINE}</p>
        </div>
      </div>
      <section aria-labelledby="plan-title" className={`${WIDTH} pt-28 sm:pt-36 pb-28`}>
        <div className="grid gap-10 md:grid-cols-12 border-t border-ink pt-8">
          <div className="md:col-span-5">
            <Eyebrow>one plan</Eyebrow>
            <h2 className="mt-6 mb-0 text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.02] tracking-[-0.035em] font-medium" id="plan-title">
              {PLAN_NAME}
            </h2>
            <p className="mt-6 mb-0 text-[1.1rem] leading-relaxed max-w-[28rem]">{PLAN_PRICE}</p>
            <p className="mt-4 mb-0 text-muted text-[1.05rem] leading-relaxed max-w-[28rem]">{PLAN_CAPACITY}</p>
          </div>
          <div className="md:col-span-7">
            <ul className="m-0 p-0 list-none grid gap-6">
              {PLAN_INCLUDES.map((line) => (
                <li className="border-t border-line pt-5 text-[1.05rem] leading-relaxed" key={line}>
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-8 mb-0 text-muted text-[1.05rem] leading-relaxed">{NOT_COVERED}</p>
            <p className="mt-8 mb-0 text-muted text-[1.05rem] leading-relaxed">
              {KIT_LINE}{" "}
              <a className="underline underline-offset-4 hover:text-ink" href={AGENTS_KIT_ROUTE} rel="nofollow">
                {KIT_LINK_LABEL}
              </a>
            </p>
          </div>
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
