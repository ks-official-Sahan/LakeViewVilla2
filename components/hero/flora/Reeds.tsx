"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { createReedSpawns } from "./spawns";

const REED_COUNT = 30;
const reedDummy = new THREE.Object3D();

/** Instanced lakeshore reeds with wind sway. */
export function Reeds() {
  const { instanced, spawns, disposeList } = useMemo(() => {
    const spawnList = createReedSpawns(REED_COUNT);
    const geo = new THREE.PlaneGeometry(0.05, 0.75);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x5cb87a,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, REED_COUNT);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    spawnList.forEach((spawn, r) => {
      reedDummy.position.set(spawn.x, spawn.y, spawn.z);
      reedDummy.rotation.set(0, spawn.baseRotY, spawn.baseRotZ);
      reedDummy.updateMatrix();
      mesh.setMatrixAt(r, reedDummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

    return {
      instanced: mesh,
      spawns: spawnList,
      disposeList: { geometries: [geo], materials: [mat] },
    };
  }, []);

  useEffect(() => {
    return () => {
      disposeList.geometries.forEach((g) => g.dispose());
      disposeList.materials.forEach((m) => m.dispose());
    };
  }, [disposeList]);

  useFrame(() => {
    const elapsed = useHeroStore.getState().elapsed;

    spawns.forEach((reed, index) => {
      const sway = Math.sin(elapsed * 1.2 + reed.phase) * 0.12;
      reedDummy.position.set(reed.x, reed.y, reed.z);
      reedDummy.rotation.set(sway * 0.3, reed.baseRotY, reed.baseRotZ + sway);
      reedDummy.updateMatrix();
      instanced.setMatrixAt(index, reedDummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
  });

  return <primitive object={instanced} />;
}
