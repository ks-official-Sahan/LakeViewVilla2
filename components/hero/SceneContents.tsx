"use client";

import { useHeroStore } from "@/stores/heroStore";
import { HeroFrameLoop } from "./HeroFrameLoop";
import { CinematicCamera } from "./camera/CinematicCamera";
import { EnvironmentSystem } from "./environment/EnvironmentSystem";
import { AtmosphereSystem } from "./atmosphere/AtmosphereSystem";
import { FaunaSystem } from "./fauna/FaunaSystem";
import { FloraSystem } from "./flora/FloraSystem";
import { TerrainSystem } from "./terrain/TerrainSystem";
import { Villa } from "./villa/Villa";
import { WaterSystem } from "./water/WaterSystem";

/**
 * Hero scene entry — environment, terrain, water, flora, fauna, villa, atmosphere, camera.
 */
export function SceneContents() {
  const isMobile = useHeroStore((s) => s.isMobile);

  return (
    <>
      <HeroFrameLoop />
      <CinematicCamera />
      <EnvironmentSystem isMobile={isMobile} />
      <TerrainSystem isMobile={isMobile} />
      <WaterSystem isMobile={isMobile} />
      <FloraSystem isMobile={isMobile} />
      <FaunaSystem />
      <Villa isMobile={isMobile} />
      <AtmosphereSystem isMobile={isMobile} />
    </>
  );
}
