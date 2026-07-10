"use client";

import { invalidate, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  CAMERA_KEYFRAMES,
  mapScrollToCameraT,
  sampleCameraKeyframes,
} from "../camera/cameraKeyframes";
import { useHeroStore } from "@/stores/heroStore";

export interface UseScrollCameraOptions {
  enableParallax?: boolean;
}

const START_POS = new THREE.Vector3(6.02, 1.42, 4.9);
const START_LOOK = new THREE.Vector3(4.8, 0.9, -2.0);

/**
 * Scroll-keyframed camera matching legacy HeroCanvas:
 * - segment lerp between keyframes (no spline bowing)
 * - snap while scrubbing (no clipping through walls)
 * - gentle smoothing + breathing only when scroll is idle
 */
export function useScrollCamera(options: UseScrollCameraOptions = {}) {
  const { enableParallax = false } = options;
  const { camera } = useThree();

  const smoothedPos = useRef(START_POS.clone());
  const smoothedLook = useRef(START_LOOK.clone());
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const prevScroll = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enableParallax) return;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [enableParallax]);

  useFrame((_, delta) => {
    const { scrollProgress, elapsed } = useHeroStore.getState();
    const scrollT = mapScrollToCameraT(scrollProgress);

    sampleCameraKeyframes(scrollT, CAMERA_KEYFRAMES, targetPos.current, targetLook.current);

    const scrollDelta = Math.abs(scrollT - prevScroll.current);
    const isScrubbing = scrollDelta > 0.00008;
    prevScroll.current = scrollT;

    if (!isScrubbing) {
      if (enableParallax) {
        const parallaxFade = 1 - scrollT * 0.5;
        targetPos.current.x += mouse.current.x * 0.25 * parallaxFade;
        targetPos.current.y -= mouse.current.y * 0.1 * parallaxFade;
      }

      const breathe = 1 - scrollT * 0.65;
      targetPos.current.x += Math.sin(elapsed * 0.3) * 0.04 * breathe;
      targetPos.current.y += Math.cos(elapsed * 0.25) * 0.02 * breathe;
    }

    if (isScrubbing) {
      // Locked to path while scrolling — prevents lagging through geometry
      smoothedPos.current.copy(targetPos.current);
      smoothedLook.current.copy(targetLook.current);
    } else {
      // Legacy ~0.06 smoothing per frame at 60fps
      const smooth = Math.min(1, 0.06 * delta * 60);
      smoothedPos.current.lerp(targetPos.current, smooth);
      smoothedLook.current.lerp(targetLook.current, smooth);
    }

    camera.position.copy(smoothedPos.current);
    camera.lookAt(smoothedLook.current);
    invalidate();
  });
}
