"use client";

import { Fireflies } from "./Fireflies";
import { ForegroundLeaf } from "./ForegroundLeaf";
import { Mist } from "./Mist";
import type { HeroComponentProps } from "../types";

/** Phase 6 — mist, fireflies, camera foreground leaf. */
export function AtmosphereSystem({ isMobile = false }: HeroComponentProps) {
  return (
    <group name="atmosphere-system">
      <Mist isMobile={isMobile} />
      <Fireflies isMobile={isMobile} />
      <ForegroundLeaf isMobile={isMobile} />
    </group>
  );
}
