export const LOGO_SOURCE_DIR = "assets/logos";
const LOGO_DIR = "images/logos";
const OPTICAL_EXPONENT = -0.32;

export interface BrandLogo {
  readonly slug: string;
  readonly name: string;
  readonly ratio: number;
  readonly weightCompensation?: number;
}

export const BRAND_LOGOS: readonly BrandLogo[] = [
  { slug: "microsoft", name: "Microsoft", ratio: 4.689 },
  { slug: "starbucks", name: "Starbucks", ratio: 1 },
  { slug: "stanford", name: "Stanford", ratio: 4.772 },
  { slug: "blackstone", name: "Blackstone", ratio: 2.519, weightCompensation: 1.15 },
  { slug: "holt-international", name: "Holt International", ratio: 5.935, weightCompensation: 1.15 },
  { slug: "serhant", name: "SERHANT.", ratio: 6.077 },
  { slug: "luxury-presence", name: "Luxury Presence", ratio: 2.833, weightCompensation: 1.2 },
  { slug: "10up", name: "10up", ratio: 0.874, weightCompensation: 0.85 },
  { slug: "every", name: "Every", ratio: 3.929 },
];

export function logoSrc(logo: Pick<BrandLogo, "slug">): string {
  return `/${LOGO_DIR}/${logo.slug}.svg`;
}

export function logoOutputDir(): string {
  return LOGO_DIR;
}

export function opticalScale(logo: Pick<BrandLogo, "ratio" | "weightCompensation">): number {
  return Math.round(logo.ratio ** OPTICAL_EXPONENT * (logo.weightCompensation ?? 1) * 1000) / 1000;
}
