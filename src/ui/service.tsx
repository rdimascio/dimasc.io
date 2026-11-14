import type { ReactElement } from "react";

import type { Plan } from "../content";
import { CONTACT_EMAIL, SERVICE_AREA_COPY, SERVICE_AREA_SHORT } from "../site";
import { ORANGE_COUNTY_ROUTE, serviceBySlug, serviceRoute, SERVICES, SERVICES_ROUTE, type Service, type ServiceFaq } from "../services";
import { breadcrumbLd, businessLd, pageGraph, serviceLd } from "../structured-data";
import { WORK_ROUTE } from "../work";
import { PlanCard, planCtaHref, startingPricesLine } from "./home";
import { JsonLd } from "./json-ld";
import { ArrowLink, Eyebrow, HEADING, LEDE, PAGE, SectionHead } from "./layout";

export const SERVICES_CRUMB = { name: "services", route: SERVICES_ROUTE } as const;
export const ORANGE_COUNTY_CRUMB = { name: SERVICE_AREA_SHORT, route: ORANGE_COUNTY_ROUTE } as const;
export const PAST_WORK_LINE = "i've built websites for stanford, blackstone, holt international + serhant, while at 10up + luxury presence.";
export const AREA_LINE = `i'm based in ${SERVICE_AREA_COPY} + work w/ businesses around here, like in tustin + corona. anywhere else in the us works too, over email + video.`;
export const SERVICES_LEDE = "website help for small businesses: one fix, a new site, booking, a store, or someone keeping an eye on it all.";

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

function Section({ label, children }: { label: string; children: ReactElement }): ReactElement {
  return (
    <section className="mt-20 sm:mt-28">
      <SectionHead label={label} />
      <div className="md:ml-[calc(33.333%+0.5rem)] max-w-[44rem]">{children}</div>
    </section>
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
  const plan = findPlan(plans, service.plan);
  const route = serviceRoute(service.slug);
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd
        data={pageGraph(
          serviceLd({ name: service.name, description: service.description, route, plan }),
          breadcrumbLd([SERVICES_CRUMB, { name: service.name, route }]),
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
      <p className="mt-4 mb-0 text-muted max-w-[38rem]">{service.who}</p>
      {plan === undefined ? null : (
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ArrowLink href={planCtaHref(plan)} tone="accent">
            {plan.cta}
          </ArrowLink>
          <a className="inline-flex items-center rounded-full border border-line px-6 py-3 font-medium hover:border-ink" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      )}

      <Section label="what i can do">
        <List items={service.includes} />
      </Section>

      <Section label="how it works">
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
        <div className="grid gap-6">
          <p className="m-0 text-muted">{PAST_WORK_LINE}</p>
          <RelatedLinks service={service} />
        </div>
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
  const fix = findPlan(plans, "fix it");
  return (
    <main className={`${PAGE} pb-28`}>
      <JsonLd data={pageGraph(businessLd(plans), breadcrumbLd([ORANGE_COUNTY_CRUMB]))} />
      <Eyebrow>{SERVICE_AREA_COPY}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>website help in {SERVICE_AREA_SHORT}</h1>
      <p className={`${LEDE} mt-8`}>{AREA_LINE}</p>
      {fix === undefined ? null : (
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ArrowLink href={planCtaHref(fix)} tone="accent">
            {fix.cta}
          </ArrowLink>
          <a className="inline-flex items-center rounded-full border border-line px-6 py-3 font-medium hover:border-ink" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      )}

      <Section label="who i help">
        <p className="m-0 text-[1.1rem] leading-relaxed">
          small businesses w/ a website that's broken, old or slowing them down. gyms, studios, clinics, shops. you work directly w/ me, not an agency.
        </p>
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
