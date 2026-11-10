import type { ReactElement, ReactNode } from "react";

import { CONTACT_EMAIL, SITE_NAME } from "../site";

const WIDTH = "max-w-[1040px] mx-auto px-6";

export function Brand(): ReactElement {
  return (
    <a className="text-[1rem] font-semibold tracking-[-0.02em] text-ink" href="/">
      {SITE_NAME}
    </a>
  );
}

export function SiteLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <>
      <header className="border-b border-line">
        <div className={`${WIDTH} flex items-center gap-6 h-16`}>
          <Brand />
          <span className="flex-1" />
          <nav className="flex items-center gap-6 text-[0.92rem] [&>a]:text-muted [&>a:hover]:text-ink">
            <a href="/work">Work</a>
            <a href="/process">Process</a>
            <a className="!text-ink font-medium" href={`mailto:${CONTACT_EMAIL}`}>
              Start a project
            </a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-line mt-24">
        <div className={`${WIDTH} py-10 flex flex-wrap justify-between gap-3 text-faint text-[0.85rem]`}>
          <span>{SITE_NAME} · Software, web and AI builds for small businesses</span>
          <a className="hover:text-ink" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </footer>
    </>
  );
}

export const SHELL = "max-w-[44rem] mx-auto px-6 pt-16 pb-8 min-w-0";
export const HEADING = "text-[clamp(2rem,4vw,2.7rem)] leading-[1.1] tracking-[-0.03em] font-semibold mb-3";
export const LEDE = "text-muted text-[1.12rem] leading-relaxed mb-10";
