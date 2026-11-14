import type { Article, FaqItem, Plan } from "./content";
import {
  ABOUT_ROUTE,
  canonicalUrl,
  CONTACT_EMAIL,
  GITHUB_URL,
  OG_IMAGE_PATH,
  SERVICE_AREA,
  SERVICE_AREA_LABEL,
  SETUP_WAIVER,
  SITE_CHECK_NAME,
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
const BUSINESS_DESCRIPTION = `Website help from a senior software engineer, for small businesses in ${SERVICE_AREA_LABEL}: a free site check, care, monthly help and one-off projects.`;
const SITE_CHECK_DESCRIPTION = "i look through your site + tell you what's broken. fixes under 30 min are free.";
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

function setupFeeLd(setup: number): JsonLd {
  return {
    "@type": "UnitPriceSpecification",
    priceComponentType: "https://schema.org/ActivationFee",
    price: String(setup),
    priceCurrency: CURRENCY,
    description: `one-time setup fee, ${SETUP_WAIVER}`,
  };
}

function priceSpecificationLd(plan: Plan & { price: number }): JsonLd {
  const monthly = monthlyPriceLd(String(plan.price));
  if (plan.setup === undefined) return monthly;
  return { "@type": "CompoundPriceSpecification", priceComponent: [monthly, setupFeeLd(plan.setup)] };
}

function offerLd(plan: Plan & { price: number }): JsonLd {
  return {
    "@type": "Offer",
    name: plan.name,
    description: plan.summary,
    price: String(plan.price),
    priceCurrency: CURRENCY,
    priceSpecification: priceSpecificationLd(plan),
  };
}

export function siteCheckOfferLd(): JsonLd {
  return { "@type": "Offer", name: SITE_CHECK_NAME, description: SITE_CHECK_DESCRIPTION, price: "0", priceCurrency: CURRENCY };
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
    makesOffer: [siteCheckOfferLd(), ...pricedPlans(plans).map(offerLd)],
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

export function faqLd(faq: readonly FaqItem[]): JsonLd {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: htmlToText(item.html) },
    })),
  };
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
  readonly plan: Plan | undefined;
}

function providerLd(): JsonLd {
  return { "@type": "ProfessionalService", "@id": BUSINESS_ID, name: SITE_NAME_PROPER, url: canonicalUrl("/") };
}

export function serviceLd(input: ServiceLdInput): JsonLd {
  const plan = input.plan;
  const priced = plan !== undefined && plan.price !== null ? { ...plan, price: plan.price } : undefined;
  const offers = plan === undefined ? siteCheckOfferLd() : priced === undefined ? undefined : offerLd(priced);
  return {
    "@type": "Service",
    name: input.name,
    serviceType: input.name,
    description: input.description,
    url: canonicalUrl(input.route),
    provider: providerLd(),
    areaServed: areaServed(),
    ...(offers === undefined ? {} : { offers }),
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
