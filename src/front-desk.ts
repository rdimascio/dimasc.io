import { SERVICE_AREA_COPY } from "./site";
import type { QuestionAnswer } from "./structured-data";

export const ORANGE_COUNTY_ROUTE = "/orange-county";

export const FRONT_DESK_TITLE = "ai front desk for local businesses";
export const FRONT_DESK_HEADLINE = "the front desk that doesn't miss calls.";
export const FRONT_DESK_LEDE =
  "you're with a customer, on a job or closed for the night when the phone rings. i set up an ai front desk that picks up, texts people back + answers the usual questions from your own hours, prices + faq. then i keep it working.";

export function frontDeskDescription(shortPrice: string): string {
  return `ai front desk for local businesses in ${SERVICE_AREA_COPY}: picks up missed calls, texts back + replies to reviews. ${shortPrice}`;
}

export const FRONT_DESK_INCLUDES = [
  "picks up the calls you miss + texts people back",
  "answers booking questions from your own hours, prices + faq",
  "sends people to book in the tool you already use",
  "replies to your google reviews",
  "i check it every week + fix what's off",
  "one person to talk to: me",
] as const;

export const FRONT_DESK_SETUP_STEPS = [
  "free missed-call check, so we both see the gap in dollars",
  "i get access to your phone line, booking tool + google profile",
  "i load your hours, prices, faq + how you want people answered",
  "we test it together before it goes live",
  "it goes live, + i check it every week after that",
] as const;

export const FRONT_DESK_NOT_INCLUDED = [
  "the software itself. its monthly fees are billed at cost, no markup",
  "a new phone system or new booking software. it runs in what you have",
  "a custom ai product built from scratch for you to own",
  "bookkeeping, payroll, invoicing or other back office work",
  "a new website. if yours gets in the way, see the website fix below",
] as const;

export const WEBSITE_FIX_LEDE =
  "sometimes the website is what stops people from booking: a broken form, a booking link that goes nowhere, a site that falls apart on phones. for front desk clients + people they send my way, i fix it or rebuild it for one flat price, confirmed after the free check.";

export function frontDeskFaq(priceLine: string, pricingTerms: string): readonly QuestionAnswer[] {
  return [
    { question: "what does the ai front desk cost?", answer: `${priceLine} ${pricingTerms}` },
    {
      question: "why 3 months?",
      answer: "the first weeks are setup + tuning it to your real calls + questions. after 3 months it's month to month, + you can cancel anytime.",
    },
    {
      question: "do i need to buy new software?",
      answer: "usually no. i set it up inside what you already pay for. if it needs one more tool, i tell you before i start.",
    },
    {
      question: "what happens if it says something wrong?",
      answer:
        "it can happen. so it only answers from what you've ok'd, + when it isn't sure, it takes a message + sends it to you. i read through its replies every week + fix what's off.",
    },
    {
      question: "who owns the setup?",
      answer: "you do. it runs in your own accounts. if we stop working together, the setup stays yours.",
    },
  ];
}
