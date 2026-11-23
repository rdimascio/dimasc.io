import type { CSSProperties, ReactElement } from "react";

import { ARTICLES_ROUTE, type Article, type CaseStudy, type FaqItem, type Plan } from "../content";
import { BRAND_LOGOS, logoSrc, opticalScale } from "../logos";
import { LOOK_AFTER_LINE, PRICING_TERMS, RUNS_IN_LINE, STEPS } from "../offer";
import { AI_NAME, AI_ROUTE, aiPricesHref, INTRO_CALL_CTA, introCallHref, SERVICE_AREA_COPY } from "../site";
import { homeGraph } from "../structured-data";
import { WORK_ROUTE } from "../work";
import { YOUTH_SPORTS_ROUTE } from "../youth-sports";
import { ABOUT_ROUTE, ArrowLink, Eyebrow, SectionHead, WIDTH } from "./layout";
import { ArticleList } from "./articles";
import { JsonLd } from "./json-ld";
import { ExampleCards, IntroCallBand, LadderList, NumberedSteps, WhoForLists } from "./offer";
import { CaseStudyGrid, RequestNote } from "./work";

export const SINCE_YEAR = 2017;
export const HERO_EYEBROW = `ai help for local businesses in ${SERVICE_AREA_COPY}`;
export const HERO_LEAD = "ai that takes the busywork";
export const HERO_TURN = "off your plate";
export const HERO_LINE = "i set it up inside the tools you already use, then i keep it working. you run the business.";
export const CREDENTIALS = [
  "tech lead on holt international + the serhant.com mls home search.",
  "front-end engineer on blackstone + stanford ecorner.",
  `software engineer since ${SINCE_YEAR}. by day at every, a y combinator startup.`,
] as const;
const HOME_ARTICLE_COUNT = 3;

function sectionIndex(position: number): string {
  return `(${String(position).padStart(2, "0")})`;
}

export const LOGO_COPIES_PER_TRACK = 4;

function LogoStrip(): ReactElement {
  const copies = Array.from({ length: LOGO_COPIES_PER_TRACK }, (_, copy) => copy);
  const track = (hidden: boolean): ReactElement => (
    <ul className="marquee-track m-0 p-0 list-none" aria-hidden={hidden ? "true" : undefined}>
      {copies.flatMap((copy) =>
        BRAND_LOGOS.map((logo) => {
          const isRepeat = hidden || copy > 0;
          return (
            <li
              aria-hidden={!hidden && isRepeat ? "true" : undefined}
              className={`flex items-center px-5 sm:px-10${copy > 0 ? " marquee-repeat" : ""}`}
              key={`${copy}-${logo.slug}`}
            >
              <span
                aria-label={isRepeat ? undefined : logo.name}
                className="brand-logo"
                role={isRepeat ? undefined : "img"}
                style={{ "--logo": `url(${logoSrc(logo)})`, "--logo-scale": opticalScale(logo), aspectRatio: logo.ratio } as CSSProperties}
              />
            </li>
          );
        }),
      )}
    </ul>
  );
  return (
    <section aria-label="companies + clients i've built for" className="logo-strip border-t border-line overflow-hidden py-5 sm:py-6">
      <div className="marquee">
        {track(false)}
        {track(true)}
      </div>
    </section>
  );
}


function Hero(): ReactElement {
  return (
    <section className="hero flex flex-col">
      <div className={`${WIDTH} w-full flex-1 flex flex-col justify-center pt-8 sm:pt-12 pb-8 sm:pb-12`}>
        <Eyebrow>{HERO_EYEBROW}</Eyebrow>
        <h1 className="mt-6 sm:mt-8 mb-0 font-semibold leading-[0.98] tracking-[-0.055em] text-[clamp(2.6rem,7vw,7.4rem)] max-w-[14ch] md:max-w-[17ch] [text-wrap:balance]">
          <span className="hero-line">
            <span>
              {`${HERO_LEAD} `}
              <span className="serif font-normal tracking-[-0.02em] text-muted">{HERO_TURN}</span>
              <span className="text-accent-bright">.</span>
            </span>
          </span>
        </h1>
        <p className="mt-6 mb-0 max-w-[38rem] text-[1.1rem] sm:text-[1.25rem] text-muted">{HERO_LINE}</p>
        <div className="mt-8 sm:mt-12 grid gap-7 md:grid-cols-12 md:items-end">
          <ul className="md:col-span-7 m-0 p-0 list-none flex flex-col gap-1.5 text-[0.98rem] sm:text-[1.08rem] leading-snug text-muted">
            {CREDENTIALS.map((line) => (
              <li className="flex gap-2.5" key={line}>
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="md:col-span-5 flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end">
            <ArrowLink href={introCallHref()} tone="accent">
              {INTRO_CALL_CTA}
            </ArrowLink>
            <a className="link-underline inline-block py-2 text-muted hover:text-ink" href={ABOUT_ROUTE}>
              about me
            </a>
          </div>
        </div>
      </div>
      <LogoStrip />
    </section>
  );
}

function WhatItCanDo(): ReactElement {
  return (
    <section className={`${WIDTH} py-24 sm:py-32`} id="what-it-can-do">
      <SectionHead
        aside={
          <a className="link-underline inline-block py-2 text-ink" href={YOUTH_SPORTS_ROUTE}>
            for youth sports
          </a>
        }
        index={sectionIndex(1)}
        label="what it can do"
        title={
          <>
            the busywork <span className="serif">i take off your plate.</span>
          </>
        }
      />
      <ExampleCards />
      <div className="mt-10 md:ml-[calc(33.333%+0.5rem)]">
        <p className="m-0 text-[1.1rem] max-w-[40rem]">{RUNS_IN_LINE}</p>
        <p className="mt-3 mb-0 text-[1.1rem] text-muted max-w-[40rem]">{LOOK_AFTER_LINE}</p>
        <a className="link-underline mt-6 inline-block py-2 text-ink" href={AI_ROUTE}>
          {`more about ${AI_NAME}`}
        </a>
      </div>
    </section>
  );
}

function HowItWorks(): ReactElement {
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="how-it-works">
      <SectionHead
        index={sectionIndex(2)}
        label="how it works"
        title={
          <>
            start small. <span className="serif">i keep it working.</span>
          </>
        }
      />
      <NumberedSteps steps={STEPS} />
    </section>
  );
}

function Pricing({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="pricing">
      <SectionHead
        index={sectionIndex(3)}
        label="prices"
        title={
          <>
            flat prices. <span className="serif text-muted">no hourly bills.</span>
          </>
        }
      />
      <IntroCallBand />
      <div className="mt-10">
        <LadderList plans={plans} />
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 text-ink">{PRICING_TERMS}</p>
        <a className="link-underline inline-block py-2 text-ink" href={aiPricesHref()}>
          what's in each one
        </a>
      </div>
    </section>
  );
}

function WhoFor(): ReactElement {
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32 scroll-mt-16`} id="who-its-for">
      <SectionHead index={sectionIndex(4)} label="who it's for" title="local businesses w/o a tech team." />
      <div className="md:ml-[calc(33.333%+0.5rem)]">
        <WhoForLists />
      </div>
    </section>
  );
}

function Work({ studies }: { studies: readonly CaseStudy[] }): ReactElement | null {
  if (studies.length === 0) return null;
  return (
    <section className="night scroll-mt-16" id="work">
      <div className={`${WIDTH} py-24 sm:py-32`}>
        <SectionHead
          aside={
            <a className="link-underline inline-block py-2 text-ink" href={WORK_ROUTE}>
              all past work
            </a>
          }
          index={sectionIndex(5)}
          label="past work"
          title={
            <>
              sites i've <span className="serif text-accent">worked on.</span>
            </>
          }
        />
        <CaseStudyGrid compact studies={studies} />
        <RequestNote />
      </div>
    </section>
  );
}

function LatestArticles({ articles }: { articles: readonly Article[] }): ReactElement | null {
  if (articles.length === 0) return null;
  return (
    <section className={`${WIDTH} pb-24 sm:pb-32`}>
      <SectionHead
        aside={
          <a className="link-underline inline-block py-2 text-ink" href={ARTICLES_ROUTE}>
            all articles
          </a>
        }
        label="articles"
        title="stuff i've written."
      />
      <ArticleList articles={articles.slice(0, HOME_ARTICLE_COUNT)} />
    </section>
  );
}

function Faq({ faq }: { faq: readonly FaqItem[] }): ReactElement {
  return (
    <section className={`${WIDTH} py-24 sm:py-32`}>
      <SectionHead index={sectionIndex(6)} label="questions" title="stuff people ask." />
      <div className="md:ml-[calc(33.333%+0.5rem)] border-b border-line">
        {faq.map((item) => (
          <details className="group border-t border-line py-6" key={item.slug}>
            <summary className="flex justify-between gap-6 cursor-pointer list-none text-[clamp(1.1rem,1.6vw,1.3rem)] tracking-[-0.015em] font-medium rounded-md [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                className="grid place-items-center shrink-0 w-8 h-8 rounded-full border border-line text-muted transition-transform duration-300 group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <div className="prose mt-4 max-w-[40rem]" dangerouslySetInnerHTML={{ __html: item.html }} />
          </details>
        ))}
      </div>
    </section>
  );
}

export function Home({
  studies,
  plans,
  faq,
  articles,
}: {
  studies: readonly CaseStudy[];
  plans: readonly Plan[];
  faq: readonly FaqItem[];
  articles: readonly Article[];
}): ReactElement {
  return (
    <main>
      <JsonLd data={homeGraph(plans, faq)} />
      <Hero />
      <WhatItCanDo />
      <HowItWorks />
      <Pricing plans={plans} />
      <WhoFor />
      <Work studies={studies} />
      <LatestArticles articles={articles} />
      <Faq faq={faq} />
    </main>
  );
}

export function makeHome(
  studies: readonly CaseStudy[],
  plans: readonly Plan[],
  faq: readonly FaqItem[],
  articles: readonly Article[],
): () => ReactElement {
  return function BoundHome(): ReactElement {
    return <Home articles={articles} faq={faq} plans={plans} studies={studies} />;
  };
}
