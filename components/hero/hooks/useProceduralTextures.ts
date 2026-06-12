"use client";

import { useMemo } from "react";
import type { Texture } from "three";
import { getProceduralTextures } from "../lib/procedural-textures";

export interface ProceduralTextureSet {
  wood: Texture;
  concrete: Texture;
  bark: Texture;
  road: Texture;
  palmLeaf: Texture;
  sunGlow: Texture;
  moonGlow: Texture;
}

export function useProceduralTextures(isMobile = false): ProceduralTextureSet {
  return useMemo(() => getProceduralTextures(isMobile), [isMobile]);
}
