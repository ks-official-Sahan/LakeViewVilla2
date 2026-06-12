"use client";

import { EnvironmentLighting } from "./EnvironmentLighting";
import { SkyDome } from "./SkyDome";
import { CelestialBodies } from "./CelestialBodies";
import { VolumetricClouds } from "./VolumetricClouds";
import type { HeroComponentProps } from "../types";

/** Phase 1 environment stack — lighting, sky, celestial bodies, 3D clouds. */
export function EnvironmentSystem({ isMobile = false }: HeroComponentProps) {
  return (
    <group name="environment">
      <EnvironmentLighting isMobile={isMobile} />
      <SkyDome isMobile={isMobile} />
      <CelestialBodies isMobile={isMobile} />
      <VolumetricClouds isMobile={isMobile} />
    </group>
  );
}
