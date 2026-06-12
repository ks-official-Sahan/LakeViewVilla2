"use client";

import { Bushes } from "./Bushes";
import { Forest } from "./Forest";
import { GrassBlades } from "./GrassBlades";
import { PalmTrees } from "./PalmTrees";
import { Reeds } from "./Reeds";
import type { HeroComponentProps } from "../types";

/** Phase 4 flora — forest, bushes, grass, reeds, palms. */
export function FloraSystem({ isMobile = false }: HeroComponentProps) {
  return (
    <group name="flora-system">
      <Forest isMobile={isMobile} />
      <Bushes />
      <GrassBlades isMobile={isMobile} />
      <Reeds />
      <PalmTrees isMobile={isMobile} />
    </group>
  );
}
