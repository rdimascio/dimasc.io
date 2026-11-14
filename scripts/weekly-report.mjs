#!/usr/bin/env node
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DATASET = "dimasc_events";
export const ACCOUNT_ENV = "DIMASC_CF_ACCOUNT_ID";
export const TOKEN_ENV = "DIMASC_ANALYTICS_TOKEN";
export const WINDOW_DAYS = 7;
export const TOP_SOURCES = 5;
export const SAME_SITE_REFERRER = "self";
export const DIRECT_SOURCE = "(direct)";
export const COUNTED_EVENTS = {
  formViews: "form_view",
  submits: "form_submit",
  leads: "stored",
};

const API_ROOT = "https://api.cloudflare.com/client/v4/accounts";

export function windowFilter(window) {
  const start = window === "current" ? WINDOW_DAYS : WINDOW_DAYS * 2;
  const end = window === "current" ? 0 : WINDOW_DAYS;
  const upper = end === 0 ? "" : ` AND timestamp <= NOW() - INTERVAL '${end}' DAY`;
  return `timestamp > NOW() - INTERVAL '${start}' DAY${upper}`;
}

export function eventsSql(window) {
  return `SELECT blob1 AS event, SUM(_sample_interval) AS n FROM ${DATASET} WHERE ${windowFilter(window)} GROUP BY event FORMAT JSON`;
}

export function sourcesSql(window) {
  return `SELECT blob4 AS utm_source, blob3 AS referrer_host, SUM(_sample_interval) AS n FROM ${DATASET} WHERE blob1 = 'page_view' AND blob3 != '${SAME_SITE_REFERRER}' AND ${windowFilter(window)} GROUP BY utm_source, referrer_host FORMAT JSON`;
}

export function sourceOf(row) {
  if (row.utm_source !== "") return row.utm_source;
  if (row.referrer_host !== "") return row.referrer_host;
  return DIRECT_SOURCE;
}

export function summarize(eventRows, sourceRows) {
  const byEvent = new Map(eventRows.map((row) => [row.event, Number(row.n)]));
  const count = (event) => byEvent.get(event) ?? 0;
  const sources = new Map();
  for (const row of sourceRows) sources.set(sourceOf(row), (sources.get(sourceOf(row)) ?? 0) + Number(row.n));
  const visits = [...sources.values()].reduce((total, n) => total + n, 0);
  return {
    visits,
    formViews: count(COUNTED_EVENTS.formViews),
    submits: count(COUNTED_EVENTS.submits),
    leads: count(COUNTED_EVENTS.leads),
    sources,
  };
}

function change(current, prior) {
  const delta = current - prior;
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

export function formatReport(current, prior) {
  const line = (label, key) => `${label.padEnd(12)}${String(current[key]).padStart(6)}  (prior ${prior[key]}, ${change(current[key], prior[key])})`;
  const top = [...current.sources.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_SOURCES);
  const sourceLines = top.length === 0 ? ["  (none)"] : top.map(([name, n]) => `  ${name.padEnd(24)}${String(n).padStart(6)}  (prior ${prior.sources.get(name) ?? 0})`);
  return [
    `last ${WINDOW_DAYS} days vs the ${WINDOW_DAYS} before`,
    line("visits", "visits"),
    line("form views", "formViews"),
    line("submits", "submits"),
    line("leads", "leads"),
    "top sources",
    ...sourceLines,
    "",
  ].join("\n");
}

export function readConfig(env) {
  const accountId = env[ACCOUNT_ENV] ?? env.CLOUDFLARE_ACCOUNT_ID ?? "";
  const token = env[TOKEN_ENV] ?? "";
  if (accountId === "" || token === "") throw new Error(`set ${ACCOUNT_ENV} and ${TOKEN_ENV} (a token with Account Analytics:Read)`);
  return { accountId, token };
}

async function query(config, sql) {
  const response = await fetch(`${API_ROOT}/${config.accountId}/analytics_engine/sql`, {
    method: "POST",
    headers: { authorization: `Bearer ${config.token}` },
    body: sql,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`analytics engine sql api: http ${response.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text).data ?? [];
}

async function windowSummary(config, window) {
  const [events, sources] = await Promise.all([query(config, eventsSql(window)), query(config, sourcesSql(window))]);
  return summarize(events, sources);
}

async function main() {
  const config = readConfig(process.env);
  const [current, prior] = await Promise.all([windowSummary(config, "current"), windowSummary(config, "prior")]);
  process.stdout.write(formatReport(current, prior));
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
