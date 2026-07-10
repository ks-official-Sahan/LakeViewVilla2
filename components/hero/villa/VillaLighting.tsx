"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { computeNightSmooth } from "../environment/envKeyframes";
import { syncEnvironment } from "../environment/sharedEnv";
import { getWaterUniforms } from "../water/waterRegistry";
import { getVillaRuntime } from "./villaRegistry";

const tempViewPos = new THREE.Vector3();
const tempWorldPos = new THREE.Vector3();

/** Night window glow, interior fill, garden lantern, and water lantern sync. */
export function VillaLighting() {
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const camera = useThree((s) => s.camera);

  useFrame(() => {
    const refs = getVillaRuntime();
    if (!refs) return;

    const env = syncEnvironment(timeOfDay);
    const nightVal = computeNightSmooth(timeOfDay);

    refs.windowMat.emissive.setHex(0xffaa44);
    refs.windowMat.emissiveIntensity = nightVal * 0.6;
    refs.interiorLight.intensity = 0.25 + nightVal * 1.55;
    refs.warmLight.intensity = env.lanternIntensity * 2.2;

    const waterUniforms = getWaterUniforms();
    if (!waterUniforms) return;

    tempViewPos.copy(refs.bulbSphere.position);
    tempViewPos.applyMatrix4(refs.villaGroup.matrixWorld);
    tempViewPos.applyMatrix4(camera.matrixWorldInverse);

    tempWorldPos.copy(refs.bulbSphere.position);
    tempWorldPos.applyMatrix4(refs.villaGroup.matrixWorld);
    waterUniforms.uLanternPlanePos.value.set(tempWorldPos.x, -tempWorldPos.z);
    waterUniforms.uLanternViewPosition.value.copy(tempViewPos);
  });

  return null;
}
