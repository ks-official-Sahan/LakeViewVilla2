import type { Color, Vector3 } from "three";

/** Runtime environment values after time-of-day interpolation. */
export interface EnvConfig {
  skyTop: Color;
  skyBottom: Color;
  ambient: Color;
  ambientIntensity: number;
  sun: Color;
  sunIntensity: number;
  sunPos: Vector3;
  fogColor: Color;
  fogDensity: number;
  water: Color;
  waterSpecular: Color;
  waveSpeed: number;
  waveAmplitude: number;
  lanternIntensity: number;
}

/** Serializable preset row before THREE objects are constructed. */
export interface EnvPresetData {
  time: number;
  skyTop: string;
  skyBottom: string;
  ambient: string;
  ambientIntensity: number;
  sun: string;
  sunIntensity: number;
  sunPos: [number, number, number];
  fogColor: string;
  fogDensity: number;
  water: string;
  waterSpecular: string;
  waveSpeed: number;
  waveAmplitude: number;
  lanternIntensity: number;
}

/** Read-only snapshot returned by useEnvInterpolation. */
export interface EnvSnapshot {
  skyTop: string;
  skyBottom: string;
  ambient: string;
  ambientIntensity: number;
  sun: string;
  sunIntensity: number;
  sunPos: [number, number, number];
  fogColor: string;
  fogDensity: number;
  water: string;
  waterSpecular: string;
  waveSpeed: number;
  waveAmplitude: number;
  lanternIntensity: number;
  windDirection: number;
  goldenHourBoost: number;
  isNight: boolean;
  nightSmooth: number;
  birdVisibility: number;
}

export interface CameraKeyframeData {
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
}

export interface CameraKeyframe {
  t: number;
  pos: Vector3;
  look: Vector3;
}

export interface HeroSceneProps {
  scrollProgress: number;
  timeOfDay: number;
  className?: string;
}

export interface HeroComponentProps {
  isMobile?: boolean;
}

export interface WaterUniforms {
  uTime: { value: number };
  uWaterColor: { value: Color };
  uSpecularColor: { value: Color };
  uWaveSpeed: { value: number };
  uWaveAmplitude: { value: number };
  uSunDirection: { value: Vector3 };
  uShoreWorldZ: { value: number };
  uLanternIntensity: { value: number };
  uIsMobile: { value: number };
  uWindX: { value: number };
  uGoldenHourBoost: { value: number };
  uIsNight: { value: number };
}
