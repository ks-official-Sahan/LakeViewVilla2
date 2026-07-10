"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createGrassStripGeometry } from "./terrainGeometries";

/** Sloped embankment between road and lake. */
export function GrassStrip() {
  const { geometry, material } = useMemo(() => {
    const geo = createGrassStripGeometry();
    const mat = new THREE.MeshStandardMaterial({ color: 0x5e9a4e, roughness: 0.92 });
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
      position={[0, 0, -3.0]}
      name="grass-strip"
    />
  );
}
