export interface AdLeadRecord {
  readonly receivedAt?: unknown;
  readonly gclid?: unknown;
  readonly gbraid?: unknown;
  readonly wbraid?: unknown;
}

export interface ExportOptions {
  days: number;
  conversionName: string;
}

export const CHECK_KEY_PREFIX: string;
export const CLICK_ID_FIELDS: readonly string[];
export const DEFAULT_DAYS: number;
export const DEFAULT_CONVERSION_NAME: string;
export const CONVERSION_TIME_ZONE: string;
export const CONVERSION_CURRENCY: string;
export const CSV_HEADER: readonly string[];

export function receivedAtFromKey(key: string): Date | null;
export function keysSince(keys: readonly string[], days: number, now?: Date): string[];
export function clickIdOf(record: AdLeadRecord): string | null;
export function googleAdsTime(date: Date, timeZone?: string): string;
export function conversionRows(records: readonly AdLeadRecord[], conversionName?: string): string[][];
export function conversionsCsv(records: readonly AdLeadRecord[], conversionName?: string): string;
export function parseArgs(argv: readonly string[]): ExportOptions;
