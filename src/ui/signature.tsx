import type { ReactElement } from "react";

import { SITE_NAME_PROPER } from "../site";
import { SIGNATURE } from "../signature";

export function Signature({ className = "", weight = 0.6 }: { className?: string; weight?: number }): ReactElement {
  return (
    <svg
      aria-label={SITE_NAME_PROPER}
      className={`signature block h-auto overflow-visible ${className}`}
      fill="currentColor"
      role="img"
      viewBox={SIGNATURE.viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{SITE_NAME_PROPER}</title>
      <path d={SIGNATURE.d} stroke="currentColor" strokeLinejoin="round" strokeWidth={weight} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
