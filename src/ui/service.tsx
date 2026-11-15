import type { ReactElement } from "react";

import type { Plan } from "../content";
import {
  CONTACT_EMAIL,
  QUICK_FIX_MINUTES,
  SERVICE_AREA_COPY,
  SERVICE_AREA_SHORT,
  SITE_CHECK_CTA,
  SITE_CHECK_NAME,
  SITE_CHECK_PAGE,
  siteCheckHref,
} from "../site";
import {
  type ComparisonRow,
  ORANGE_COUNTY_ROUTE,
  serviceBySlug,
  serviceRoute,
  SERVICES,
  SERVICES_ROUTE,
  type Service,
  type ServiceFaq,
  type StayOrMove,
} from "../services";
import { CheckForm } from "./check";
import { breadcrumbLd, businessLd, faqPageLd, pageGraph, serviceLd } from "../structured-data";
import { WORK_ROUTE } from "../work";
import { formatPrice, PlanCard, planCtaHref, startingPricesLine } from "./home";
import { JsonLd } from "./json-ld";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE, SectionHead } from "./layout";

export const SERVICES_CRUMB = { name: "services", route: SERVICES_ROUTE } as const;
export const ORANGE_COUNTY_CRUMB = { name: SERVICE_AREA_SHORT, route: ORANGE_COUNTY_ROUTE } as const;
export const PAST_WORK_LINE =
  "i was tech lead on holt international's site + the mls home search behind serhant.com, which ran every luxury presence customer's listing search. i was a front-end engineer on blackstone + stanford ecorner. your site gets the same engineer.";
export const AREA_LINE = `i'm a senior software engineer based in ${SERVICE_AREA_COPY}. i fix + look after websites for small businesses here + nearby, like in tustin + corona. happy to meet in person around oc. anywhere else in the us works too, over email + video.`;
export const SERVICES_LEDE =
  "website help from a senior software engineer, not an agency: a free site check, a new site, booking, a store, or me keeping an eye on it all.";
export const WHY_ME_LINE =
  "a lot of local web help is an agency selling seo, or someone who updates plugins. i'm neither. i've been a software engineer since 2017. i built + scaled the platform behind 30k+ websites, and was tech lead on the mls home search behind serhant.com. now i do it for businesses down the street.";
export const DEFAULT_STEPS_LABEL = "how it works";
export const PROJECT_PRICE_COPY = "quoted up front, paid step by step";
export const STAY_LABEL = "stay on your platform if";
export const MOVE_LABEL = "think about moving if";

function planPriceCopy(plan: Plan): string {
  if (plan.price === null) return `${plan.name}: ${PROJECT_PRICE_COPY}`;
  return `${plan.name} ${formatPrice(plan.price)}/${plan.per}`;
}

export function servicePriceLine(plans: readonly Plan[]): string {
  const free = [SITE_CHECK_NAME, `fixes under ${QUICK_FIX_MINUTES} min free`];
  return [...free, ...plans.map(planPriceCopy)].join(" · ");
}

export function findPlan(plans: readonly Plan[], name: string): Plan | undefined {
  return plans.find((plan) => plan.name === name);
}

function MoreLink({ href, children }: { href: string; children: string }): ReactElement {
  return (
    <a className="link-underline inline-block py-2 text-ink" href={href}>
      {children}
    </a>
  );
}

function List({ items }: { items: readonly string[] }): ReactElement {
  return (
    <ul className="m-0 p-0 list-none border-b border-line">
      {items.map((item) => (
        <li className="flex gap-3 border-t border-line py-4 text-[1.1rem] leading-snug" key={item}>
          <span className="text-accent" aria-hidden="true">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Steps({ steps }: { steps: readonly string[] }): ReactElement {
  return (
    <ol className="m-0 p-0 list-none border-b border-line">
      {steps.map((step, index) => (
        <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border-t border-line py-4 text-[1.1rem] leading-snug" key={step}>
          <span className="font-mono text-[0.85rem] text-accent pt-1">{String(index + 1).padStart(2, "0")}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function Questions({ faq }: { faq: readonly ServiceFaq[] }): ReactElement {
  return (
    <div className="border-b border-line">
      {faq.map((item) => (
        <details className="group border-t border-line py-6" key={item.question}>
          <summary className="flex justify-between gap-6 cursor-pointer list-none text-[clamp(1.1rem,1.6vw,1.3rem)] tracking-[-0.015em] font-medium rounded-md [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              className="grid place-items-center shrink-0 w-8 h-8 rounded-full border border-line text-muted transition-transform duration-300 group-open:rotate-45"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <p className="mt-4 mb-0 max-w-[40rem] text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function StayOrMoveLists({ advice }: { advice: StayOrMove }): ReactElement {
  return (
    <div className="grid gap-8">
      <div>
        <h3 className="m-0 mb-3 text-[1.1rem] font-medium">{STAY_LABEL}</h3>
        <List items={advice.stay} />
      </div>
      <div>
        <h3 className="m-0 mb-3 text-[1.1rem] font-medium">{MOVE_LABEL}</h3>
        <List items={advice.move} />
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactElement }): ReactElement {
  return (
    <section className="mt-20 sm:mt-28">
      <SectionHead label={label} />
      <div className="md:ml-[calc(33.333%+0.5rem)] max-w-[44rem]">{children}</div>
    </section>
  );
}

function Comparison({ rows }: { rows: readonly ComparisonRow[] }): ReactElement {
  return (
    <table className="w-full border-collapse text-left text-[1rem] leading-snug">
      <thead>
        <tr className="border-b border-line">
          <th className="py-3 pr-4 font-medium" scope="col">
            <span className="sr-only">topic</span>
          </th>
          <th className="py-3 pr-4 font-medium text-muted" scope="col">
            a plugin-update plan
          </th>
          <th className="py-3 font-medium" scope="col">
            care from me
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr className="border-b border-line align-top" key={row.topic}>
            <th className="py-4 pr-4 font-medium" scope="row">
              {row.topic}
            </th>
            <td className="py-4 pr-4 text-muted">{row.typical}</td>
            <td className="py-4">{row.mine}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrimaryCta({ plan }: { plan: Plan | undefined }): ReactElement {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <ArrowLink href={plan === undefined ? siteCheckHref() : planCtaHref(plan)} tone="accent">
        {plan === undefined ? SITE_CHECK_CTA : plan.cta}
      </ArrowLink>
      <a className="link-underline inline-block py-2 text-muted hover:text-ink" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}

function RelatedLinks({ service }: { service: Service }): ReactElement {
  const links = [
    ...service.related.map((slug) => ({ href: serviceRoute(slug), label: serviceBySlug(slug).name })),
    { href: WORK_ROUTE, label: "past work" },
    { href: ORANGE_COUNTY_ROUTE, label: `website help in ${SERVICE_AREA_SHORT}` },
  ];
  return (
    <ul className="m-0 p-0 list-none flex flex-wrap gap-x-8 gap-y-1">
      {links.map((link) => (
        <li key={link.href}>
          <MoreLink href={link.href}>{link.label}</MoreLink>
        </li>
      ))}
    </ul>
  );
}

function ServicePage({ service, plans }: { service: Service; plans: readonly Plan[] }): ReactElement {
  const plan = service.plan === null ? undefined : findPlan(plans, service.plan);
  const route = serviceRoute(service.slug);
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd
        data={pageGraph(
          serviceLd({ name: service.name, description: service.description, route, plan }),
          breadcrumbLd([SERVICES_CRUMB, { name: service.name, route }]),
          faqPageLd(service.faq),
        )}
      />
      <a className="inline-block py-2 font-mono text-[0.78rem] tracking-[0.04em] text-muted hover:text-ink" href={SERVICES_ROUTE}>
        ← all services
      </a>
      <div className="mt-6">
        <Eyebrow>{`services · ${SERVICE_AREA_COPY}`}</Eyebrow>
      </div>
      <h1 className={`${HEADING} mt-8`}>{service.name}</h1>
      <p className={`${LEDE} mt-8`}>{service.lede}</p>
      <p className="mt-4 mb-0 max-w-[38rem] font-mono text-[0.85rem] leading-relaxed" data-price-line="">
        {servicePriceLine(plans)}
      </p>
      <p className="mt-4 mb-0 text-muted max-w-[38rem]">{service.who}</p>
      <p className="mt-4 mb-0 max-w-[38rem]">{PAST_WORK_LINE}</p>
      <PrimaryCta plan={plan} />
      {route === SITE_CHECK_PAGE ? <CheckForm /> : null}

      <Section label="what i can do">
        <List items={service.includes} />
      </Section>

      {service.comparison === undefined ? null : (
        <Section label="how it's different">
          <Comparison rows={service.comparison} />
        </Section>
      )}

      {service.stayOrMove === undefined ? null : (
        <Section label="stay or move">
          <StayOrMoveLists advice={service.stayOrMove} />
        </Section>
      )}

      <Section label={service.stepsLabel ?? DEFAULT_STEPS_LABEL}>
        <Steps steps={service.steps} />
      </Section>

      <Section label="what it costs">
        <div className="grid gap-6">
          <p className="m-0 text-[1.1rem]">{service.costNote}</p>
          {plan === undefined ? null : <PlanCard plan={plan} showMore={false} />}
          <MoreLink href="/#pricing">all prices</MoreLink>
        </div>
      </Section>

      <Section label="questions">
        <Questions faq={service.faq} />
      </Section>

      <Section label="related">
        <RelatedLinks service={service} />
      </Section>
    </main>
  );
}

function ServiceRows(): ReactElement {
  return (
    <ul className="m-0 p-0 list-none border-b border-line">
      {SERVICES.map((service, index) => (
        <li className="border-t border-line" key={service.slug}>
          <a
            className="group grid gap-3 md:gap-6 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.4fr)_2rem] py-7 text-ink"
            href={serviceRoute(service.slug)}
          >
            <span className="font-mono text-[0.85rem] text-accent">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-[1.5rem] leading-tight tracking-[-0.025em] font-medium">{service.name}</span>
            <span className="text-muted">{service.summary}</span>
            <span className="text-muted transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function ServicesIndex({ plans }: { plans: readonly Plan[] }): ReactElement {
  const prices = startingPricesLine(plans);
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(breadcrumbLd([SERVICES_CRUMB]))} />
      <Eyebrow>{`for small businesses in ${SERVICE_AREA_COPY}`}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>services</h1>
      <p className={`${LEDE} mt-8`}>{SERVICES_LEDE}</p>
      {prices === null ? null : <p className="mt-4 mb-0 text-muted">{prices}</p>}
      <div className="mt-16">
        <ServiceRows />
      </div>
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-1">
        <MoreLink href={WORK_ROUTE}>past work</MoreLink>
        <MoreLink href={ORANGE_COUNTY_ROUTE}>{`website help in ${SERVICE_AREA_SHORT}`}</MoreLink>
        <MoreLink href="/process">how a one-project job works</MoreLink>
      </div>
    </main>
  );
}

function OrangeCountyPage({ plans }: { plans: readonly Plan[] }): ReactElement {
  const prices = startingPricesLine(plans);
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(businessLd(plans), breadcrumbLd([ORANGE_COUNTY_CRUMB]))} />
      <Eyebrow>{SERVICE_AREA_COPY}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>website help in {SERVICE_AREA_SHORT}</h1>
      <p className={`${LEDE} mt-8`}>{AREA_LINE}</p>
      <PrimaryCta plan={undefined} />

      <Section label="who i help">
        <p className="m-0 text-[1.1rem] leading-relaxed">
          small businesses w/ a website that's broken, old or slowing them down. gyms, studios, clinics, shops. you get the engineer, not an account manager. i can come by + look at it w/ you.
        </p>
      </Section>

      <Section label="why me">
        <p className="m-0 text-[1.1rem] leading-relaxed">{WHY_ME_LINE}</p>
      </Section>

      <Section label="what i do">
        <ServiceRows />
      </Section>

      <Section label="what it costs">
        <div className="grid gap-4">
          {prices === null ? null : <p className="m-0 text-[1.1rem]">{prices}</p>}
          <MoreLink href="/#pricing">all prices</MoreLink>
        </div>
      </Section>

      <Section label="past work">
        <div className="grid gap-4">
          <p className="m-0 text-[1.1rem]">{PAST_WORK_LINE}</p>
          <MoreLink href={WORK_ROUTE}>see past work</MoreLink>
        </div>
      </Section>
    </main>
  );
}

export function makeServicePage(service: Service, plans: readonly Plan[]): () => ReactElement {
  return function BoundServicePage(): ReactElement {
    return <ServicePage plans={plans} service={service} />;
  };
}

export function makeServicesIndex(plans: readonly Plan[]): () => ReactElement {
  return function BoundServicesIndex(): ReactElement {
    return <ServicesIndex plans={plans} />;
  };
}

export function makeOrangeCounty(plans: readonly Plan[]): () => ReactElement {
  return function BoundOrangeCounty(): ReactElement {
    return <OrangeCountyPage plans={plans} />;
  };
}
