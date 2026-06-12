"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR, MOBILE_BREAKPOINT } from "./constants";
import { HeroSceneSync } from "./HeroSceneSync";
import { SceneContents } from "./SceneContents";
import type { HeroSceneProps } from "./types";

/** R3F hero root — demand frameloop driven by HeroFrameLoop + HeroSceneSync invalidation. */
export default function HeroScene({ scrollProgress, timeOfDay, className }: HeroSceneProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.75]);

  useEffect(() => {
    const apply = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      const maxDpr = mobile ? 1.25 : 1.75;
      setDpr([1, Math.min(window.devicePixelRatio, maxDpr)]);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return (
    <div className={cn("absolute inset-0 h-full w-full", className)}>
      <Canvas
        className="h-full w-full"
        dpr={dpr}
        frameloop="demand"
        performance={{ min: 0.5, max: 1, debounce: 200 }}
        camera={{ fov: CAMERA_FOV, near: CAMERA_NEAR, far: CAMERA_FAR, position: [6.02, 1.42, 4.9] }}
        gl={{
          alpha: true,
          antialias: !isMobile,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.48;
        }}
      >
        <HeroSceneSync scrollProgress={scrollProgress} timeOfDay={timeOfDay} />
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  );
}
