import type { ReactElement } from "react";

import type { Experience } from "../content";
import { CONTACT_EMAIL, GITHUB_URL } from "../site";
import { ExperienceTimeline, SkillsRow } from "./experience";
import { ArrowLink, Eyebrow, HEADING, PAGE, SectionHead, WIDTH } from "./layout";

function AboutPage({ experience }: { experience: readonly Experience[] }): ReactElement {
  return (
    <main>
      <div className={PAGE}>
        <Eyebrow>About</Eyebrow>
        <h1 className={`${HEADING} mt-8`}>
          I build software <span className="serif text-accent">for people</span> who run businesses.
        </h1>
        <div className="mt-16 sm:mt-24 grid gap-10 md:grid-cols-12 items-start">
          <div
            className="md:col-span-4 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-ink text-bg grid place-items-center text-[2.4rem] font-medium tracking-[-0.05em]"
            aria-hidden="true"
          >
            RD
          </div>
          <div className="md:col-span-8 max-w-[42rem]">
            <p className="m-0 text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.3] tracking-[-0.025em] [text-wrap:pretty]">
              I'm Ryan DiMascio. I've built websites, stores and software since 2017, at agencies, startups and product companies.
            </p>
            <p className="mt-6 mb-0 text-muted text-[1.1rem] leading-relaxed">
              At Luxury Presence I built a multi-tenant Next.js platform that serves 30K+ sites and 10M+ requests/day. Before that I led frontend work at 10up for Blackstone, Stanford eCorner and Holt International.
            </p>
            <p className="mt-6 mb-0 text-muted text-[1.1rem] leading-relaxed">
              I also work full time as a software engineer, so I keep this to a small number of clients and reply to every request within one business day. You always deal with me, not a team you've never met.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ArrowLink href={`mailto:${CONTACT_EMAIL}`} tone="accent">
                Email me
              </ArrowLink>
              <a className="inline-flex items-center rounded-full border border-line px-6 py-3 font-medium hover:border-ink transition-colors" href={GITHUB_URL}>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
      <section className={`${WIDTH} pt-28 sm:pt-36 pb-28`}>
        <SectionHead label="Experience" title="Where I have worked." />
        <ExperienceTimeline items={experience} />
        <div className="mt-20">
          <SkillsRow />
        </div>
      </section>
    </main>
  );
}

export function makeAbout(experience: readonly Experience[]): () => ReactElement {
  return function BoundAbout(): ReactElement {
    return <AboutPage experience={experience} />;
  };
}
