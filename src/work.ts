import type { CaseStudy } from "./content";
import { CONTACT_EMAIL } from "./site";

export const WORK_ROUTE = "/work";
export const WORK_REQUEST_ROUTE = "/work/request";
export const PREVIEW_ENV_VAR = "PREVIEW_CASE_STUDIES";

const SCREENSHOT_DIR = "images/work";
export const SCREENSHOT_SOURCE_DIR = "assets/work";

export type ScreenshotView = "desktop" | "mobile";

export function previewCaseStudiesFromEnv(): boolean {
  return process.env[PREVIEW_ENV_VAR] === "1";
}

export function screenshotSrc(study: Pick<CaseStudy, "slug">, view: ScreenshotView): string {
  return `/${SCREENSHOT_DIR}/${study.slug}-${view}.webp`;
}

export function screenshotOutputPath(fileName: string): string {
  return `${SCREENSHOT_DIR}/${fileName}`;
}

export function projectName(study: Pick<CaseStudy, "client" | "title">): string {
  return study.client ?? study.title;
}

export function requestAnchor(study: Pick<CaseStudy, "slug">): string {
  return `${WORK_REQUEST_ROUTE}#${study.slug}`;
}

export function requestMailto(study: Pick<CaseStudy, "client" | "title">): string {
  const subject = `Case study request: ${projectName(study)}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function workRoutes(studies: readonly CaseStudy[], previewCaseStudies: boolean): string[] {
  if (studies.length === 0) return [];
  const fullStudies = previewCaseStudies ? studies.map((study) => study.route) : [];
  return [WORK_ROUTE, WORK_REQUEST_ROUTE, ...fullStudies];
}
