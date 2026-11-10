import { defineCollection, defineConfig } from "@lesto/content-core";
import { z } from "zod";

export const caseStudyFrontmatter = z.object({
  title: z.string(),
  summary: z.string(),
  client: z.string().optional(),
  industry: z.string(),
  year: z.number().int(),
  services: z.array(z.string()),
  stack: z.array(z.string()),
  order: z.number().int().default(100),
  draft: z.boolean().default(false),
});

export type CaseStudyFrontmatter = z.infer<typeof caseStudyFrontmatter>;

export const processStepFrontmatter = z.object({
  title: z.string(),
  summary: z.string(),
  step: z.number().int().positive(),
});

export type ProcessStepFrontmatter = z.infer<typeof processStepFrontmatter>;

const caseStudies = defineCollection({
  name: "caseStudies",
  directory: "content/case-studies",
  include: "**/*.md",
  schema: caseStudyFrontmatter,
  render: { syntaxHighlighting: true },
});

const process = defineCollection({
  name: "process",
  directory: "content/process",
  include: "**/*.md",
  schema: processStepFrontmatter,
  render: { syntaxHighlighting: false },
});

export default defineConfig({ collections: [caseStudies, process] });
