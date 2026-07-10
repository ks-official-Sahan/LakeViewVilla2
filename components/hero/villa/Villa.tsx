"use client";

import { useEffect, useMemo } from "react";
import { useHeroStore } from "@/stores/heroStore";
import { useProceduralTextures } from "../hooks/useProceduralTextures";
import type { HeroComponentProps } from "../types";
import { buildVilla } from "./buildVilla";
import { registerVillaRuntime } from "./villaRegistry";
import { VillaLighting } from "./VillaLighting";

/** Phase 5 — villa root group, garden path, and runtime lighting. */
export function Villa({ isMobile = false }: HeroComponentProps) {
  const storeMobile = useHeroStore((s) => s.isMobile);
  const mobile = isMobile || storeMobile;
  const textures = useProceduralTextures(mobile);

  const built = useMemo(() => buildVilla(textures), [textures]);

  useEffect(() => {
    registerVillaRuntime(built.runtime);
    return () => {
      registerVillaRuntime(null);
      built.dispose();
    };
  }, [built]);

  return (
    <>
      <primitive object={built.root} />
      <primitive object={built.gardenPath} />
      <VillaLighting />
    </>
  );
}
