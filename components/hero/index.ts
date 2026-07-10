export { default as HeroScene } from "./HeroScene";
export { HeroFallback } from "./HeroFallback";
export type { HeroSceneProps, EnvSnapshot, CameraKeyframeData } from "./types";
export {
  ENV_PRESETS,
  interpolateEnv,
  createEnvConfig,
  envConfigToSnapshot,
} from "./environment/envKeyframes";
export {
  CAMERA_KEYFRAMES,
  buildCameraPath,
  buildLookAtPath,
  sampleCameraKeyframes,
} from "./camera/cameraKeyframes";
export type { CameraKeyframe } from "./camera/cameraKeyframes";
export { isHeroR3FEnabled, isHeroLegacyEnabled } from "./lib/feature-flag";
export { getHeroLod } from "./performance";
export type { HeroLodBudget } from "./performance";
export { useEnvInterpolation, useEnvDerived } from "./hooks/useEnvInterpolation";
export { EnvironmentSystem } from "./environment/EnvironmentSystem";
export { WaterSystem } from "./water/WaterSystem";
export { TerrainSystem } from "./terrain/TerrainSystem";
export { FloraSystem } from "./flora/FloraSystem";
export { FaunaSystem } from "./fauna/FaunaSystem";
export { Villa } from "./villa/Villa";
export { AtmosphereSystem } from "./atmosphere/AtmosphereSystem";
export { computeMoonPhase } from "./environment/envKeyframes";
export { useHeroStore } from "@/stores/heroStore";
