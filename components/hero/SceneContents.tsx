"use client";

import { CinematicCamera } from "./camera/CinematicCamera";
import { HeroWorld } from "./runtime/HeroWorld";

/**
 * Hero scene entry — imperative world builder + scroll camera.
 */
export function SceneContents() {
  return (
    <>
      <CinematicCamera />
      <HeroWorld />
    </>
  );
}
