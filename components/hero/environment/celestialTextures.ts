import * as THREE from "three";
import { getProceduralTextures } from "../lib/procedural-textures";

const cache = new Map<boolean, { sunGlow: THREE.Texture; moonGlow: THREE.Texture }>();

export function getCelestialTextures(isMobile: boolean) {
  const key = isMobile;
  if (!cache.has(key)) {
    const tex = getProceduralTextures(isMobile);
    cache.set(key, { sunGlow: tex.sunGlow, moonGlow: tex.moonGlow });
  }
  return cache.get(key)!;
}
