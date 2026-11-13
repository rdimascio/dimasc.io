import type { ReactElement, ReactNode } from "react";

import { ABOUT_ROUTE, CONTACT_EMAIL, GITHUB_URL, introCallHref, introCallLabel, SITE_NAME, SITE_NAME_PROPER } from "../site";
import { ARTICLES_ROUTE } from "../content";
import { WORK_ROUTE } from "../work";
import { PixelWordmark } from "./pixel-wordmark";
import { Signature } from "./signature";

export const WIDTH = "max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-10";
export { ABOUT_ROUTE };

export function Eyebrow({ children }: { children: ReactNode }): ReactElement {
  return (
    <p className="m-0 font-mono text-[0.72rem] tracking-[0.04em] text-muted flex items-center gap-2">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-bright" aria-hidden="true" />
      {children}
    </p>
  );
}

export function SectionHead({
  index,
  label,
  title,
  aside,
}: {
  index?: string;
  label: string;
  title?: ReactNode;
  aside?: ReactNode;
}): ReactElement {
  return (
    <div className="grid gap-6 md:grid-cols-12 border-t border-ink pt-5 mb-12 sm:mb-16">
      <div className="md:col-span-4 flex items-start gap-4">
        {index === undefined ? null : <span className="font-mono text-[0.72rem] text-muted pt-[1px]">{index}</span>}
        <Eyebrow>{label}</Eyebrow>
      </div>
      {title === undefined ? null : (
        <h2 className="md:col-span-6 m-0 text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.02] tracking-[-0.035em] font-medium [text-wrap:balance]">
          {title}
        </h2>
      )}
      {aside === undefined ? null : <div className="md:col-span-2 md:justify-self-end text-muted text-[0.9rem]">{aside}</div>}
    </div>
  );
}

export function ArrowLink({ href, children, tone = "ink" }: { href: string; children: ReactNode; tone?: "ink" | "accent" | "ghost" }): ReactElement {
  const tones = {
    ink: "bg-ink text-bg hover:bg-ink-2",
    accent: "bg-accent text-on-accent hover:opacity-90",
    ghost: "border border-line text-ink hover:border-ink",
  } as const;
  return (
    <a
      className={`group inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 font-medium transition-colors ${tones[tone]}`}
      href={href}
    >
      {children}
      <span
        className="grid place-items-center w-9 h-9 rounded-full bg-[color-mix(in_srgb,currentColor_14%,transparent)] transition-transform duration-500 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        →
      </span>
    </a>
  );
}

function ContactBand(): ReactElement {
  return (
    <section className="night" aria-labelledby="contact-title">
      <div className={`${WIDTH} pt-24 sm:pt-32 pb-16`}>
        <Eyebrow>not sure yet?</Eyebrow>
        <h2
          className="reveal mt-8 mb-0 text-[clamp(2.6rem,8vw,7.4rem)] leading-[0.92] tracking-[-0.055em] font-medium max-w-[14ch]"
          id="contact-title"
        >
          free 15-min call. <span className="serif text-accent">one clear</span> next step.
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-12 items-end">
          <p className="md:col-span-5 m-0 text-muted text-[1.1rem] leading-relaxed max-w-[28rem]">
            tell me what's broken or slowing you down. i'll tell you if monthly help or one project makes more sense, or if you need me at all.
          </p>
          <div className="md:col-span-7 flex flex-wrap gap-3 md:justify-end">
            <ArrowLink href={introCallHref()} tone="accent">
              {introCallLabel()}
            </ArrowLink>
            <a className="inline-flex items-center rounded-full border border-line px-6 py-3 font-medium hover:border-ink" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export interface NavSections {
  readonly work: boolean;
  readonly articles: boolean;
}

type NavSection = keyof NavSections | "always";

const NAV: readonly { label: string; href: string; section: NavSection; hideNarrow: boolean }[] = [
  { label: "past work", href: WORK_ROUTE, section: "work", hideNarrow: true },
  { label: "articles", href: ARTICLES_ROUTE, section: "articles", hideNarrow: true },
  { label: "how it works", href: "/#how-it-works", section: "always", hideNarrow: true },
  { label: "about", href: ABOUT_ROUTE, section: "always", hideNarrow: false },
];

function visibleNav(sections: NavSections): typeof NAV {
  return NAV.filter((item) => item.section === "always" || sections[item.section]);
}

function Footer({ sections }: { sections: NavSections }): ReactElement {
  const links = [
    ...visibleNav(sections).map((item) => ({ label: item.label, href: item.href })),
    { label: "prices", href: "/#pricing" },
    { label: "one-project jobs", href: "/process" },
    { label: "github", href: GITHUB_URL },
    { label: "email", href: `mailto:${CONTACT_EMAIL}` },
  ];
  return (
    <footer className="night">
      <div className={`${WIDTH} pt-10`}>
        <div className="border-t border-line pt-8 grid gap-8 md:grid-cols-12">
          <p className="md:col-span-5 m-0 text-muted max-w-[22rem]">website help for small businesses. built + tested by me.</p>
          <ul className="md:col-span-7 m-0 p-0 list-none flex flex-wrap gap-x-8 gap-y-1 md:justify-end">
            {links.map((link) => (
              <li key={link.label}>
                <a className="link-underline inline-block py-2 text-ink" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-14 sm:mt-20">
        <PixelWordmark label={SITE_NAME_PROPER} word="dimascio." />
      </div>
      <div className={`${WIDTH} pt-6 pb-8`}>
        <div className="flex flex-wrap justify-between gap-3 text-[0.82rem] text-muted font-mono tracking-[0.06em]">
          <span>© {SITE_NAME}</span>
          <span>dimasc.io</span>
        </div>
      </div>
    </footer>
  );
}

export function makeSiteLayout(sections: NavSections): (props: { children: ReactNode }) => ReactElement {
  return function BoundSiteLayout({ children }: { children: ReactNode }): ReactElement {
    return <SiteLayout sections={sections}>{children}</SiteLayout>;
  };
}

function SiteLayout({ children, sections }: { children: ReactNode; sections: NavSections }): ReactElement {
  return (
    <>
      <a className="skip-link" href="#main">
        skip to content
      </a>
      <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl border-b border-[color-mix(in_srgb,var(--line)_70%,transparent)]">
        <div className={`${WIDTH} flex items-center gap-4 h-16`}>
          <a className="group -my-1 py-1 text-ink" href="/">
            <Signature className="w-[96px] sm:w-[118px] transition-transform duration-500 group-hover:-rotate-2" />
          </a>
          <span className="flex-1" />
          <nav aria-label="Main" className="flex items-center gap-5 sm:gap-8 text-[0.92rem] whitespace-nowrap">
            {visibleNav(sections).map((item) => (
              <a className={`link-underline inline-block py-3 text-muted hover:text-ink ${item.hideNarrow ? "max-[520px]:hidden" : ""}`} href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
            <a className="rounded-full bg-ink text-bg px-4 py-2 font-medium hover:bg-accent hover:text-on-accent transition-colors" href="/#pricing">
              prices
            </a>
          </nav>
        </div>
      </header>
      <div id="main">{children}</div>
      <ContactBand />
      <Footer sections={sections} />
    </>
  );
}

export const PAGE = `${WIDTH} pt-16 sm:pt-24`;
export const HEADING =
  "m-0 text-[clamp(2.8rem,8vw,7rem)] leading-[0.92] tracking-[-0.055em] font-medium max-w-[14ch] [text-wrap:balance]";
export const LEDE = "m-0 text-muted text-[clamp(1.1rem,1.6vw,1.3rem)] leading-relaxed max-w-[38rem]";
