"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { LAKE_FIELD_ROTATION_Y } from "../constants";
import {
  createLakeFieldGeometry,
  LAKE_FIELD_POSITION,
} from "./terrainGeometries";

/** Lake field strip at ~85° CCW from road junction. */
export function LakeField() {
  const { geometry, material } = useMemo(() => {
    const geo = createLakeFieldGeometry();
    const mat = new THREE.MeshStandardMaterial({ color: 0x6aaa5a, roughness: 0.9 });
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
      rotation-y={LAKE_FIELD_ROTATION_Y}
      position={LAKE_FIELD_POSITION}
      name="lake-field"
    />
  );
}
