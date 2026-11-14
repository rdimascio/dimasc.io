export type ReportWindow = "current" | "prior";

export interface EventRow {
  readonly event: string;
  readonly n: number | string;
}

export interface SourceRow {
  readonly utm_source: string;
  readonly referrer_host: string;
  readonly n: number | string;
}

export interface WeekSummary {
  readonly visits: number;
  readonly formViews: number;
  readonly submits: number;
  readonly leads: number;
  readonly sources: Map<string, number>;
}

export const DATASET: string;
export const ACCOUNT_ENV: string;
export const TOKEN_ENV: string;
export const WINDOW_DAYS: number;
export const TOP_SOURCES: number;
export const SAME_SITE_REFERRER: string;
export const DIRECT_SOURCE: string;
export const COUNTED_EVENTS: { readonly formViews: string; readonly submits: string; readonly leads: string };

export function windowFilter(window: ReportWindow): string;
export function eventsSql(window: ReportWindow): string;
export function sourcesSql(window: ReportWindow): string;
export function sourceOf(row: SourceRow): string;
export function summarize(eventRows: readonly EventRow[], sourceRows: readonly SourceRow[]): WeekSummary;
export function formatReport(current: WeekSummary, prior: WeekSummary): string;
export function readConfig(env: Record<string, string | undefined>): { accountId: string; token: string };
