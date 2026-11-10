import type { ReactElement } from "react";

import type { CaseStudy, ProcessStep } from "../content";
import { CONTACT_EMAIL } from "../site";
import { Eyebrow, SectionHead, WIDTH } from "./layout";
import { ProcessRows } from "./process";
import { CaseStudyList } from "./work";

const CAPABILITIES = [
  {
    title: "Web and commerce",
    items: ["Marketing sites", "Shopify stores", "Pages your staff can edit", "Speed and search basics"],
  },
  {
    title: "Systems",
    items: ["Booking and payments", "Integrations between tools", "Moving off old software", "Reports you can trust"],
  },
  {
    title: "AI and internal tools",
    items: ["Dashboards and admin tools", "AI assistants and automations", "Workflows that remove busywork", "Monitoring and alerts"],
  },
] as const;

const PROMISES = [
  { figure: "Flat", detail: "A fixed price per step, agreed before work starts. No hourly billing." },
  { figure: "Small steps", detail: "Something working at the end of every step. Stop after any of them." },
  { figure: "Yours", detail: "You own every account and every line of code from day one." },
] as const;

export function Home({ studies, steps }: { studies: readonly CaseStudy[]; steps: readonly ProcessStep[] }): ReactElement {
  return (
    <main>
      <section className={`${WIDTH} pt-20 sm:pt-32 pb-20`}>
        <Eyebrow>Independent software studio</Eyebrow>
        <h1 className="mt-8 mb-0 text-[clamp(2.8rem,8.5vw,7rem)] leading-[0.94] tracking-[-0.05em] font-medium max-w-[13ch]">
          Software that fixes what's slowing you down.
        </h1>
        <div className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] border-t border-line pt-8">
          <div className="flex flex-wrap gap-3 items-start">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-ink text-bg px-5 py-3 font-medium hover:opacity-90"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              Start a project <span aria-hidden="true">→</span>
            </a>
            <a className="inline-flex rounded-full border border-line px-5 py-3 font-medium hover:border-ink" href="/process">
              How I work
            </a>
          </div>
          <p className="m-0 text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.4] tracking-[-0.015em] text-ink-2 max-w-[34rem]">
            I'm Ryan, a software engineer with more than ten years of experience. I build websites, stores, integrations and AI tools for small businesses, in small steps, at a flat price.
          </p>
        </div>
      </section>

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="What I build" title="Practical software for businesses without a tech team." />
        <div className="grid gap-10 sm:grid-cols-3 md:ml-[calc(33.333%+0.33rem)]">
          {CAPABILITIES.map((group) => (
            <div key={group.title}>
              <h3 className="m-0 mb-4 text-[1rem] font-medium">{group.title}</h3>
              <ul className="m-0 p-0 list-none flex flex-col gap-2 text-muted">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="Selected work" />
        <CaseStudyList studies={studies} />
      </section>

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="How a project runs" title="You see the research behind every decision and a price before any work." />
        <ProcessRows steps={steps} />
        <p className="mt-8 mb-0">
          <a className="font-medium underline underline-offset-4 decoration-line hover:decoration-ink" href="/process">
            Read the full process
          </a>
        </p>
      </section>

      <section className={`${WIDTH} py-16`}>
        <SectionHead label="Working together" />
        <div className="grid gap-px bg-line sm:grid-cols-3 border border-line rounded-2xl overflow-hidden">
          {PROMISES.map((promise) => (
            <div className="bg-bg p-7" key={promise.figure}>
              <p className="m-0 text-[2rem] tracking-[-0.04em] font-medium">{promise.figure}</p>
              <p className="mt-3 mb-0 text-muted">{promise.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export function makeHome(studies: readonly CaseStudy[], steps: readonly ProcessStep[]): () => ReactElement {
  return function BoundHome(): ReactElement {
    return <Home studies={studies} steps={steps} />;
  };
}
