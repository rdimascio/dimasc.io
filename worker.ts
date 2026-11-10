import { staticAssetsWorker } from "@lesto/cloudflare";

import { renderNotFound } from "./src/not-found";

export default staticAssetsWorker({ notFound: renderNotFound });
