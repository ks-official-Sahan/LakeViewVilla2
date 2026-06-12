"use client";

import { invalidate, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useHeroStore } from "@/stores/heroStore";
import { buildHeroScene } from "./buildHeroScene";
import type { HeroSceneRefs } from "./buildHeroScene";
import { tickHeroScene } from "./tickHeroScene";

/**
 * Imperative hero world — builds the full scene once, ticks each frame.
 * Camera motion is handled separately by CinematicCamera.
 */
export function HeroWorld() {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const scrollProgress = useHeroStore((s) => s.scrollProgress);
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const isMobile = useHeroStore((s) => s.isMobile);

  const refsRef = useRef<HeroSceneRefs | null>(null);
  const disposeRef = useRef<(() => void) | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    invalidate();
  }, [scrollProgress, timeOfDay, isMobile]);

  useLayoutEffect(() => {
    const { refs, dispose } = buildHeroScene(scene, isMobile);
    refsRef.current = refs;
    disposeRef.current = dispose;

    refs.fgLeafMesh.position.set(-2.2, -2.0, -2.8);
    refs.fgLeafMesh.rotation.set(0.5, 0.6, -0.3);
    refs.fgLeafMesh.scale.setScalar(0.7);
    camera.add(refs.fgLeafMesh);

    return () => {
      camera.remove(refs.fgLeafMesh);
      dispose();
      refsRef.current = null;
      disposeRef.current = null;
    };
  }, [scene, camera, isMobile]);

  useFrame((_, delta) => {
    const refs = refsRef.current;
    if (!refs) return;

    elapsedRef.current += delta;
    tickHeroScene(refs, {
      elapsed: elapsedRef.current,
      scroll: scrollProgress,
      timeOfDay,
      camera,
      isMobile,
    });
    invalidate();
  });

  return null;
}
