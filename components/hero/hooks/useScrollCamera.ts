"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_KEYFRAMES, sampleCameraKeyframes } from "../camera/cameraKeyframes";
import { useHeroStore } from "@/stores/heroStore";

export interface UseScrollCameraOptions {
  /** When true, applies mouse parallax (fades with scroll). */
  enableParallax?: boolean;
}

/**
 * Scroll-keyframed camera — segment lerp between authored keyframes.
 * Uses lookAt (not quaternion slerp) so the view stays locked on the lake focus target.
 */
export function useScrollCamera(options: UseScrollCameraOptions = {}) {
  const { enableParallax = false } = options;
  const { camera } = useThree();

  const smoothedPos = useRef(new THREE.Vector3(6.02, 1.42, 4.9));
  const smoothedLook = useRef(new THREE.Vector3(4.8, 0.9, -2.0));
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
    const scrollT = Math.max(0, Math.min(1, scrollProgress));

    sampleCameraKeyframes(scrollT, CAMERA_KEYFRAMES, targetPos.current, targetLook.current);

    if (enableParallax) {
      const parallaxFade = 1 - scrollT * 0.5;
      targetPos.current.x += mouse.current.x * 0.25 * parallaxFade;
      targetPos.current.y -= mouse.current.y * 0.1 * parallaxFade;
    }

    // Subtle breathing — stronger inside villa, fades as we rise over the lake
    const breathe = 1 - scrollT * 0.65;
    targetPos.current.x += Math.sin(elapsed * 0.3) * 0.04 * breathe;
    targetPos.current.y += Math.cos(elapsed * 0.25) * 0.02 * breathe;

    // Faster follow when scroll is moving — avoids lagging through geometry
    const scrollDelta = Math.abs(scrollT - prevScroll.current);
    prevScroll.current = scrollT;
    const baseSmooth = 1 - Math.pow(0.94, delta * 60);
    const smooth = THREE.MathUtils.clamp(baseSmooth + scrollDelta * 12, baseSmooth, 0.32);

    smoothedPos.current.lerp(targetPos.current, smooth);
    smoothedLook.current.lerp(targetLook.current, smooth);

    camera.position.copy(smoothedPos.current);
    camera.lookAt(smoothedLook.current);
  });
}
