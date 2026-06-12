"use client";

import { FarShore } from "./FarShore";
import { GrassStrip } from "./GrassStrip";
import { Ground } from "./Ground";
import { LakeField } from "./LakeField";
import { Road } from "./Road";
import { Rocks } from "./Rocks";
import type { HeroComponentProps } from "../types";

/** Phase 3 — ground, road, embankments, far shore, shore rocks. */
export function TerrainSystem({ isMobile = false }: HeroComponentProps) {
  return (
    <group name="terrain-system">
      <Ground />
      <Road isMobile={isMobile} />
      <GrassStrip />
      <LakeField />
      <FarShore />
      <Rocks />
    </group>
  );
}
