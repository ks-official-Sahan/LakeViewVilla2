"use client";

import { useMemo, useRef } from "react";
import {
  computeBirdVisibility,
  computeGoldenHourBoost,
  computeIsNight,
  computeNightSmooth,
  computeWindX,
  createEnvConfig,
  envConfigToSnapshot,
  interpolateEnv,
} from "../environment/envKeyframes";
import type { EnvConfig, EnvSnapshot } from "../types";

/**
 * Interpolates time-of-day environment presets into a stable snapshot.
 *
 * Dependency audit:
 * - timeOfDay: recomputes when the clock input changes.
 * - env ref: stable mutable EnvConfig reused across renders (THREE.Color lerp target).
 */
export function useEnvInterpolation(timeOfDay: number): EnvSnapshot {
  const envRef = useRef<EnvConfig | null>(null);
  if (!envRef.current) {
    envRef.current = createEnvConfig();
  }

  return useMemo(() => {
    const config = envRef.current!;
    interpolateEnv(timeOfDay, config);
    return envConfigToSnapshot(config, timeOfDay);
  }, [timeOfDay]);
}

/** Derived scalar helpers without full env snapshot (for lightweight subscribers). */
export function useEnvDerived(timeOfDay: number) {
  return useMemo(
    () => ({
      windDirection: computeWindX(timeOfDay),
      goldenHourBoost: computeGoldenHourBoost(timeOfDay),
      isNight: computeIsNight(timeOfDay) === 1,
      nightSmooth: computeNightSmooth(timeOfDay),
      birdVisibility: computeBirdVisibility(timeOfDay),
    }),
    [timeOfDay]
  );
}
