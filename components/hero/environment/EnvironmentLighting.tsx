"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { syncEnvironment } from "./sharedEnv";
import type { HeroComponentProps } from "../types";

/**
 * Time-of-day lighting: ambient, hemisphere, sun directional, lake fill.
 * Trade-off: shadows disabled until Phase 5 villa casters are isolated.
 */
export function EnvironmentLighting(_props: HeroComponentProps = {}) {
  const scene = useThree((s) => s.scene);
  const scrollProgress = useHeroStore((s) => s.scrollProgress);
  const timeOfDay = useHeroStore((s) => s.timeOfDay);

  const fogRef = useRef<THREE.FogExp2 | null>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    fogRef.current = new THREE.FogExp2(0x0a1f24, 0.015);
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
      fogRef.current = null;
    };
  }, [scene]);

  useFrame(() => {
    const env = syncEnvironment(timeOfDay);

    if (fogRef.current) {
      fogRef.current.color.copy(env.fogColor);
      fogRef.current.density = env.fogDensity * 0.25 * (1.0 - scrollProgress * 0.4);
    }

    if (ambientRef.current) {
      ambientRef.current.color.copy(env.ambient);
      ambientRef.current.intensity = env.ambientIntensity * 1.2;
    }

    if (hemiRef.current) {
      hemiRef.current.intensity = 0.45 + env.ambientIntensity * 0.35;
      hemiRef.current.color.set(0x9ee8ec);
      hemiRef.current.groundColor.copy(env.water).multiplyScalar(0.85);
    }

    if (sunRef.current) {
      sunRef.current.color.copy(env.sun);
      sunRef.current.intensity = env.sunIntensity;
      sunRef.current.position.copy(env.sunPos);
    }

    if (fillRef.current) {
      fillRef.current.intensity = env.ambientIntensity * 0.15;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.2} />
      <hemisphereLight ref={hemiRef} args={[0x9ee8ec, 0x3d8a7a, 0.55]} />
      <directionalLight ref={sunRef} intensity={1} />
      <directionalLight ref={fillRef} color={0x8ac8d0} intensity={0.25} position={[0, 3, -8]} />
    </>
  );
}
