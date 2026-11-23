import type { Plan } from "./content";
import { AI_TOOLS, INTRO_CALL_MINUTES, SERVICE_AREA_COPY, SERVICE_AREA_SHORT } from "./site";
import type { QuestionAnswer } from "./structured-data";

export const ORANGE_COUNTY_ROUTE = "/orange-county";

export const AI_PLAN_NAME = "ai plan";
export const BUILDS_NAME = "builds";
export const KEEP_IT_WORKING_NAME = "keep it working";
export const LADDER_NAMES = [AI_PLAN_NAME, BUILDS_NAME, KEEP_IT_WORKING_NAME] as const;
export const AI_PLAN_CREDIT_DAYS = 30;

export const PRICING_TERMS = "software billed at cost, no markup. no hourly bills.";
export const RUNS_IN_LINE = `it runs inside the stuff you already use: ${AI_TOOLS}.`;
export const LOOK_AFTER_LINE = "i set it up, i watch it, i fix it when it breaks. you don't touch it.";
export const INTRO_CALL_LINE = `tell me how your business runs + what eats your week. we talk for ${INTRO_CALL_MINUTES} min. if ai can save you real time, the next step is an ai plan. if it can't, i'll say so.`;

export interface Example {
  readonly title: string;
  readonly body: string;
}

export const EXAMPLES: readonly Example[] = [
  { title: "front desk", body: "picks up the calls you miss, texts people back + answers booking questions from your own hours + prices." },
  { title: "follow-ups + reminders", body: "reminds people about appointments + nudges the quotes and leads nobody got back to." },
  { title: "review replies", body: "drafts replies to your google reviews in your voice, for you to ok." },
  { title: "scheduling + intake", body: "collects what you need before the first visit + puts it where your team looks." },
  { title: "content + social drafts", body: "drafts posts, emails + updates from what's going on this week, for you to ok." },
  { title: "simple reports", body: "a short weekly summary of calls, bookings + reviews, in plain words." },
];

export interface Step {
  readonly title: string;
  readonly body: string;
}

export const STEPS: readonly Step[] = [
  { title: "free 15-min call", body: "you tell me how the business runs. i tell you if ai can help." },
  { title: "ai plan", body: "1 hour w/ me, then a written plan of the 3 best places ai saves you time, w/ prices." },
  { title: "i build it", body: "inside the tools you already pay for. we test it together before it goes live." },
  { title: "i keep it working", body: "i check it every week + fix what's off." },
];

export const WHO_FOR = [
  "youth sports academies + kids' activity centers",
  "gyms, studios + med spas",
  "home services, like hvac, plumbing, landscaping + cleaning",
  "salons, clinics + other shops that book by phone or app",
] as const;
export const WHO_FOR_LINE = `owner-run, 2-30 staff, in ${SERVICE_AREA_COPY}. no tech team.`;
export const NOT_FOR = [
  "banks, fintech, payments, lending or insurance",
  "back office work for anyone: bookkeeping, accounting, payroll, invoicing, spend tools, hr or benefits",
  "startups + venture-backed companies",
  "restaurants, for now",
  "a custom ai product built from scratch for you to own",
] as const;
export const NOT_FOR_LINE = "i say no to these, + i'm happy to point you somewhere else.";

export const NOT_INCLUDED = [
  "the software itself. its monthly fees are billed at cost, no markup",
  "new phone systems or new booking software. it runs in what you have",
  "a custom ai product built from scratch for you to own",
  "bookkeeping, payroll, invoicing or other back office work",
] as const;

export const AI_HEADLINE = "ai that takes the busywork off your plate.";
export const AI_LEDE =
  "you started a business to do the work, not to answer the same 5 questions all day. i find the busywork ai can take off your plate, set it up inside the tools you already use, then keep it working.";
export const AI_PAGE_TITLE = "ai help for local businesses";
export const ORANGE_COUNTY_HEADLINE = `ai help for local businesses in ${SERVICE_AREA_SHORT}.`;

export type PricedPlan = Plan & { price: number };

export function planNamed(plans: readonly Plan[], name: string): PricedPlan {
  const plan = plans.find((candidate) => candidate.name === name);
  if (plan === undefined || plan.price === null) throw new Error(`the "${name}" plan needs a price`);
  return { ...plan, price: plan.price };
}

export interface Ladder {
  readonly plan: PricedPlan;
  readonly build: PricedPlan;
  readonly keep: PricedPlan;
}

export function ladder(plans: readonly Plan[]): Ladder {
  return { plan: planNamed(plans, AI_PLAN_NAME), build: planNamed(plans, BUILDS_NAME), keep: planNamed(plans, KEEP_IT_WORKING_NAME) };
}

export function ladderPlans(plans: readonly Plan[]): PricedPlan[] {
  return LADDER_NAMES.map((name) => planNamed(plans, name));
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

const PER_SUFFIX: Readonly<Record<Plan["per"], string>> = { flat: " flat", build: " per build", month: "/month" };

export function planPriceText(plan: PricedPlan): string {
  const from = plan.from ? "from " : "";
  const unit = plan.unit === undefined ? "" : ` ${plan.unit}`;
  return `${from}${formatPrice(plan.price)}${PER_SUFFIX[plan.per]}${unit}`;
}

export function minimumLine(plan: Plan): string {
  return plan.minimumMonths === undefined ? "" : `${plan.minimumMonths}-month minimum, then month to month.`;
}

export function ladderLine(plan: PricedPlan): string {
  return `${plan.name}: ${planPriceText(plan)}.`;
}

export function aiPlanCreditLine(): string {
  return `credited toward a build within ${AI_PLAN_CREDIT_DAYS} days.`;
}

export function ladderSummary(plans: readonly Plan[]): string {
  const { plan, build, keep } = ladder(plans);
  return `${AI_PLAN_NAME} ${planPriceText(plan)}, builds ${planPriceText(build)}, then ${formatPrice(keep.price)}/month to keep each one working.`;
}

export function aiDescription(plans: readonly Plan[]): string {
  return `ai help for local businesses in ${SERVICE_AREA_COPY}. ${ladderSummary(plans)}`;
}

export function aiFaq(plans: readonly Plan[]): readonly QuestionAnswer[] {
  const { plan, build, keep } = ladder(plans);
  return [
    {
      question: "what's in the ai plan?",
      answer: `${plan.summary} ${planPriceText(plan)}, ${aiPlanCreditLine()}`,
    },
    {
      question: "what does a build cost?",
      answer: `${planPriceText(build)}. each build gets one flat price, quoted from your plan before i start. ${PRICING_TERMS}`,
    },
    {
      question: "what does it cost to keep it working?",
      answer: `${planPriceText(keep)}. ${minimumLine(keep)} i check it every week + fix what's off.`,
    },
    {
      question: "do i need to buy new software?",
      answer: "usually no. i set it up inside what you already pay for. if it needs one more tool, i tell you before i start.",
    },
    {
      question: "what happens if it says something wrong?",
      answer:
        "it can happen. so it only answers from what you've ok'd, + when it isn't sure, it hands off to you. i read through its work every week + fix what's off.",
    },
  ];
}
