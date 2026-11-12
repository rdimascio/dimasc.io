import path from "node:path";
import { fileURLToPath } from "node:url";

import { runPipeline } from "@lesto/content-core/build";

import config, {
  type CaseStudyFrontmatter,
  type DemoFrontmatter,
  type ExperienceFrontmatter,
  type FaqFrontmatter,
  type RoleFrontmatter,
  type PlanFrontmatter,
  type ProcessStepFrontmatter,
} from "../lesto.content";

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

interface RawBase {
  readonly collection: string;
  readonly file: { readonly pathSegments: readonly string[] };
  readonly rendered?: { readonly html: string };
}

type RawCaseStudy = RawBase & CaseStudyFrontmatter;
type RawProcessStep = RawBase & ProcessStepFrontmatter;
type RawPlan = RawBase & PlanFrontmatter;
type RawFaq = RawBase & FaqFrontmatter;
type RawExperience = RawBase & ExperienceFrontmatter;

export interface Plan {
  readonly slug: string;
  readonly name: string;
  readonly price: number | null;
  readonly summary: string;
  readonly features: readonly string[];
  readonly cta: string;
  readonly featured: boolean;
  readonly order: number;
}

export interface FaqItem {
  readonly slug: string;
  readonly question: string;
  readonly order: number;
  readonly html: string;
}

export interface CaseStudy {
  readonly route: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly client: string | undefined;
  readonly industry: string;
  readonly year: number;
  readonly services: readonly string[];
  readonly stack: readonly string[];
  readonly order: number;
  readonly draft: boolean;
  readonly html: string;
}

export const OPEN_QUESTION_MARKER = "TODO(ryan)";

export interface ProcessStep {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly step: number;
  readonly html: string;
}

async function loadEntries(): Promise<RawBase[]> {
  const result = await runPipeline({ cwd: SITE_ROOT, config, skipWrite: true });
  return result.entries as unknown as RawBase[];
}

function slugOf(entry: RawBase): string {
  return entry.file.pathSegments.join("/");
}

function toCaseStudy(entry: RawCaseStudy): CaseStudy {
  const slug = slugOf(entry);
  return {
    route: `/work/${slug}`,
    slug,
    title: entry.title,
    summary: entry.summary,
    client: entry.client,
    industry: entry.industry,
    year: entry.year,
    services: entry.services,
    stack: entry.stack,
    order: entry.order,
    draft: entry.draft,
    html: entry.rendered?.html ?? "",
  };
}

function assertNoOpenQuestions(study: CaseStudy): CaseStudy {
  if (!study.draft && study.html.includes(OPEN_QUESTION_MARKER)) {
    throw new Error(`case study "${study.slug}" is not a draft but still has ${OPEN_QUESTION_MARKER} lines`);
  }
  return study;
}

export async function loadAllCaseStudies(): Promise<CaseStudy[]> {
  const entries = await loadEntries();
  return entries
    .filter((entry): entry is RawCaseStudy => entry.collection === "caseStudies")
    .filter((entry) => entry.file.pathSegments.at(-1)?.startsWith("_") !== true)
    .map(toCaseStudy)
    .map(assertNoOpenQuestions)
    .toSorted((a, b) => a.order - b.order || b.year - a.year || a.title.localeCompare(b.title));
}

export async function loadCaseStudies(): Promise<CaseStudy[]> {
  return (await loadAllCaseStudies()).filter((study) => !study.draft);
}

export async function loadProcess(): Promise<ProcessStep[]> {
  const entries = await loadEntries();
  return entries
    .filter((entry): entry is RawProcessStep => entry.collection === "process")
    .map((entry) => ({
      slug: slugOf(entry),
      title: entry.title,
      summary: entry.summary,
      step: entry.step,
      html: entry.rendered?.html ?? "",
    }))
    .toSorted((a, b) => a.step - b.step);
}

export async function loadPlans(): Promise<Plan[]> {
  const entries = await loadEntries();
  return entries
    .filter((entry): entry is RawPlan => entry.collection === "plans")
    .map((entry) => ({
      slug: slugOf(entry),
      name: entry.name,
      price: entry.price,
      summary: entry.summary,
      features: entry.features,
      cta: entry.cta,
      featured: entry.featured,
      order: entry.order,
    }))
    .toSorted((a, b) => a.order - b.order);
}

export type Demo = DemoFrontmatter;
export type Role = RoleFrontmatter;

export interface Experience {
  readonly slug: string;
  readonly company: string;
  readonly url: string | undefined;
  readonly description: string;
  readonly role: string | undefined;
  readonly period: string | undefined;
  readonly current: boolean;
  readonly compact: boolean;
  readonly order: number;
  readonly roles: readonly Role[];
  readonly demos: readonly Demo[];
  readonly html: string;
}

export async function loadExperience(): Promise<Experience[]> {
  const entries = await loadEntries();
  return entries
    .filter((entry): entry is RawExperience => entry.collection === "experience")
    .map((entry) => ({
      slug: slugOf(entry),
      company: entry.company,
      url: entry.url,
      description: entry.description,
      role: entry.role,
      period: entry.period,
      current: entry.current,
      compact: entry.compact,
      order: entry.order,
      roles: entry.roles,
      demos: entry.demos,
      html: entry.rendered?.html ?? "",
    }))
    .toSorted((a, b) => a.order - b.order);
}

export async function loadFaq(): Promise<FaqItem[]> {
  const entries = await loadEntries();
  return entries
    .filter((entry): entry is RawFaq => entry.collection === "faq")
    .map((entry) => ({ slug: slugOf(entry), question: entry.question, order: entry.order, html: entry.rendered?.html ?? "" }))
    .toSorted((a, b) => a.order - b.order);
}
