"use client";

import { useEffect, useRef } from "react";
import { invalidate, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildCameraPath, buildLookAtPath } from "../camera/cameraKeyframes";
import { useHeroStore } from "@/stores/heroStore";

export interface UseScrollCameraOptions {
  /** When true, applies mouse parallax for t < 0.4 (Phase 6). */
  enableParallax?: boolean;
}

/**
 * GSAP + Lenis scroll-driven camera hook.
 * Phase 0: spline sampling from store scrollProgress with exponential smoothing.
 * Phase 6: full ScrollTrigger + Lenis binding and quaternion slerp.
 *
 * Dependency audit:
 * - enableParallax: stable config flag only.
 * - scrollProgress: read from zustand each frame (no effect deps).
 */
export function useScrollCamera(options: UseScrollCameraOptions = {}) {
  const { enableParallax = false } = options;
  const { camera } = useThree();

  const cameraPathRef = useRef(buildCameraPath());
  const lookAtPathRef = useRef(buildLookAtPath());
  const smoothedPos = useRef(new THREE.Vector3());
  const smoothedLook = useRef(new THREE.Vector3());
  const targetQuat = useRef(new THREE.Quaternion());
  const dummy = useRef(new THREE.Object3D());
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const initialized = useRef(false);
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
    const scrollProgress = useHeroStore.getState().scrollProgress;
    const t = Math.max(0, Math.min(1, scrollProgress));

    cameraPathRef.current.getPoint(t, targetPos.current);
    lookAtPathRef.current.getPoint(t, targetLook.current);

    if (enableParallax && t < 0.4) {
      const parallaxFade = 1 - t * 0.5;
      targetPos.current.x += mouse.current.x * 0.25 * parallaxFade;
      targetPos.current.y -= mouse.current.y * 0.1 * parallaxFade;
    }

    if (!initialized.current) {
      smoothedPos.current.copy(targetPos.current);
      smoothedLook.current.copy(targetLook.current);
      initialized.current = true;
    }

    const posLerp = 1 - Math.pow(0.01, delta);
    const rotLerp = 1 - Math.pow(0.008, delta);

    smoothedPos.current.lerp(targetPos.current, posLerp);
    smoothedLook.current.lerp(targetLook.current, rotLerp);

    camera.position.copy(smoothedPos.current);

    dummy.current.position.copy(camera.position);
    dummy.current.lookAt(smoothedLook.current);
    targetQuat.current.copy(dummy.current.quaternion);
    camera.quaternion.slerp(targetQuat.current, rotLerp);
    invalidate();
  });
}
