import type { ReactElement } from "react";

import type { Experience } from "../content";
import { CONTACT_EMAIL, GITHUB_URL } from "../site";
import { ExperienceTimeline, SkillsRow } from "./experience";
import { Signature } from "./signature";
import { ArrowLink, Eyebrow, HEADING, PAGE, SectionHead, WIDTH } from "./layout";

function AboutPage({ experience }: { experience: readonly Experience[] }): ReactElement {
  return (
    <main>
      <div className={PAGE}>
        <Eyebrow>about</Eyebrow>
        <h1 className={`${HEADING} mt-8`}>
          i build websites <span className="serif text-accent">for people</span> who run businesses.
        </h1>
        <div className="mt-16 sm:mt-24 grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-4 text-ink">
            <Signature className="w-[min(100%,320px)] -rotate-3" draw weight={1.1} />
          </div>
          <div className="md:col-span-8 max-w-[42rem]">
            <p className="m-0 text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.3] tracking-[-0.025em] [text-wrap:pretty]">
              i'm ryan. i've been building websites, stores + software since 2017, at agencies, startups and product companies.
            </p>
            <p className="mt-6 mb-0 text-muted text-[1.1rem] leading-relaxed">
              at luxury presence i built one platform that runs 30k+ sites + 10 million+ requests a day. before that i led frontend work at 10up for blackstone, stanford and holt international.
            </p>
            <p className="mt-6 mb-0 text-muted text-[1.1rem] leading-relaxed">
              i also have a full-time job as a software engineer, so i only take a few clients and reply to everything within 1 business day. you always deal w/ me, not a team you've never met.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ArrowLink href={`mailto:${CONTACT_EMAIL}`} tone="accent">
                email me
              </ArrowLink>
              <a className="inline-flex items-center rounded-full border border-line px-6 py-3 font-medium hover:border-ink transition-colors" href={GITHUB_URL}>
                github
              </a>
            </div>
          </div>
        </div>
      </div>
      <section className={`${WIDTH} pt-28 sm:pt-36 pb-28`}>
        <SectionHead label="experience" title="where i've worked." />
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
