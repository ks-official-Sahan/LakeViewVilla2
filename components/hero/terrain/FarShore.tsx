"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { getTerrainHeight } from "../lib/terrain-height";
import {
  createFarTerrainGeometry,
  createShoreWedgeGeometry,
} from "./terrainGeometries";

const MOUNTAIN_SPECS = [
  { radius: 6.5, height: 5.5, segments: 10, color: 0x4a6a62, roughness: 0.95, x: -7, z: -28, yOffset: 2.75 },
  { radius: 5.0, height: 4.2, segments: 10, color: 0x3d5e55, roughness: 0.92, x: 5, z: -30, yOffset: 2.1 },
  { radius: 4.0, height: 3.5, segments: 8, color: 0x4a6a62, roughness: 0.95, x: 0, z: -32, yOffset: 1.75 },
] as const;

/** Far shore wedge, background terrain, and silhouette mountains. */
export function FarShore() {
  const shore = useMemo(() => {
    const geometry = createShoreWedgeGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x4a7a52, roughness: 0.94 });
    return { geometry, material };
  }, []);

  const farTerrain = useMemo(() => {
    const geometry = createFarTerrainGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0x3d5a42,
      roughness: 0.95,
      metalness: 0.02,
    });
    return { geometry, material };
  }, []);

  const mountains = useMemo(
    () =>
      MOUNTAIN_SPECS.map((spec) => {
        const geometry = new THREE.ConeGeometry(spec.radius, spec.height, spec.segments);
        const material = new THREE.MeshStandardMaterial({
          color: spec.color,
          roughness: spec.roughness,
        });
        const y = getTerrainHeight(spec.x, spec.z) + spec.yOffset;
        return { geometry, material, position: [spec.x, y, spec.z] as const };
      }),
    []
  );

  useEffect(() => {
    return () => {
      shore.geometry.dispose();
      shore.material.dispose();
      farTerrain.geometry.dispose();
      farTerrain.material.dispose();
      mountains.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
    };
  }, [shore, farTerrain, mountains]);

  return (
    <group name="far-shore">
      <mesh
        geometry={shore.geometry}
        material={shore.material}
        position={[0, 0, -17]}
      />
      <mesh
        geometry={farTerrain.geometry}
        material={farTerrain.material}
        position={[0, 0, -28]}
      />
      {mountains.map((mountain, index) => (
        <mesh
          key={index}
          geometry={mountain.geometry}
          material={mountain.material}
          position={mountain.position}
        />
      ))}
    </group>
  );
}
