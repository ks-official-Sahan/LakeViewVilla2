"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { computeIsNight } from "../environment/envKeyframes";
import { syncEnvironment } from "../environment/sharedEnv";
import { getHeroLod } from "../performance";
import type { HeroComponentProps } from "../types";
import { createFireflySpriteTexture } from "./particleTextures";
import { createFireflySpawns } from "./spawns";

/** Night firefly particles over the lagoon fringe. */
export function Fireflies({ isMobile = false }: HeroComponentProps) {
  const scrollProgress = useHeroStore((s) => s.scrollProgress);
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const { points, spawns, disposeList } = useMemo(() => {
    const count = getHeroLod(isMobile).fireflies;
    const spawnList = createFireflySpawns(count);
    const positions = new Float32Array(count * 3);
    spawnList.forEach((spawn, i) => {
      positions[i * 3] = spawn.x;
      positions[i * 3 + 1] = spawn.y;
      positions[i * 3 + 2] = spawn.z;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const tex = createFireflySpriteTexture();
    const mat = new THREE.PointsMaterial({
      size: 0.35,
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return {
      points: new THREE.Points(geo, mat),
      spawns: spawnList,
      disposeList: { geometries: [geo], materials: [mat], textures: [tex] },
    };
  }, [isMobile]);

  const positionsRef = useRef(
    points.geometry.attributes.position.array as Float32Array
  );

  useEffect(() => {
    return () => {
      disposeList.geometries.forEach((g) => g.dispose());
      disposeList.materials.forEach((m) => m.dispose());
      disposeList.textures.forEach((t) => t.dispose());
    };
  }, [disposeList]);

  useFrame(() => {
    const elapsed = useHeroStore.getState().elapsed;
    const env = syncEnvironment(timeOfDay);
    const isNightVal = computeIsNight(timeOfDay);
    const scroll = Math.max(0, Math.min(1, scrollProgress));
    const positions = positionsRef.current;
    const mat = points.material as THREE.PointsMaterial;

    spawns.forEach((spawn, i) => {
      positions[i * 3 + 1] = spawn.baseY + Math.sin(elapsed * spawn.speed + spawn.phase) * 0.18;
      positions[i * 3] += Math.sin(elapsed * 0.3 + i) * 0.0025;
      positions[i * 3 + 2] += Math.cos(elapsed * 0.2 + i) * 0.002;
    });
    points.geometry.attributes.position.needsUpdate = true;
    mat.opacity = (env.lanternIntensity * 0.35 + isNightVal * 0.45) * (1.0 - scroll);
  });

  return <primitive object={points} />;
}
