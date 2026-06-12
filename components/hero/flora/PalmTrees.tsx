"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { useProceduralTextures } from "../hooks/useProceduralTextures";
import type { HeroComponentProps } from "../types";
import { createPalmSpawns } from "./spawns";

interface PalmAnimRef {
  group: THREE.Group;
  baseRotationZ: number;
  index: number;
}

/** Seven procedural palm trees along the embankment. */
export function PalmTrees({ isMobile = false }: HeroComponentProps) {
  const textures = useProceduralTextures(isMobile);
  const palmsRef = useRef<PalmAnimRef[]>([]);
  const { palmGroups, disposeList } = useMemo(() => {
    const spawns = createPalmSpawns(7);
    const trunkGeo = new THREE.CylinderGeometry(0.015, 0.055, 4.0, 8);
    const leafGeo = new THREE.PlaneGeometry(0.7, 1.8);
    leafGeo.translate(0, 0.9, 0);

    const trunkMat = new THREE.MeshStandardMaterial({
      map: textures.bark,
      color: 0x4a6a52,
      roughness: 0.88,
    });
    const leafMat = new THREE.MeshStandardMaterial({
      map: textures.palmLeaf,
      color: 0x5aaa78,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      roughness: 0.75,
    });

    const animRefs: PalmAnimRef[] = [];
    const groups = spawns.map((spawn) => {
      const palmTree = new THREE.Group();
      palmTree.position.set(spawn.x, spawn.y, spawn.z);
      palmTree.rotation.z = spawn.leanZ;

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.0;
      palmTree.add(trunk);

      const leavesGroup = new THREE.Group();
      leavesGroup.position.y = 4.0;
      for (let j = 0; j < 10; j++) {
        const leafMesh = new THREE.Mesh(leafGeo, leafMat);
        const angle = (j / 10) * Math.PI * 2;
        leafMesh.rotation.y = angle;
        leafMesh.rotation.x = spawn.leafTilts[j];
        leafMesh.rotation.z = spawn.leafRolls[j];
        leavesGroup.add(leafMesh);
      }
      palmTree.add(leavesGroup);

      animRefs.push({ group: palmTree, baseRotationZ: spawn.leanZ, index: spawn.index });
      return palmTree;
    });

    palmsRef.current = animRefs;

    return {
      palmGroups: groups,
      disposeList: {
        geometries: [trunkGeo, leafGeo],
        materials: [trunkMat, leafMat],
      },
    };
  }, [textures.bark, textures.palmLeaf, isMobile]);

  useEffect(() => {
    return () => {
      disposeList.geometries.forEach((g) => g.dispose());
      disposeList.materials.forEach((m) => m.dispose());
    };
  }, [disposeList]);

  useFrame(() => {
    const elapsed = useHeroStore.getState().elapsed;

    palmsRef.current.forEach((palm) => {
      palm.group.rotation.z = palm.baseRotationZ + Math.sin(elapsed * 0.75 + palm.index) * 0.025;
      palm.group.rotation.x = Math.cos(elapsed * 0.6 + palm.index) * 0.012;
    });
  });

  return (
    <group name="palms">
      {palmGroups.map((group, index) => (
        <primitive key={index} object={group} />
      ))}
    </group>
  );
}
