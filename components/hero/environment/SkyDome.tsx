"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { SKY_FRAGMENT, SKY_VERTEX } from "../shaders/sky";
import {
  computeGoldenHourBoost,
  computeIsNight,
  computeMoonPhase,
  computeWindX,
} from "./envKeyframes";
import { syncEnvironment } from "./sharedEnv";
import type { HeroComponentProps } from "../types";

export function SkyDome({ isMobile = false }: HeroComponentProps) {
  const camera = useThree((s) => s.camera);
  const meshRef = useRef<THREE.Mesh>(null);
  const timeOfDay = useHeroStore((s) => s.timeOfDay);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(60, 32, 15);
    const mat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERTEX,
      fragmentShader: SKY_FRAGMENT,
      uniforms: {
        uColorTop: { value: new THREE.Color() },
        uColorBottom: { value: new THREE.Color() },
        uSunDirection: { value: new THREE.Vector3() },
        uSunColor: { value: new THREE.Color() },
        uSunSize: { value: 0.035 },
        uTime: { value: 0 },
        uGoldenHourBoost: { value: 0 },
        uIsNight: { value: 0 },
        uWindX: { value: 1 },
        uMobile: { value: isMobile ? 1 : 0 },
        uMoonPhase: { value: 0.5 },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
    return { geometry: geo, material: mat };
  }, [isMobile]);

  useEffect(() => {
    material.uniforms.uMobile.value = isMobile ? 1 : 0;
  }, [isMobile, material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(() => {
    const elapsed = useHeroStore.getState().elapsed;
    const env = syncEnvironment(timeOfDay);
    const goldenHour = computeGoldenHourBoost(timeOfDay);
    const isNight = computeIsNight(timeOfDay);

    material.uniforms.uColorTop.value.copy(env.skyTop);
    material.uniforms.uColorBottom.value.copy(env.skyBottom);
    material.uniforms.uSunDirection.value.copy(env.sunPos).normalize();
    material.uniforms.uSunColor.value.copy(env.sun).multiplyScalar(env.sunIntensity);
    material.uniforms.uTime.value = elapsed;
    material.uniforms.uGoldenHourBoost.value = goldenHour;
    material.uniforms.uIsNight.value = isNight;
    material.uniforms.uSunSize.value = isNight > 0.5 ? 0.028 : 0.035;
    material.uniforms.uWindX.value = computeWindX(timeOfDay);
    material.uniforms.uMoonPhase.value = computeMoonPhase(timeOfDay);

    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />;
}
