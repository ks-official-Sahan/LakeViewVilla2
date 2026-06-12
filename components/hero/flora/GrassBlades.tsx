"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import type { HeroComponentProps } from "../types";
import { getHeroLod } from "../performance";
import { createGrassBladeSpawns } from "./spawns";

const dummy = new THREE.Object3D();

/** Instanced slope grass blades — single draw call. */
export function GrassBlades({ isMobile = false }: HeroComponentProps) {
  const storeMobile = useHeroStore((s) => s.isMobile);
  const mobile = isMobile || storeMobile;

  const { instanced, disposeList } = useMemo(() => {
    const count = getHeroLod(mobile).grassBlades;
    const spawns = createGrassBladeSpawns(count);
    const geo = new THREE.PlaneGeometry(0.03, 0.2);
    geo.translate(0, 0.1, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x5a9a4e,
      side: THREE.DoubleSide,
      roughness: 0.92,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, count);

    spawns.forEach((spawn, i) => {
      dummy.position.set(spawn.x, spawn.y, spawn.z);
      dummy.rotation.set(0, spawn.baseRotY, spawn.baseRotZ);
      dummy.scale.set(spawn.scaleX, spawn.scaleY, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

    return { instanced: mesh, disposeList: { geometries: [geo], materials: [mat] } };
  }, [mobile]);

  useEffect(() => {
    return () => {
      disposeList.geometries.forEach((g) => g.dispose());
      disposeList.materials.forEach((m) => m.dispose());
    };
  }, [disposeList]);

  return <primitive object={instanced} />;
}
