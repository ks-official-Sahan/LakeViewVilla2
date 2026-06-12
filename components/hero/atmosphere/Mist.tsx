"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { syncEnvironment } from "../environment/sharedEnv";
import { getHeroLod } from "../performance";
import type { HeroComponentProps } from "../types";
import { createMistSpriteTexture } from "./particleTextures";
import { createMistSpawns } from "./spawns";

/** Height-stratified humidity mist over the lagoon. */
export function Mist({ isMobile = false }: HeroComponentProps) {
  const scrollProgress = useHeroStore((s) => s.scrollProgress);
  const timeOfDay = useHeroStore((s) => s.timeOfDay);

  const { points, spawns, disposeList } = useMemo(() => {
    const count = getHeroLod(isMobile).mistParticles;
    const spawnList = createMistSpawns(count);
    const positions = new Float32Array(count * 3);
    spawnList.forEach((spawn, i) => {
      positions[i * 3] = spawn.x;
      positions[i * 3 + 1] = spawn.y;
      positions[i * 3 + 2] = spawn.z;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const tex = createMistSpriteTexture();
    const mat = new THREE.PointsMaterial({
      size: 2.8,
      map: tex,
      transparent: true,
      opacity: 0.12,
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
    const env = syncEnvironment(timeOfDay);
    const scroll = Math.max(0, Math.min(1, scrollProgress));
    const positions = positionsRef.current;
    const mat = points.material as THREE.PointsMaterial;

    spawns.forEach((spawn, i) => {
      positions[i * 3] += spawn.speedX;
      positions[i * 3 + 2] += spawn.speedZ;
      if (Math.abs(positions[i * 3] - spawn.originX) > spawn.limitX) {
        positions[i * 3] = spawn.originX;
      }
    });
    points.geometry.attributes.position.needsUpdate = true;
    mat.color.copy(env.fogColor);
    mat.opacity = 0.1 * (1.0 - scroll);
  });

  return <primitive object={points} />;
}
