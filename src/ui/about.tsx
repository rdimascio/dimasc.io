import type { ReactElement } from "react";

import type { Experience } from "../content";
import { ABOUT_ROUTE, GITHUB_URL, SERVICE_AREA_COPY, SITE_CHECK_CTA, siteCheckHref } from "../site";
import { breadcrumbLd, pageGraph } from "../structured-data";
import { JsonLd } from "./json-ld";
import { ExperienceTimeline, SkillsRow } from "./experience";
import { Signature } from "./signature";
import { ArrowLink, Eyebrow, HEADING, PAGE, SectionHead, WIDTH } from "./layout";

export const ABOUT_PARAGRAPHS = [
  "at luxury presence i built + scaled the platform that runs 30k+ real estate websites and 10 million+ requests a day. i cut load time on its property pages by 87% and cut how often it broke by 60%. i was also tech lead on the mls home search behind serhant.com, which ran every luxury presence customer's listing search. before that, at 10up, i was tech lead on holt international's site. i was also a front-end engineer on blackstone + stanford ecorner.",
  "a lot of website care is someone logging in once a month to click update on plugins. that works till something breaks. finding out why it broke is my actual job.",
  "i still have a full-time job as a software engineer, so i only take a few clients. i reply within 1 business day, monday to friday. you always deal w/ me.",
] as const;

function AboutPage({ experience }: { experience: readonly Experience[] }): ReactElement {
  return (
    <main>
      <JsonLd data={pageGraph(breadcrumbLd([{ name: "about", route: ABOUT_ROUTE }]))} />
      <div className={PAGE}>
        <Eyebrow>about</Eyebrow>
        <h1 className={`${HEADING} mt-8`}>
          i'm a software engineer. <span className="serif text-accent">i look after websites</span> for people who run businesses.
        </h1>
        <div className="mt-16 sm:mt-24 grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-4 text-ink">
            <Signature className="w-[min(100%,300px)] -rotate-3" weight={1.1} />
          </div>
          <div className="md:col-span-8 max-w-[42rem]">
            <p className="m-0 text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.3] tracking-[-0.025em] [text-wrap:pretty]">
              {`i'm ryan, a senior software engineer in ${SERVICE_AREA_COPY}. i've been building websites + software since 2017, at agencies and software companies. my day job is senior engineer at every, a y combinator startup.`}
            </p>
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <p className="mt-6 mb-0 text-muted text-[1.1rem] leading-relaxed" key={paragraph}>
                {paragraph}
              </p>
            ))}
            <div className="mt-10 flex flex-wrap gap-3">
              <ArrowLink href={siteCheckHref()} tone="accent">
                {SITE_CHECK_CTA}
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
