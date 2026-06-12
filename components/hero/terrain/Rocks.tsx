"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createMergedRocksGeometry } from "./terrainGeometries";

/** Merged static shore rocks — single draw call. */
export function Rocks() {
  const { geometry, material } = useMemo(() => {
    const geo = createMergedRocksGeometry();
    const mat = new THREE.MeshStandardMaterial({ color: 0x5a7a72, roughness: 0.82 });
    return { geometry: geo, material: mat };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <mesh geometry={geometry} material={material} name="shore-rocks" />;
}
