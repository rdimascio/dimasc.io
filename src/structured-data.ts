import type { Article, FaqItem, Plan } from "./content";
import {
  ABOUT_ROUTE,
  canonicalUrl,
  CONTACT_EMAIL,
  INTRO_CALL_NAME,
  GITHUB_URL,
  OG_IMAGE_PATH,
  SERVICE_AREA,
  SERVICE_AREA_LABEL,
  SITE_NAME_PROPER,
  SITE_URL,
} from "./site";

export type JsonLd = Readonly<Record<string, unknown>>;

const SCHEMA_CONTEXT = "https://schema.org";
const CURRENCY = "USD";
const LANGUAGE = "en-US";
const HOME_CRUMB = { name: "home", route: "/" } as const;

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
const BUSINESS_DESCRIPTION = `AI help for local, owner-run businesses in ${SERVICE_AREA_LABEL}: AI that takes busywork off the owner's plate, like missed calls, follow-ups, review replies, scheduling, content drafts and simple reports, set up inside the tools the business already uses and kept working.`;
const INTRO_CALL_DESCRIPTION = "a free 15-min call about how your business runs + whether ai can save you real time.";
const JOB_TITLE = "Senior software engineer";

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};

export function htmlToText(html: string): string {
  const withoutTags = html.replace(/<[^>]+>/g, " ");
  const decoded = withoutTags.replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (entity) => HTML_ENTITIES[entity] ?? entity);
  return decoded.replace(/\s+/g, " ").trim();
}

function ref(id: string): JsonLd {
  return { "@id": id };
}

function areaServed(): JsonLd[] {
  return [
    { "@type": "AdministrativeArea", name: SERVICE_AREA_LABEL },
    ...SERVICE_AREA.cities.map((city) => ({ "@type": "City", name: `${city}, ${SERVICE_AREA.state}` })),
  ];
}

function pricedPlans(plans: readonly Plan[]): (Plan & { price: number })[] {
  return plans.filter((plan): plan is Plan & { price: number } => plan.price !== null);
}

function usd(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

function priceRange(plans: readonly Plan[]): string | undefined {
  const prices = pricedPlans(plans).map((plan) => plan.price);
  if (prices.length === 0) return undefined;
  return `${usd(Math.min(...prices))}-${usd(Math.max(...prices))}`;
}

function monthlyPriceLd(price: string): JsonLd {
  return { "@type": "UnitPriceSpecification", price, priceCurrency: CURRENCY, unitText: "MONTH" };
}

function startingPriceLd(price: string): JsonLd {
  return { "@type": "PriceSpecification", minPrice: price, priceCurrency: CURRENCY };
}

function offerLd(plan: Plan & { price: number }): JsonLd {
  const price = String(plan.price);
  const base = { "@type": "Offer", name: plan.name, description: plan.summary, price, priceCurrency: CURRENCY };
  if (plan.per === "month") return { ...base, priceSpecification: monthlyPriceLd(price) };
  if (plan.from) return { ...base, priceSpecification: startingPriceLd(price) };
  return base;
}

export function introCallOfferLd(): JsonLd {
  return { "@type": "Offer", name: INTRO_CALL_NAME, description: INTRO_CALL_DESCRIPTION, price: "0", priceCurrency: CURRENCY };
}

export function businessLd(plans: readonly Plan[]): JsonLd {
  const range = priceRange(plans);
  return {
    "@type": "ProfessionalService",
    "@id": BUSINESS_ID,
    name: SITE_NAME_PROPER,
    url: canonicalUrl("/"),
    email: CONTACT_EMAIL,
    image: OG_IMAGE_URL,
    logo: OG_IMAGE_URL,
    description: BUSINESS_DESCRIPTION,
    areaServed: areaServed(),
    founder: ref(PERSON_ID),
    ...(range === undefined ? {} : { priceRange: range }),
    makesOffer: [introCallOfferLd(), ...pricedPlans(plans).map(offerLd)],
  };
}

export function personLd(): JsonLd {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_NAME_PROPER,
    url: canonicalUrl(ABOUT_ROUTE),
    email: CONTACT_EMAIL,
    jobTitle: JOB_TITLE,
    sameAs: [GITHUB_URL],
    worksFor: ref(BUSINESS_ID),
  };
}

export function websiteLd(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: canonicalUrl("/"),
    name: SITE_NAME_PROPER,
    inLanguage: LANGUAGE,
    publisher: ref(BUSINESS_ID),
  };
}

export interface QuestionAnswer {
  readonly question: string;
  readonly answer: string;
}

export function faqPageLd(items: readonly QuestionAnswer[]): JsonLd {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function faqLd(faq: readonly FaqItem[]): JsonLd {
  return faqPageLd(faq.map((item) => ({ question: item.question, answer: htmlToText(item.html) })));
}

export interface Crumb {
  readonly name: string;
  readonly route: string;
}

export function breadcrumbLd(trail: readonly Crumb[]): JsonLd {
  const crumbs = [HOME_CRUMB, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.route),
    })),
  };
}

export function articleLd(article: Article): JsonLd {
  return {
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    datePublished: article.published,
    dateModified: article.updated ?? article.published,
    inLanguage: LANGUAGE,
    image: OG_IMAGE_URL,
    mainEntityOfPage: canonicalUrl(article.route),
    author: { "@type": "Person", "@id": PERSON_ID, name: SITE_NAME_PROPER, url: canonicalUrl(ABOUT_ROUTE) },
    publisher: ref(BUSINESS_ID),
    ...(article.tags.length === 0 ? {} : { keywords: article.tags.join(", ") }),
  };
}

export interface ServiceLdInput {
  readonly name: string;
  readonly description: string;
  readonly route: string;
  readonly plans: readonly Plan[];
}

function providerLd(): JsonLd {
  return { "@type": "ProfessionalService", "@id": BUSINESS_ID, name: SITE_NAME_PROPER, url: canonicalUrl("/") };
}

export function serviceLd(input: ServiceLdInput): JsonLd {
  const offers = [introCallOfferLd(), ...pricedPlans(input.plans).map(offerLd)];
  return {
    "@type": "Service",
    name: input.name,
    serviceType: input.name,
    description: input.description,
    url: canonicalUrl(input.route),
    provider: providerLd(),
    areaServed: areaServed(),
    offers,
  };
}

export function homeGraph(plans: readonly Plan[], faq: readonly FaqItem[]): JsonLd {
  return { "@context": SCHEMA_CONTEXT, "@graph": [businessLd(plans), personLd(), websiteLd(), faqLd(faq)] };
}

export function pageGraph(...nodes: readonly JsonLd[]): JsonLd {
  return { "@context": SCHEMA_CONTEXT, "@graph": nodes };
}

export function jsonLdText(data: JsonLd): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
