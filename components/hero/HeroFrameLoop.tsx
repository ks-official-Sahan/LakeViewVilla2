"use client";

import { invalidate, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useHeroStore } from "@/stores/heroStore";

/**
 * Single demand-frameloop driver for the hero scene.
 * All animated systems share one invalidate() per frame; pauses when tab is hidden
 * or prefers-reduced-motion is enabled.
 */
export function HeroFrameLoop() {
  const pausedRef = useRef(false);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => {
      reduceMotionRef.current = mq.matches;
      if (!mq.matches) invalidate();
    };
    applyMotion();
    mq.addEventListener("change", applyMotion);

    const onVisibility = () => {
      pausedRef.current = document.hidden;
      if (!document.hidden && !reduceMotionRef.current) invalidate();
    };
    document.addEventListener("visibilitychange", onVisibility);
    invalidate();

    return () => {
      mq.removeEventListener("change", applyMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useFrame(
    (_, delta) => {
      if (pausedRef.current || reduceMotionRef.current) return;

      const store = useHeroStore.getState();
      store.setElapsed(store.elapsed + delta);
      invalidate();
    },
    -100
  );

  return null;
}
