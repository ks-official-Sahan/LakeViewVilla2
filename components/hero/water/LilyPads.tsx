"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { WATER_Y } from "../constants";
import { syncEnvironment } from "../environment/sharedEnv";
import type { HeroComponentProps } from "../types";
import { createPadSpawns, LILY_PAD_COUNT, LOTUS_BLOOM_COUNT } from "./padSpawns";
import { getWaveHeightAt } from "./waveHeight";

const dummy = new THREE.Object3D();

export function LilyPads(_props: HeroComponentProps = {}) {
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const { spawns, padMesh, lotusBloomMesh, lotusCenterMesh } = useMemo(() => {
    const padSpawns = createPadSpawns();

    const padGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.01, 12);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0xa8ddb8,
      roughness: 0.7,
      emissive: 0x1a4a38,
      emissiveIntensity: 0.15,
    });

    const lotusGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.025, 8);
    const lotusMat = new THREE.MeshStandardMaterial({
      color: 0xf4b8c8,
      emissive: 0x6a2848,
      emissiveIntensity: 0.25,
      roughness: 0.65,
    });

    const centerGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xffe8a0,
      emissive: 0x8a6020,
      emissiveIntensity: 0.3,
    });

    const pads = new THREE.InstancedMesh(padGeo, padMat, LILY_PAD_COUNT);
    pads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const blooms = new THREE.InstancedMesh(lotusGeo, lotusMat, LOTUS_BLOOM_COUNT);
    blooms.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const centers = new THREE.InstancedMesh(centerGeo, centerMat, LOTUS_BLOOM_COUNT);
    centers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    padSpawns.forEach((spawn, i) => {
      const leafScale = spawn.isLotusLeaf ? spawn.scale * 1.15 : spawn.scale;
      dummy.position.set(spawn.x, WATER_Y, spawn.z);
      dummy.rotation.set(0, spawn.rotY, 0);
      dummy.scale.set(leafScale, 1, leafScale);
      dummy.updateMatrix();
      pads.setMatrixAt(i, dummy.matrix);
    });
    pads.instanceMatrix.needsUpdate = true;

    return {
      spawns: padSpawns,
      padMesh: pads,
      lotusBloomMesh: blooms,
      lotusCenterMesh: centers,
      geometries: [padGeo, lotusGeo, centerGeo],
      materials: [padMat, lotusMat, centerMat],
    };
  }, []);

  const resources = useMemo(
    () => ({
      geometries: [
        padMesh.geometry,
        lotusBloomMesh.geometry,
        lotusCenterMesh.geometry,
      ],
      materials: [
        padMesh.material,
        lotusBloomMesh.material,
        lotusCenterMesh.material,
      ],
    }),
    [padMesh, lotusBloomMesh, lotusCenterMesh]
  );

  useEffect(() => {
    return () => {
      resources.geometries.forEach((g) => g.dispose());
      resources.materials.forEach((m) => m.dispose());
    };
  }, [resources]);

  useFrame(() => {
    const elapsed = useHeroStore.getState().elapsed;
    const env = syncEnvironment(timeOfDay);
    const waveAmp = env.waveAmplitude * 0.85;

    spawns.forEach((spawn, i) => {
      const waveH = getWaveHeightAt(spawn.x, spawn.z, elapsed, env.waveSpeed, waveAmp);
      const waterY = WATER_Y + waveH + 0.005;
      const leafScale = spawn.isLotusLeaf ? spawn.scale * 1.15 : spawn.scale;

      dummy.position.set(spawn.x, waterY, spawn.z);
      dummy.rotation.set(
        Math.cos(elapsed * env.waveSpeed + spawn.phase) * 0.02,
        spawn.rotY,
        Math.sin(elapsed * env.waveSpeed + spawn.phase) * 0.04
      );
      dummy.scale.set(leafScale, 1, leafScale);
      dummy.updateMatrix();
      padMesh.setMatrixAt(i, dummy.matrix);

      if (spawn.hasLotus && spawn.lotusIndex >= 0) {
        dummy.position.set(spawn.x, waterY + 0.02, spawn.z);
        dummy.rotation.set(0, spawn.rotY, 0);
        dummy.scale.setScalar(spawn.scale);
        dummy.updateMatrix();
        lotusBloomMesh.setMatrixAt(spawn.lotusIndex, dummy.matrix);

        dummy.position.set(spawn.x, waterY + 0.035, spawn.z);
        dummy.updateMatrix();
        lotusCenterMesh.setMatrixAt(spawn.lotusIndex, dummy.matrix);
      }
    });

    padMesh.instanceMatrix.needsUpdate = true;
    lotusBloomMesh.instanceMatrix.needsUpdate = true;
    lotusCenterMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="lily-pads">
      <primitive object={padMesh} />
      <primitive object={lotusBloomMesh} />
      <primitive object={lotusCenterMesh} />
    </group>
  );
}
