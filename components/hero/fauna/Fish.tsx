"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { WATER_Y } from "../constants";
import {
  computeIsNight,
  computeWindX,
} from "../environment/envKeyframes";
import { syncEnvironment } from "../environment/sharedEnv";
import type { HeroComponentProps } from "../types";
import { getWaveHeightAt } from "../water/waveHeight";
import {
  createFishSpawns,
  FISH_INITIAL_Y,
  FISH_SUBMERGE_OFFSET,
} from "./spawns";

const FISH_COUNT = 14;
const fishDummy = new THREE.Object3D();

/** Instanced lake fish with swim paths tied to wave height. */
export function Fish(_props: HeroComponentProps = {}) {
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const { instanced, spawns, disposeList } = useMemo(() => {
    const spawnList = createFishSpawns(FISH_COUNT);
    const geo = new THREE.SphereGeometry(0.05, 6, 4);
    geo.scale(1.2, 0.45, 2.2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffa040,
      emissive: 0x442200,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.82,
      roughness: 0.4,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, FISH_COUNT);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    spawnList.forEach((spawn, i) => {
      fishDummy.position.set(spawn.x, FISH_INITIAL_Y, spawn.z);
      fishDummy.rotation.set(0, spawn.rotY, 0);
      fishDummy.updateMatrix();
      mesh.setMatrixAt(i, fishDummy.matrix);
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
    const env = syncEnvironment(timeOfDay);
    const isNightVal = computeIsNight(timeOfDay);
    const isNight = isNightVal > 0.5;
    const windX = computeWindX(timeOfDay);

    spawns.forEach((fish, index) => {
      const swim = elapsed * fish.speed + fish.phase;
      const fx = fish.x + Math.sin(swim) * fish.radius + windX * elapsed * 0.01;
      const fz = fish.z + Math.cos(swim * 0.8) * fish.radius * 0.6;
      const fy =
        WATER_Y +
        getWaveHeightAt(fx, fz, elapsed, env.waveSpeed, env.waveAmplitude) -
        FISH_SUBMERGE_OFFSET;

      fishDummy.position.set(fx, fy, fz);
      fishDummy.rotation.y = Math.atan2(
        Math.cos(swim * 0.8) * fish.radius * 0.6,
        Math.cos(swim) * fish.radius
      );
      fishDummy.updateMatrix();
      instanced.setMatrixAt(index, fishDummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
    instanced.visible = !isNight || env.lanternIntensity > 0.5;
  });

  return <primitive object={instanced} />;
}
