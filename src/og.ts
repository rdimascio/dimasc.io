import { ogImage as brandedOgImage } from "@lesto/seo";

import { SITE_NAME } from "./site";

const INK = "#111113";
const INK_SOFT = "#2a2a30";

export function ogImage(): string {
  return brandedOgImage({
    wordmark: SITE_NAME,
    title: ["Software that fixes", "what slows you down."],
    description: "Websites, stores, integrations and AI tools for small businesses.",
    footer: "dimasc.io",
    colors: {
      gradientFrom: INK,
      gradientTo: INK_SOFT,
      title: "#ffffff",
      accent: "#d4d4d8",
      mark: INK,
      description: "#e4e4e7",
      footer: "#a1a1aa",
    },
  });
}
