"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { useProceduralTextures } from "../hooks/useProceduralTextures";
import type { HeroComponentProps } from "../types";
import { getHeroLod } from "../performance";
import { createForestSpawns, getForestTreeY } from "./spawns";

const dummy = new THREE.Object3D();

/** Instanced tropical forest — 3 draw calls (trunks, cone crowns, sphere crowns). */
export function Forest({ isMobile = false }: HeroComponentProps) {
  const storeMobile = useHeroStore((s) => s.isMobile);
  const mobile = isMobile || storeMobile;
  const textures = useProceduralTextures(mobile);

  const { trunks, coneCrowns, sphereCrowns, disposeList } = useMemo(() => {
    const count = getHeroLod(mobile).forestTrees;
    const spawns = createForestSpawns(count);

    const trunkMat = new THREE.MeshStandardMaterial({
      map: textures.bark,
      color: 0x3d4a32,
      roughness: 0.9,
    });
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x2d6a48, roughness: 0.85 });
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x357a52, roughness: 0.82 });

    const trunkGeo = new THREE.CylinderGeometry(0.05, 0.12, 1.4, 6);
    const coneGeo = new THREE.ConeGeometry(0.65, 1.0, 7);
    const sphereGeo = new THREE.IcosahedronGeometry(0.55, 1);

    const trunksMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const coneMesh = new THREE.InstancedMesh(coneGeo, coneMat, count);
    const sphereMesh = new THREE.InstancedMesh(sphereGeo, sphereMat, count);

    spawns.forEach((spawn, f) => {
      const treeY = getForestTreeY(spawn.x, spawn.z);

      dummy.position.set(spawn.x, treeY - 0.05, spawn.z);
      dummy.rotation.set(0, 0, spawn.leanZ);
      dummy.scale.set(1, spawn.treeHeight, 1);
      dummy.updateMatrix();
      trunksMesh.setMatrixAt(f, dummy.matrix);

      if (spawn.isConifer) {
        dummy.position.set(spawn.x, treeY + 1.3 * spawn.treeHeight, spawn.z);
        dummy.rotation.set(0, 0, spawn.leanZ);
        dummy.scale.set(spawn.treeHeight, spawn.treeHeight, spawn.treeHeight);
        dummy.updateMatrix();
        coneMesh.setMatrixAt(f, dummy.matrix);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        sphereMesh.setMatrixAt(f, dummy.matrix);
      } else {
        dummy.position.set(spawn.x, treeY + 1.5 * spawn.treeHeight, spawn.z);
        dummy.rotation.set(0, 0, spawn.leanZ);
        dummy.scale.set(1.1 * spawn.treeHeight, 0.8 * spawn.treeHeight, 1.1 * spawn.treeHeight);
        dummy.updateMatrix();
        sphereMesh.setMatrixAt(f, dummy.matrix);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        coneMesh.setMatrixAt(f, dummy.matrix);
      }
    });

    trunksMesh.instanceMatrix.needsUpdate = true;
    coneMesh.instanceMatrix.needsUpdate = true;
    sphereMesh.instanceMatrix.needsUpdate = true;

    return {
      trunks: trunksMesh,
      coneCrowns: coneMesh,
      sphereCrowns: sphereMesh,
      disposeList: {
        geometries: [trunkGeo, coneGeo, sphereGeo],
        materials: [trunkMat, coneMat, sphereMat],
      },
    };
  }, [mobile, textures.bark]);

  useEffect(() => {
    return () => {
      disposeList.geometries.forEach((g) => g.dispose());
      disposeList.materials.forEach((m) => m.dispose());
    };
  }, [disposeList]);

  return (
    <group name="forest">
      <primitive object={trunks} />
      <primitive object={coneCrowns} />
      <primitive object={sphereCrowns} />
    </group>
  );
}
