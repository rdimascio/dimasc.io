import type { ReactElement } from "react";

import { type JsonLd as JsonLdData, jsonLdText } from "../structured-data";

export const JSON_LD_TYPE = "application/ld+json";

export function JsonLd({ data }: { data: JsonLdData }): ReactElement {
  return <script type={JSON_LD_TYPE} dangerouslySetInnerHTML={{ __html: jsonLdText(data) }} />;
}
