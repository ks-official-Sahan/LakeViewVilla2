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
export { isHeroR3FEnabled } from "./lib/feature-flag";
export { useEnvInterpolation, useEnvDerived } from "./hooks/useEnvInterpolation";
export { useHeroStore } from "@/stores/heroStore";
