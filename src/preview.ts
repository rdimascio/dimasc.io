export const PREVIEW_ENV_VAR = "PREVIEW_DRAFTS";

export function previewDraftsFromEnv(): boolean {
  return process.env[PREVIEW_ENV_VAR] === "1";
}
