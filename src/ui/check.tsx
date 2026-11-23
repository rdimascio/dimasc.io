import type { ReactElement } from "react";

import type { Plan } from "../content";
import {
  CHECK_FIELD,
  CHECK_INPUT_CLASS,
  CHECK_LABEL,
  CHECK_LABEL_CLASS,
  CHECK_LIMIT,
  CHECK_PRIVACY_LINE,
  CHECK_PRIVACY_LINK,
  CHECK_ROUTE,
  CLICK_ID_PARAMS,
  TURNSTILE_ACTION,
  TURNSTILE_APPEARANCE,
  TURNSTILE_SCRIPT_SRC,
  TURNSTILE_SITEKEY,
} from "../check";
import {
  CONTACT_EMAIL,
  FREE_CHECK_ROUTE,
  FRONT_DESK_CHECK_CTA,
  FRONT_DESK_CHECK_MINUTES,
  FRONT_DESK_CHECK_NAME,
  FRONT_DESK_NAME,
  FRONT_DESK_ROUTE,
  PRIVACY_ROUTE,
  SERVICE_AREA_COPY,
} from "../site";
import { breadcrumbLd, frontDeskCheckOfferLd, pageGraph } from "../structured-data";
import { CHECK_LINE, frontDeskPriceLine } from "./home";
import { JsonLd } from "./json-ld";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE, SectionHead } from "./layout";

export const CHECK_FORM_ANCHOR = "check";
export const CHECK_FORM_TITLE = "tell me about your business";
export const CHECK_SUBMIT_LABEL = "send it";
export const FREE_CHECK_HEADLINE = "see the calls you're missing.";
export const FREE_CHECK_STEPS = [
  "you send me your business name, the number customers call + how people book w/ you",
  "i call your business after hours, like a customer would",
  "i count the google reviews nobody answered",
  `we talk for ${FRONT_DESK_CHECK_MINUTES} min + i show you what that gap costs in dollars`,
] as const;
export const FREE_CHECK_NO_PRESSURE = "it's free, + you don't have to sign up for anything.";
export const CHECK_SENT_HEADLINE = "got it. i'll reply within 1 business day, monday to friday, to set up your free check.";
export const CHECK_NEXT_STEPS = [
  "i read your note + look up your google profile",
  "i call your business after hours, like a customer would",
  "i count the google reviews nobody answered",
  `we talk for ${FRONT_DESK_CHECK_MINUTES} min + i show you the gap in dollars`,
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

function NumberedSteps({ steps }: { steps: readonly string[] }): ReactElement {
  return (
    <ol className="mt-6 m-0 p-0 list-none border-b border-line">
      {steps.map((step, index) => (
        <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border-t border-line py-4 text-[1.1rem] leading-snug" key={step}>
          <span className="font-mono text-[0.85rem] text-accent pt-1">{String(index + 1).padStart(2, "0")}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function CheckForm(): ReactElement {
  return (
    <section className="mt-16 sm:mt-20 max-w-[40rem] scroll-mt-24" id={CHECK_FORM_ANCHOR} aria-labelledby="check-title">
      <Eyebrow>{FRONT_DESK_CHECK_CTA}</Eyebrow>
      <h2 className="mt-6 mb-0 text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.02] tracking-[-0.035em] font-medium" id="check-title">
        {CHECK_FORM_TITLE}
      </h2>
      <form className="mt-8 grid gap-5" action={CHECK_ROUTE} method="post">
        <label className={CHECK_LABEL_CLASS}>
          {CHECK_LABEL.name}
          <input className={CHECK_INPUT_CLASS} autoComplete="name" maxLength={CHECK_LIMIT.name} name={CHECK_FIELD.name} required type="text" />
        </label>
        <label className={CHECK_LABEL_CLASS}>
          {CHECK_LABEL.business}
          <input
            className={CHECK_INPUT_CLASS}
            autoComplete="organization"
            maxLength={CHECK_LIMIT.business}
            name={CHECK_FIELD.business}
            required
            type="text"
          />
        </label>
        <label className={CHECK_LABEL_CLASS}>
          {CHECK_LABEL.phone}
          <input
            className={CHECK_INPUT_CLASS}
            autoComplete="tel"
            inputMode="tel"
            maxLength={CHECK_LIMIT.phone}
            name={CHECK_FIELD.phone}
            required
            type="tel"
          />
        </label>
        <label className={CHECK_LABEL_CLASS}>
          {CHECK_LABEL.email}
          <input className={CHECK_INPUT_CLASS} autoComplete="email" maxLength={CHECK_LIMIT.email} name={CHECK_FIELD.email} required type="email" />
        </label>
        <label className={CHECK_LABEL_CLASS}>
          <span>
            {CHECK_LABEL.website} <span className={HINT}>{CHECK_LABEL.optional}</span>
          </span>
          <input
            className={CHECK_INPUT_CLASS}
            autoComplete="url"
            inputMode="url"
            maxLength={CHECK_LIMIT.website}
            name={CHECK_FIELD.website}
            placeholder="google maps link or yourbusiness.com"
            type="text"
          />
        </label>
        <label className={CHECK_LABEL_CLASS}>
          {CHECK_LABEL.message}
          <textarea className={`${CHECK_INPUT_CLASS} min-h-[6rem]`} maxLength={CHECK_LIMIT.message} name={CHECK_FIELD.message} required rows={3} />
        </label>
        <input defaultValue="" name={CHECK_FIELD.source} type="hidden" />
        {CLICK_ID_PARAMS.map((name) => (
          <input defaultValue="" key={name} name={CHECK_FIELD[name]} type="hidden" />
        ))}
        <input defaultValue="" name={CHECK_FIELD.clickedAt} type="hidden" />
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
        <p className="m-0 text-muted text-[0.92rem]">
          {CHECK_PRIVACY_LINE}{" "}
          <a className="link-underline text-ink" href={PRIVACY_ROUTE}>
            {CHECK_PRIVACY_LINK}
          </a>
        </p>
      </form>
    </section>
  );
}

function FreeCheckPage({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(frontDeskCheckOfferLd(), breadcrumbLd([{ name: FRONT_DESK_CHECK_NAME, route: FREE_CHECK_ROUTE }]))} />
      <Eyebrow>{`${FRONT_DESK_CHECK_NAME} · ${SERVICE_AREA_COPY}`}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{FREE_CHECK_HEADLINE}</h1>
      <p className={`${LEDE} mt-8`}>{CHECK_LINE}</p>
      <p className="mt-4 mb-0 text-muted max-w-[38rem]">{FREE_CHECK_NO_PRESSURE}</p>
      <CheckForm />

      <section className="mt-20 sm:mt-28">
        <SectionHead label="how the check works" />
        <div className="md:ml-[calc(33.333%+0.5rem)] max-w-[44rem]">
          <NumberedSteps steps={FREE_CHECK_STEPS} />
        </div>
      </section>

      <section className="mt-20 sm:mt-28">
        <SectionHead label="if you want it fixed" />
        <div className="md:ml-[calc(33.333%+0.5rem)] max-w-[44rem] grid gap-4">
          <p className="m-0 text-[1.1rem]">{`${FRONT_DESK_NAME}: ${frontDeskPriceLine(plans)}`}</p>
          <a className="link-underline inline-block py-2 text-ink" href={FRONT_DESK_ROUTE}>
            {`more about the ${FRONT_DESK_NAME}`}
          </a>
        </div>
      </section>
    </main>
  );
}

export function makeFreeCheck(plans: readonly Plan[]): () => ReactElement {
  return function BoundFreeCheck(): ReactElement {
    return <FreeCheckPage plans={plans} />;
  };
}

function CheckSent(): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <Eyebrow>{FRONT_DESK_CHECK_NAME}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>got it.</h1>
      <p className={`${LEDE} mt-8`}>{CHECK_SENT_HEADLINE}</p>
      <section className="mt-16 max-w-[44rem]" aria-labelledby="next-title">
        <h2 className="m-0 text-[1.3rem] font-medium" id="next-title">
          what happens next
        </h2>
        <NumberedSteps steps={CHECK_NEXT_STEPS} />
      </section>
      <div className="mt-10 grid gap-4">
        <p className="m-0 text-muted">
          didn't hear back? email me at{" "}
          <a className="link-underline text-ink" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <div>
          <ArrowLink href={FRONT_DESK_ROUTE} tone="ghost">
            {`more about the ${FRONT_DESK_NAME}`}
          </ArrowLink>
        </div>
      </div>
    </main>
  );
}

export function makeCheckSent(): () => ReactElement {
  return CheckSent;
}
