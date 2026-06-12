"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { computeGoldenHourBoost, computeNightSmooth } from "./envKeyframes";
import { syncEnvironment } from "./sharedEnv";
import { getCelestialTextures } from "./celestialTextures";
import type { HeroComponentProps } from "../types";

const sunColorDay = new THREE.Color(0xfff5d0);
const sunColorSunset = new THREE.Color(0xe8904e);
const sunDir = new THREE.Vector3();
const moonDir = new THREE.Vector3();

export function CelestialBodies({ isMobile = false }: HeroComponentProps) {
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const sunGroupRef = useRef<THREE.Group>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const sunGlowRef = useRef<THREE.Sprite>(null);
  const moonGlowRef = useRef<THREE.Sprite>(null);

  const { sunOrbGeo, moonOrbGeo, sunOrbMat, moonOrbMat, sunGlowMat, moonGlowMat } = useMemo(() => {
    const textures = getCelestialTextures(isMobile);
    const sunGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const moonGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const sMat = new THREE.MeshBasicMaterial({ color: 0xfff5d0, fog: false });
    const mMat = new THREE.MeshBasicMaterial({ color: 0xd8d4cc, fog: false });
    const sGlow = new THREE.SpriteMaterial({
      map: textures.sunGlow,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const mGlow = new THREE.SpriteMaterial({
      map: textures.moonGlow,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    return {
      sunOrbGeo: sunGeo,
      moonOrbGeo: moonGeo,
      sunOrbMat: sMat,
      moonOrbMat: mMat,
      sunGlowMat: sGlow,
      moonGlowMat: mGlow,
    };
  }, [isMobile]);

  useEffect(() => {
    return () => {
      sunOrbGeo.dispose();
      moonOrbGeo.dispose();
      sunOrbMat.dispose();
      moonOrbMat.dispose();
      sunGlowMat.dispose();
      moonGlowMat.dispose();
    };
  }, [sunOrbGeo, moonOrbGeo, sunOrbMat, moonOrbMat, sunGlowMat, moonGlowMat]);

  useFrame(() => {
    const env = syncEnvironment(timeOfDay);
    const nightSmooth = computeNightSmooth(timeOfDay);
    const goldenHour = computeGoldenHourBoost(timeOfDay);

    sunDir.copy(env.sunPos).normalize();

    if (sunGroupRef.current) {
      sunGroupRef.current.position.copy(sunDir).multiplyScalar(42);
      sunGroupRef.current.visible = nightSmooth < 0.7;
      sunOrbMat.color.lerpColors(sunColorDay, sunColorSunset, goldenHour);
    }

    sunGlowMat.opacity = (1.0 - nightSmooth) * 0.8;
    if (sunGlowRef.current) {
      const scale = 8 + goldenHour * 6;
      sunGlowRef.current.scale.set(scale, scale, 1);
    }

    moonDir.copy(sunDir).negate();
    moonDir.y = Math.abs(moonDir.y) * 0.85 + 0.12;
    moonDir.normalize();

    if (moonGroupRef.current) {
      moonGroupRef.current.position.copy(moonDir).multiplyScalar(40);
      moonGroupRef.current.visible = nightSmooth > 0.3;
    }

    moonGlowMat.opacity = nightSmooth * 0.6;
  });

  return (
    <>
      <group ref={sunGroupRef}>
        <mesh geometry={sunOrbGeo} material={sunOrbMat} />
        <sprite ref={sunGlowRef} material={sunGlowMat} scale={[12, 12, 1]} />
      </group>
      <group ref={moonGroupRef}>
        <mesh geometry={moonOrbGeo} material={moonOrbMat} />
        <sprite ref={moonGlowRef} material={moonGlowMat} scale={[5, 5, 1]} />
      </group>
    </>
  );
}
