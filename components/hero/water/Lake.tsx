"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { LAKE_CENTER, WATER_Y } from "../constants";
import { getHeroLod } from "../performance";
import {
  computeIsNight,
  computeWindX,
} from "../environment/envKeyframes";
import { syncEnvironment } from "../environment/sharedEnv";
import { WATER_FRAGMENT, WATER_VERTEX } from "../shaders/water";
import type { HeroComponentProps } from "../types";
import { registerWaterUniforms } from "./waterRegistry";
import { createWaterUniforms, type WaterUniforms } from "./waterUniforms";

const boostedWater = new THREE.Color();

/**
 * Trade-off: planar reflection RT omitted on mobile for VRAM/perf; sky fresnel approximates reflections.
 */
export function Lake({ isMobile = false }: HeroComponentProps) {
  const scrollProgress = useHeroStore((s) => s.scrollProgress);
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const uniformsRef = useRef<WaterUniforms | null>(null);

  const { geometry, material } = useMemo(() => {
    const segments = getHeroLod(isMobile).waterSegments;
    const geo = new THREE.PlaneGeometry(20, 24, segments, segments);
    const uniforms = createWaterUniforms(isMobile);
    uniformsRef.current = uniforms;

    const mat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERTEX,
      fragmentShader: WATER_FRAGMENT,
      uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, [isMobile]);

  useEffect(() => {
    registerWaterUniforms(uniformsRef.current);
    return () => registerWaterUniforms(null);
  }, [material]);

  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.uMobile.value = isMobile ? 1 : 0;
    }
  }, [isMobile]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;

    const elapsed = useHeroStore.getState().elapsed;
    const env = syncEnvironment(timeOfDay);
    const isNightVal = computeIsNight(timeOfDay);

    uniforms.uTime.value = elapsed;
    uniforms.uWaveSpeed.value = env.waveSpeed;
    uniforms.uWaveAmplitude.value = env.waveAmplitude * 0.85;
    const isNight = isNightVal > 0.5;
    boostedWater.copy(env.water).multiplyScalar(isNight ? 1.2 : 1.35);
    uniforms.uWaterColor.value.copy(boostedWater);
    uniforms.uWaterSpecularColor.value.copy(env.waterSpecular);
    uniforms.uSkyTop.value.copy(env.skyTop);
    uniforms.uSkyBottom.value.copy(env.skyBottom);
    uniforms.uSunDirection.value.copy(env.sunPos).normalize();
    uniforms.uSunIntensity.value = env.sunIntensity;
    uniforms.uScrollProgress.value = scrollProgress;
    uniforms.uLanternIntensity.value = env.lanternIntensity;
    uniforms.uIsNight.value = isNightVal;
    uniforms.uWindX.value = computeWindX(timeOfDay);
    uniforms.uLakeCenter.value.copy(LAKE_CENTER);
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation-x={-Math.PI / 2}
      position={[-0.5, WATER_Y, -8]}
      frustumCulled={false}
    />
  );
}
