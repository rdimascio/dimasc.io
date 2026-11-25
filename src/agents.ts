import { clickContext, type EventEnv, isBot, recordEvent, SITE_EVENT, type SiteEvent } from "./measure";
import { teardownHref } from "./site";

export const AGENTS_ROUTE = "/agents";
export const AGENTS_KIT_ROUTE = `${AGENTS_ROUTE}/kit`;
export const AGENTS_TEARDOWN_ROUTE = `${AGENTS_ROUTE}/teardown`;
export const KIT_REPO_URL = "https://github.com/rdimascio/agent-guardrails";
export const TEARDOWN_CTA = "book a free 20-min teardown";

interface ClickRoute {
  readonly event: SiteEvent;
  readonly target: () => string;
}

const CLICK_ROUTES: Readonly<Record<string, ClickRoute>> = {
  [AGENTS_KIT_ROUTE]: { event: SITE_EVENT.kitClick, target: () => KIT_REPO_URL },
  [AGENTS_TEARDOWN_ROUTE]: { event: SITE_EVENT.teardownClick, target: teardownHref },
};

const READ_METHODS = new Set(["GET", "HEAD"]);

export function isAgentsClickRoute(pathname: string): boolean {
  return Object.hasOwn(CLICK_ROUTES, pathname);
}

export function handleAgentsClick(request: Request, env: EventEnv): Response {
  const route = CLICK_ROUTES[new URL(request.url).pathname];
  if (route === undefined || !READ_METHODS.has(request.method)) return new Response("method not allowed", { status: 405 });
  if (!isBot(request)) recordEvent(env, route.event, () => clickContext(request));
  return new Response(null, { status: 302, headers: { location: route.target(), "cache-control": "no-store" } });
}
