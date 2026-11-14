import { staticAssetsWorker } from "@lesto/cloudflare";

import { type CheckEnv, handleCheck, isCheckFormPage, isCheckRoute, withFormFilled, withParamsCarried } from "./src/check";
import { recordPageView } from "./src/measure";
import { renderNotFound } from "./src/not-found";
import { canonicalRedirect } from "./src/redirect";

type AssetsWorker = ReturnType<typeof staticAssetsWorker>;
type AssetsArgs = Parameters<AssetsWorker["fetch"]>;
type SiteEnv = AssetsArgs[1] & CheckEnv;

const assets = staticAssetsWorker({ notFound: renderNotFound });

export default {
  async fetch(request: Request, env: SiteEnv, ctx: AssetsArgs[2]): Promise<Response> {
    const redirect = canonicalRedirect(request);
    if (redirect !== null) return redirect;
    const url = new URL(request.url);
    if (isCheckRoute(url.pathname)) return handleCheck(request, env, ctx);
    const response = await assets.fetch(request, env, ctx);
    const isFormPage = isCheckFormPage(url.pathname);
    recordPageView(env, request, response, isFormPage);
    const filled = isFormPage ? withFormFilled(response, url) : response;
    return withParamsCarried(filled, url);
  },
};
