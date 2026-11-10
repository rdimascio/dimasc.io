import type { ReactElement } from "react";

import type { CaseStudy, ProcessStep } from "../content";
import { CONTACT_EMAIL } from "../site";
import { CaseStudyList } from "./work";

const SERVICES = [
  {
    title: "Websites and stores",
    body: "Fast marketing sites and Shopify stores your staff can edit without calling me.",
  },
  {
    title: "Booking, payments and integrations",
    body: "Connect the tools you already pay for, or replace the one that keeps getting in the way.",
  },
  {
    title: "Internal tools and AI workflows",
    body: "Dashboards, automations and AI assistants built around how your business actually runs.",
  },
] as const;

export function Home({ studies, steps }: { studies: readonly CaseStudy[]; steps: readonly ProcessStep[] }): ReactElement {
  return (
    <main>
      <section className="max-w-[1040px] mx-auto px-6 pt-24 pb-16">
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] leading-[1.04] tracking-[-0.04em] font-semibold max-w-[16ch] mb-6">
          Software that fixes the thing that's slowing you down.
        </h1>
        <p className="text-muted text-[1.2rem] leading-relaxed max-w-[38rem] mb-8">
          I'm Ryan, a software engineer with more than ten years of experience. I build websites, stores, integrations and AI tools for small businesses, in small steps, at a flat price.
        </p>
        <div className="flex flex-wrap gap-3">
          <a className="rounded-full bg-ink text-bg px-5 py-2.5 font-medium" href={`mailto:${CONTACT_EMAIL}`}>
            Start a project
          </a>
          <a className="rounded-full border border-line px-5 py-2.5 font-medium" href="/process">
            How I work
          </a>
        </div>
      </section>

      <section className="max-w-[1040px] mx-auto px-6 py-12 grid gap-6 md:grid-cols-3">
        {SERVICES.map((service) => (
          <div className="border border-line rounded-2xl p-6" key={service.title}>
            <h2 className="text-[1.05rem] font-semibold mb-2">{service.title}</h2>
            <p className="text-muted m-0">{service.body}</p>
          </div>
        ))}
      </section>

      <section className="max-w-[1040px] mx-auto px-6 py-12">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.02em] mb-6">Work</h2>
        <CaseStudyList studies={studies} />
      </section>

      <section className="max-w-[1040px] mx-auto px-6 py-12">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.02em] mb-6">How a project runs</h2>
        <ol className="list-none p-0 m-0 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <li className="border border-line rounded-2xl p-6" key={step.slug}>
              <span className="text-faint text-[0.85rem]">Step {step.step}</span>
              <h3 className="text-[1.05rem] font-semibold my-1">{step.title}</h3>
              <p className="text-muted m-0">{step.summary}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          <a className="font-medium" href="/process">
            Read the full process →
          </a>
        </p>
      </section>
    </main>
  );
}

export function makeHome(studies: readonly CaseStudy[], steps: readonly ProcessStep[]): () => ReactElement {
  return function BoundHome(): ReactElement {
    return <Home studies={studies} steps={steps} />;
  };
}
