"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createBushSpawns } from "./spawns";

const dummy = new THREE.Object3D();
const BUSH_COUNT = 18;

/** Instanced embankment bushes — single draw call. */
export function Bushes() {
  const { instanced, disposeList } = useMemo(() => {
    const spawns = createBushSpawns(BUSH_COUNT);
    const geo = new THREE.IcosahedronGeometry(0.25, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a8a52, roughness: 0.9 });
    const mesh = new THREE.InstancedMesh(geo, mat, BUSH_COUNT);

    spawns.forEach((spawn, b) => {
      dummy.position.set(spawn.x, spawn.y, spawn.z);
      dummy.rotation.set(0, spawn.rotY, 0);
      dummy.scale.set(spawn.scaleX, spawn.scaleY, spawn.scaleZ);
      dummy.updateMatrix();
      mesh.setMatrixAt(b, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

    return { instanced: mesh, disposeList: { geometries: [geo], materials: [mat] } };
  }, []);

  useEffect(() => {
    return () => {
      disposeList.geometries.forEach((g) => g.dispose());
      disposeList.materials.forEach((m) => m.dispose());
    };
  }, [disposeList]);

  return <primitive object={instanced} />;
}
