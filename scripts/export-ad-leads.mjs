#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CHECK_KEY_PREFIX = "check:";
export const CLICK_ID_FIELDS = ["gclid", "gbraid", "wbraid"];
export const DEFAULT_DAYS = 30;
export const DEFAULT_CONVERSION_NAME = "site check lead";
export const CONVERSION_TIME_ZONE = "America/Los_Angeles";
export const CONVERSION_CURRENCY = "USD";
export const CSV_HEADER = ["Google Click ID", "Conversion Name", "Conversion Time", "Conversion Value", "Conversion Currency"];

const DAY_MS = 24 * 60 * 60 * 1000;
const CLICK_ID_SHAPE = /^[A-Za-z0-9_-]{1,200}$/;
const CSV_NEEDS_QUOTES = /[",\r\n]/;
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WRANGLER = join(REPO_ROOT, "node_modules", ".bin", "wrangler");
const KV_TARGET = ["--binding", "REQUESTS", "--remote", "--config", "wrangler.jsonc"];

export function receivedAtFromKey(key) {
  if (!key.startsWith(CHECK_KEY_PREFIX)) return null;
  const rest = key.slice(CHECK_KEY_PREFIX.length);
  const time = Date.parse(rest.slice(0, rest.lastIndexOf(":")));
  return Number.isNaN(time) ? null : new Date(time);
}

export function keysSince(keys, days, now = new Date()) {
  const since = now.getTime() - days * DAY_MS;
  return keys.filter((key) => {
    const receivedAt = receivedAtFromKey(key);
    return receivedAt !== null && receivedAt.getTime() >= since;
  });
}

export function clickIdOf(record) {
  for (const field of CLICK_ID_FIELDS) {
    const value = record[field];
    if (typeof value === "string" && CLICK_ID_SHAPE.test(value)) return value;
  }
  return null;
}

export function googleAdsTime(date, timeZone = CONVERSION_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type) => parts.find((candidate) => candidate.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}:${part("second")} ${timeZone}`;
}

function csvCell(value) {
  return CSV_NEEDS_QUOTES.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function conversionRows(records, conversionName = DEFAULT_CONVERSION_NAME) {
  return records.flatMap((record) => {
    const clickId = clickIdOf(record);
    const receivedAt = Date.parse(record.receivedAt);
    if (clickId === null || Number.isNaN(receivedAt)) return [];
    return [[clickId, conversionName, googleAdsTime(new Date(receivedAt)), "", CONVERSION_CURRENCY]];
  });
}

export function conversionsCsv(records, conversionName = DEFAULT_CONVERSION_NAME) {
  const rows = [CSV_HEADER, ...conversionRows(records, conversionName)];
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

export function parseArgs(argv) {
  const options = { days: DEFAULT_DAYS, conversionName: DEFAULT_CONVERSION_NAME };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === "--days" && value !== undefined) {
      options.days = Number(value);
      index += 1;
    } else if (flag === "--name" && value !== undefined) {
      options.conversionName = value;
      index += 1;
    } else {
      throw new Error(`unknown argument: ${flag}. usage: node scripts/export-ad-leads.mjs [--days 30] [--name "site check lead"]`);
    }
  }
  if (!Number.isFinite(options.days) || options.days <= 0) throw new Error("--days must be a positive number");
  return options;
}

function wrangler(args) {
  return execFileSync(WRANGLER, ["kv", "key", ...args, ...KV_TARGET], { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
}

function main() {
  const { days, conversionName } = parseArgs(process.argv.slice(2));
  const listed = JSON.parse(wrangler(["list", "--prefix", CHECK_KEY_PREFIX]));
  const keys = keysSince(listed.map((entry) => entry.name), days);
  const records = keys.map((key) => JSON.parse(wrangler(["get", key])));
  const csv = conversionsCsv(records, conversionName);
  process.stdout.write(csv);
  console.error(`${records.length} requests in the last ${days} days, ${conversionRows(records).length} with an ad click id`);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
