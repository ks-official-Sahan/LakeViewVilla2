"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { computeGoldenHourBoost, computeNightSmooth, computeWindX } from "./envKeyframes";
import { syncEnvironment } from "./sharedEnv";
import { buildCloudClusters, type CloudClusterData } from "./cloudData";
import type { HeroComponentProps } from "../types";

const cloudDayColor = new THREE.Color(0xffffff);
const cloudNightColor = new THREE.Color(0x1a2030);
const cloudSunsetColor = new THREE.Color();

export function VolumetricClouds({ isMobile = false }: HeroComponentProps) {
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const clustersRef = useRef<CloudClusterData[]>([]);

  const { material, geometries, clusters } = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      fog: false,
    });
    const built = buildCloudClusters(isMobile, mat);
    return { material: mat, geometries: built.geometries, clusters: built.clusters };
  }, [isMobile]);

  clustersRef.current = clusters;

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    };
  }, [geometries, material]);

  useFrame(() => {
    const elapsed = useHeroStore.getState().elapsed;
    const env = syncEnvironment(timeOfDay);
    const nightSmooth = computeNightSmooth(timeOfDay);
    const goldenHour = computeGoldenHourBoost(timeOfDay);
    const windX = computeWindX(timeOfDay);

    clustersRef.current.forEach((cd) => {
      cd.mesh.position.x = cd.baseX + elapsed * cd.speed * windX * 20;
      if (cd.mesh.position.x > 30) cd.mesh.position.x = -30;
      if (cd.mesh.position.x < -30) cd.mesh.position.x = 30;
    });

    cloudSunsetColor.copy(env.sun).multiplyScalar(0.8);
    if (nightSmooth > 0.5) {
      material.color.copy(cloudNightColor);
      material.opacity = 0.15;
    } else if (goldenHour > 0.3) {
      material.color.lerpColors(cloudDayColor, cloudSunsetColor, goldenHour);
      material.opacity = 0.7;
    } else {
      material.color.copy(cloudDayColor);
      material.opacity = 0.55;
    }
  });

  return (
    <group name="volumetric-clouds">
      {clusters.map((cd, i) => (
        <primitive key={`cloud-cluster-${i}`} object={cd.mesh} />
      ))}
    </group>
  );
}
