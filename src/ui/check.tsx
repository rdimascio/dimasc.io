import type { ReactElement } from "react";

import { CHECK_FIELD, CHECK_INPUT_CLASS, CHECK_LABEL_CLASS, CHECK_LIMIT, CHECK_ROUTE, TURNSTILE_ACTION, TURNSTILE_APPEARANCE, TURNSTILE_SCRIPT_SRC, TURNSTILE_SITEKEY } from "../check";
import { CONTACT_EMAIL, QUICK_FIX_MINUTES, SITE_CHECK_ANCHOR, SITE_CHECK_CTA } from "../site";
import { WORK_ROUTE } from "../work";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE } from "./layout";

export const CHECK_FORM_TITLE = "send me your site";
export const CHECK_SUBMIT_LABEL = "send it";
export const CHECK_SENT_HEADLINE = "got it. i'll look at your site + reply within 1 business day, monday to friday.";
export const CHECK_NEXT_STEPS = [
  "i read your note + look through your site myself",
  "i reply within 1 business day, monday to friday, w/ a plain list of what's broken",
  `fixes under ${QUICK_FIX_MINUTES} min: i just do them, free`,
  "bigger fixes: you see the price before i start. no hourly bills",
] as const;
export const CHECK_EMAIL_FALLBACK = "rather email? write me at";

const HINT = "font-normal text-muted";

function EmailFallback(): ReactElement {
  return (
    <p className="m-0 text-muted">
      {CHECK_EMAIL_FALLBACK}{" "}
      <a className="link-underline text-ink" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>
    </p>
  );
}

export function CheckForm(): ReactElement {
  return (
    <section className="mt-16 sm:mt-20 max-w-[40rem] scroll-mt-24" id={SITE_CHECK_ANCHOR} aria-labelledby="check-title">
      <Eyebrow>{SITE_CHECK_CTA}</Eyebrow>
      <h2 className="mt-6 mb-0 text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.02] tracking-[-0.035em] font-medium" id="check-title">
        {CHECK_FORM_TITLE}
      </h2>
      <form className="mt-8 grid gap-5" action={CHECK_ROUTE} method="post">
        <label className={CHECK_LABEL_CLASS}>
          your name
          <input className={CHECK_INPUT_CLASS} autoComplete="name" maxLength={CHECK_LIMIT.name} name={CHECK_FIELD.name} required type="text" />
        </label>
        <label className={CHECK_LABEL_CLASS}>
          your email
          <input className={CHECK_INPUT_CLASS} autoComplete="email" maxLength={CHECK_LIMIT.email} name={CHECK_FIELD.email} required type="email" />
        </label>
        <label className={CHECK_LABEL_CLASS}>
          <span>
            your website <span className={HINT}>(optional)</span>
          </span>
          <input
            className={CHECK_INPUT_CLASS}
            autoComplete="url"
            inputMode="url"
            maxLength={CHECK_LIMIT.website}
            name={CHECK_FIELD.website}
            placeholder="yourbusiness.com"
            type="text"
          />
        </label>
        <label className={CHECK_LABEL_CLASS}>
          what's broken or bugging you
          <textarea className={`${CHECK_INPUT_CLASS} min-h-[9rem]`} maxLength={CHECK_LIMIT.message} name={CHECK_FIELD.message} required rows={5} />
        </label>
        <input defaultValue="" name={CHECK_FIELD.source} type="hidden" />
        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label>
            leave this empty
            <input autoComplete="off" name={CHECK_FIELD.trap} tabIndex={-1} type="text" />
          </label>
        </div>
        <script async defer src={TURNSTILE_SCRIPT_SRC} />
        <div className="cf-turnstile" data-action={TURNSTILE_ACTION} data-appearance={TURNSTILE_APPEARANCE} data-sitekey={TURNSTILE_SITEKEY} />
        <div className="flex flex-wrap items-center gap-4">
          <button className="rounded-full bg-accent px-7 py-3 font-medium text-on-accent hover:opacity-90" type="submit">
            {CHECK_SUBMIT_LABEL}
          </button>
        </div>
        <EmailFallback />
      </form>
    </section>
  );
}

function CheckSent(): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <Eyebrow>{SITE_CHECK_CTA}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>got it.</h1>
      <p className={`${LEDE} mt-8`}>{CHECK_SENT_HEADLINE}</p>
      <section className="mt-16 max-w-[44rem]" aria-labelledby="next-title">
        <h2 className="m-0 text-[1.3rem] font-medium" id="next-title">
          what happens next
        </h2>
        <ol className="mt-6 m-0 p-0 list-none border-b border-line">
          {CHECK_NEXT_STEPS.map((step, index) => (
            <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border-t border-line py-4 text-[1.1rem] leading-snug" key={step}>
              <span className="font-mono text-[0.85rem] text-accent pt-1">{String(index + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="mt-10 grid gap-4">
        <p className="m-0 text-muted">
          didn't hear back? email me at{" "}
          <a className="link-underline text-ink" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <div>
          <ArrowLink href={WORK_ROUTE} tone="ghost">
            see past work
          </ArrowLink>
        </div>
      </div>
    </main>
  );
}

export function makeCheckSent(): () => ReactElement {
  return CheckSent;
}
