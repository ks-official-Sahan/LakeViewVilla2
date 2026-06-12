import { createEnvConfig, interpolateEnv } from "./envKeyframes";
import type { EnvConfig } from "../types";

/** Mutable env state interpolated once per frame; shared by environment + world tick. */
export const sharedEnvConfig: EnvConfig = createEnvConfig();

export function syncEnvironment(timeOfDay: number): EnvConfig {
  interpolateEnv(timeOfDay, sharedEnvConfig);
  return sharedEnvConfig;
}
