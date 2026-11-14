import { staticAssetsWorker } from "@lesto/cloudflare";

import { renderNotFound } from "./src/not-found";
import { canonicalRedirect } from "./src/redirect";

type AssetsWorker = ReturnType<typeof staticAssetsWorker>;

const assets = staticAssetsWorker({ notFound: renderNotFound });

export default {
  fetch(...[request, env, ctx]: Parameters<AssetsWorker["fetch"]>): Promise<Response> {
    const redirect = canonicalRedirect(request);
    return redirect === null ? assets.fetch(request, env, ctx) : Promise.resolve(redirect);
  },
} satisfies AssetsWorker;
