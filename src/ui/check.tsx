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
  AI_NAME,
  AI_ROUTE,
  CONTACT_EMAIL,
  INTRO_CALL_CTA,
  INTRO_CALL_MINUTES,
  INTRO_CALL_NAME,
  INTRO_CALL_ROUTE,
  PRIVACY_ROUTE,
  SERVICE_AREA_COPY,
} from "../site";
import { INTRO_CALL_LINE } from "../offer";
import { breadcrumbLd, introCallOfferLd, pageGraph } from "../structured-data";
import { JsonLd } from "./json-ld";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE } from "./layout";
import { LadderList, NumberedSteps, PageSection, WideSection } from "./offer";

export const CHECK_FORM_ANCHOR = "check";
export const CHECK_FORM_TITLE = "tell me about your business";
export const CHECK_SUBMIT_LABEL = "send it";
export const INTRO_CALL_HEADLINE = "let's talk for 15 minutes.";
export const INTRO_CALL_STEPS = [
  { title: "you send this form", body: "your business, the best number to reach you + what eats your week." },
  { title: "i reply", body: "within 1 business day, monday to friday, to pick a time." },
  { title: `we talk for ${INTRO_CALL_MINUTES} min`, body: "how the business runs + where the busywork is. i tell you straight if ai can help." },
  { title: "if it fits", body: "the next step is an ai plan. if it doesn't, that's the end of it." },
] as const;
export const NO_PRESSURE_LINE = "it's free, + you don't have to sign up for anything.";
export const CHECK_SENT_HEADLINE = "got it. i'll reply within 1 business day, monday to friday, to set up your free 15-min call.";
export const CHECK_NEXT_STEPS = [
  "i read your note + look up your business",
  "i reply within 1 business day to pick a time",
  "we talk for 15 min about where the busywork is",
  "if ai can save you real time, i tell you what an ai plan would cover",
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

function StepList({ steps }: { steps: readonly string[] }): ReactElement {
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
      <Eyebrow>{INTRO_CALL_CTA}</Eyebrow>
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

function IntroCallPage({ plans }: { plans: readonly Plan[] }): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(introCallOfferLd(), breadcrumbLd([{ name: INTRO_CALL_NAME, route: INTRO_CALL_ROUTE }]))} />
      <Eyebrow>{`${INTRO_CALL_NAME} · ${SERVICE_AREA_COPY}`}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>{INTRO_CALL_HEADLINE}</h1>
      <p className={`${LEDE} mt-8`}>{INTRO_CALL_LINE}</p>
      <p className="mt-4 mb-0 text-muted max-w-[38rem]">{NO_PRESSURE_LINE}</p>
      <CheckForm />

      <WideSection label="how the call works">
        <NumberedSteps steps={INTRO_CALL_STEPS} />
      </WideSection>

      <PageSection label="what comes after">
        <div className="grid gap-4">
          <LadderList plans={plans} />
          <a className="link-underline inline-block py-2 text-ink" href={AI_ROUTE}>
            {`more about ${AI_NAME}`}
          </a>
        </div>
      </PageSection>
    </main>
  );
}

export function makeIntroCall(plans: readonly Plan[]): () => ReactElement {
  return function BoundIntroCall(): ReactElement {
    return <IntroCallPage plans={plans} />;
  };
}

function CheckSent(): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <Eyebrow>{INTRO_CALL_NAME}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>got it.</h1>
      <p className={`${LEDE} mt-8`}>{CHECK_SENT_HEADLINE}</p>
      <section className="mt-16 max-w-[44rem]" aria-labelledby="next-title">
        <h2 className="m-0 text-[1.3rem] font-medium" id="next-title">
          what happens next
        </h2>
        <StepList steps={CHECK_NEXT_STEPS} />
      </section>
      <div className="mt-10 grid gap-4">
        <p className="m-0 text-muted">
          didn't hear back? email me at{" "}
          <a className="link-underline text-ink" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <div>
          <ArrowLink href={AI_ROUTE} tone="ghost">
            {`more about ${AI_NAME}`}
          </ArrowLink>
        </div>
      </div>
    </main>
  );
}

export function makeCheckSent(): () => ReactElement {
  return CheckSent;
}
