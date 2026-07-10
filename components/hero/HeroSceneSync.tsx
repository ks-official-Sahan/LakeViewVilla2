"use client";

import { invalidate } from "@react-three/fiber";
import { useEffect, useLayoutEffect } from "react";
import { useHeroStore } from "@/stores/heroStore";
import { useEnvDerived, useEnvInterpolation } from "./hooks/useEnvInterpolation";
import { MOBILE_BREAKPOINT } from "./constants";

interface HeroSceneSyncProps {
  scrollProgress: number;
  timeOfDay: number;
}

/**
 * Syncs parent props into zustand and detects mobile breakpoint.
 *
 * Dependency audit:
 * - scrollProgress, timeOfDay: pushed to store on change.
 * - derived: recomputed when timeOfDay changes.
 */
export function HeroSceneSync({ scrollProgress, timeOfDay }: HeroSceneSyncProps) {
  const setScrollProgress = useHeroStore((s) => s.setScrollProgress);
  const setTimeOfDay = useHeroStore((s) => s.setTimeOfDay);
  const setDerived = useHeroStore((s) => s.setDerived);
  const setIsMobile = useHeroStore((s) => s.setIsMobile);
  const env = useEnvInterpolation(timeOfDay);
  const derived = useEnvDerived(timeOfDay);

  useLayoutEffect(() => {
    setScrollProgress(scrollProgress);
    invalidate();
  }, [scrollProgress, setScrollProgress]);

  useEffect(() => {
    setTimeOfDay(timeOfDay);
    setDerived({
      isNight: derived.isNight,
      goldenHourBoost: derived.goldenHourBoost,
      windDirection: derived.windDirection,
      lanternIntensity: env.lanternIntensity,
    });
    invalidate();
  }, [timeOfDay, derived, env.lanternIntensity, setTimeOfDay, setDerived]);

  useEffect(() => {
    const apply = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [setIsMobile]);

  return null;
}
