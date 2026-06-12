"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  createVillaGroundGeometry,
  VILLA_GROUND_POSITION,
} from "./terrainGeometries";

/** Villa garden ground plane. */
export function Ground() {
  const { geometry, material } = useMemo(() => {
    const geo = createVillaGroundGeometry();
    const mat = new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.94 });
    return { geometry: geo, material: mat };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={VILLA_GROUND_POSITION}
      name="villa-ground"
    />
  );
}
