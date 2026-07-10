"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { ROAD_Y } from "../constants";
import { useProceduralTextures } from "../hooks/useProceduralTextures";
import type { HeroComponentProps } from "../types";
import {
  createCurbGeometry,
  createRoadTubeGeometry,
} from "./terrainGeometries";

/** Catmull-Rom tube road with twin curb boxes. */
export function Road({ isMobile = false }: HeroComponentProps) {
  const storeMobile = useHeroStore((s) => s.isMobile);
  const mobile = isMobile || storeMobile;
  const textures = useProceduralTextures(mobile);

  const { roadGeometry, curbGeometry, roadMaterial, curbMaterial } = useMemo(() => {
    const roadMat = new THREE.MeshStandardMaterial({
      map: textures.road,
      color: 0x5a5550,
      roughness: 0.96,
    });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x8a8880, roughness: 0.8 });
    return {
      roadGeometry: createRoadTubeGeometry(),
      curbGeometry: createCurbGeometry(),
      roadMaterial: roadMat,
      curbMaterial: curbMat,
    };
  }, [textures.road]);

  useEffect(() => {
    return () => {
      roadGeometry.dispose();
      curbGeometry.dispose();
      roadMaterial.dispose();
      curbMaterial.dispose();
    };
  }, [roadGeometry, curbGeometry, roadMaterial, curbMaterial]);

  return (
    <group name="road">
      <mesh geometry={roadGeometry} material={roadMaterial} position-y={ROAD_Y} />
      <mesh
        geometry={curbGeometry}
        material={curbMaterial}
        position={[0, ROAD_Y + 0.02, 1.55]}
      />
      <mesh
        geometry={curbGeometry}
        material={curbMaterial}
        position={[0, ROAD_Y + 0.02, -1.15]}
      />
    </group>
  );
}
