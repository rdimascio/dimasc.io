import path from "node:path";
import { fileURLToPath } from "node:url";

import { runPipeline } from "@lesto/content-core/build";

import config, { type CaseStudyFrontmatter, type ProcessStepFrontmatter } from "../lesto.content";

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

interface RawBase {
  readonly collection: string;
  readonly file: { readonly pathSegments: readonly string[] };
  readonly rendered?: { readonly html: string };
}

type RawCaseStudy = RawBase & CaseStudyFrontmatter;
type RawProcessStep = RawBase & ProcessStepFrontmatter;

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
  readonly html: string;
}

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
    html: entry.rendered?.html ?? "",
  };
}

export async function loadCaseStudies(): Promise<CaseStudy[]> {
  const entries = await loadEntries();
  return entries
    .filter((entry): entry is RawCaseStudy => entry.collection === "caseStudies")
    .filter((entry) => !entry.draft)
    .map(toCaseStudy)
    .toSorted((a, b) => a.order - b.order || b.year - a.year || a.title.localeCompare(b.title));
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
