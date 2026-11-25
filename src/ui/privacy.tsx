import type { ReactElement, ReactNode } from "react";

import { CONTACT_EMAIL, PRIVACY_ROUTE } from "../site";
import { breadcrumbLd, pageGraph } from "../structured-data";
import { JsonLd } from "./json-ld";
import { Eyebrow, HEADING, LEDE, PAGE } from "./layout";

export const PRIVACY_TITLE = "privacy";
export const PRIVACY_LEDE = "short version: i keep what you send me through the site check form, and not much else.";
export const PRIVACY_DESCRIPTION = "what the site check form collects, where it goes, how google ad clicks are measured + how to get your info deleted.";

export const NO_SCRIPTS_LINE = "no analytics scripts, no ad tracking scripts + no ad cookies. the site doesn't set any cookies of its own.";
export const SERVER_COUNTING_LINE = "i count page views, form use + the two link clicks on the agents page (kit + teardown) on the server, with no cookies + no personal data.";

interface PrivacySection {
  readonly title: string;
  readonly body: ReactNode;
}

const EMAIL_LINK = (
  <a className="link-underline text-ink" href={`mailto:${CONTACT_EMAIL}`}>
    {CONTACT_EMAIL}
  </a>
);

export const PRIVACY_SECTIONS: readonly PrivacySection[] = [
  {
    title: "what the form collects",
    body: (
      <>
        your name, your email, your website if you add it + your note. i also keep which page you sent it from, any utm tags in the link you came in on, and the
        time you sent it.
      </>
    ),
  },
  {
    title: "where it goes",
    body: <>it's stored on cloudflare, which runs this site, and emailed to me. i use it to reply to you + do your site check. i don't sell it.</>,
  },
  {
    title: "google ads",
    body: (
      <>
        if you got here by clicking one of my google ads, google adds a click id to the link. i keep that id + roughly when you clicked. i may report it back to
        google ads so i can see which ads lead to real requests. i don't send your name, email or note to google.
      </>
    ),
  },
  {
    title: "no tracking scripts",
    body: (
      <>
        {NO_SCRIPTS_LINE} {SERVER_COUNTING_LINE}
      </>
    ),
  },
  {
    title: "bot checks",
    body: (
      <>
        the form uses cloudflare turnstile to check you're a person and not a bot. it's the only script on the site, and it only loads on the form page.
      </>
    ),
  },
  {
    title: "getting it deleted",
    body: <>want to see what i have, or want it deleted? email me at {EMAIL_LINK} and i'll take care of it.</>,
  },
];

function PrivacyPage(): ReactElement {
  return (
    <main className={PAGE}>
      <JsonLd data={pageGraph(breadcrumbLd([{ name: PRIVACY_TITLE, route: PRIVACY_ROUTE }]))} />
      <Eyebrow>{PRIVACY_TITLE}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{PRIVACY_TITLE}</h1>
      <p className={`${LEDE} mt-8`}>{PRIVACY_LEDE}</p>
      <dl className="mt-16 m-0 max-w-[44rem] border-b border-line">
        {PRIVACY_SECTIONS.map((section) => (
          <div className="grid gap-2 md:gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] border-t border-line py-6" key={section.title}>
            <dt className="m-0 text-[1.1rem] font-medium">{section.title}</dt>
            <dd className="m-0 text-muted leading-relaxed">{section.body}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}

export function makePrivacy(): () => ReactElement {
  return PrivacyPage;
}
