"use client";

import { Lake } from "./Lake";
import { LilyPads } from "./LilyPads";
import type { HeroComponentProps } from "../types";

/** Phase 2 — lake surface + instanced lily pads / lotus. */
export function WaterSystem({ isMobile = false }: HeroComponentProps) {
  return (
    <group name="water-system">
      <Lake isMobile={isMobile} />
      <LilyPads isMobile={isMobile} />
    </group>
  );
}
