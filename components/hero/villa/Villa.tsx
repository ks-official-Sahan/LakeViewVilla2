"use client";

import type { HeroComponentProps } from "../types";
import { VillaExterior } from "./VillaExterior";
import { VillaInterior } from "./VillaInterior";
import { VillaLighting } from "./VillaLighting";

/** Phase 5 — villa root group. */
export function Villa({ isMobile }: HeroComponentProps = {}) {
  return (
    <group name="villa">
      <VillaExterior isMobile={isMobile} />
      <VillaInterior isMobile={isMobile} />
      <VillaLighting isMobile={isMobile} />
    </group>
  );
}
