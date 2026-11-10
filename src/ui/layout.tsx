import type { ReactElement, ReactNode } from "react";

import { CONTACT_EMAIL, SITE_NAME } from "../site";

export const WIDTH = "max-w-[1200px] mx-auto px-5 sm:px-8";

export function Eyebrow({ children }: { children: ReactNode }): ReactElement {
  return (
    <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted flex items-center gap-2">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </p>
  );
}

export function SectionHead({ label, title }: { label: string; title?: string }): ReactElement {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] border-t border-ink pt-5 mb-10">
      <Eyebrow>{label}</Eyebrow>
      {title === undefined ? null : (
        <h2 className="m-0 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.1] tracking-[-0.03em] font-medium max-w-[22ch]">
          {title}
        </h2>
      )}
    </div>
  );
}

export function ContactBand(): ReactElement {
  return (
    <section className="bg-ink text-bg mt-28">
      <div className={`${WIDTH} py-20 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-end`}>
        <div>
          <p className="m-0 mb-5 font-mono text-[0.72rem] uppercase tracking-[0.12em] opacity-60">Start a project</p>
          <h2 className="m-0 text-[clamp(2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.04em] font-medium max-w-[16ch]">
            Tell me what's slowing you down.
          </h2>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <p className="m-0 opacity-70 md:text-right max-w-[22rem]">
            A short note is enough. I reply with the questions I need answered and a time to talk.
          </p>
          <a
            className="inline-flex items-center gap-2 rounded-full bg-bg text-ink px-6 py-3 font-medium hover:opacity-90"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function SiteLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <>
      <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-md border-b border-line">
        <div className={`${WIDTH} flex items-center gap-6 h-16`}>
          <a className="font-medium tracking-[-0.02em] text-ink" href="/">
            {SITE_NAME}
          </a>
          <span className="flex-1" />
          <nav className="flex items-center gap-5 sm:gap-7 text-[0.92rem]">
            <a className="text-muted hover:text-ink" href="/work">
              Work
            </a>
            <a className="text-muted hover:text-ink" href="/process">
              Process
            </a>
            <a
              className="rounded-full bg-ink text-bg px-4 py-2 font-medium hover:opacity-90 max-sm:hidden"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              Start a project
            </a>
          </nav>
        </div>
      </header>
      {children}
      <ContactBand />
      <footer className="bg-ink text-bg">
        <div className={`${WIDTH} py-8 border-t border-[color-mix(in_srgb,var(--bg)_18%,transparent)] flex flex-wrap justify-between gap-3 text-[0.85rem] opacity-60`}>
          <span>© {SITE_NAME}</span>
          <span>Software, web and AI builds for small businesses</span>
        </div>
      </footer>
    </>
  );
}

export const PAGE = `${WIDTH} pt-16 sm:pt-24`;
export const HEADING = "m-0 text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.98] tracking-[-0.045em] font-medium max-w-[14ch]";
export const LEDE = "m-0 text-muted text-[1.15rem] leading-relaxed max-w-[36rem]";
