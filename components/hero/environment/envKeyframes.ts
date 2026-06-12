import * as THREE from "three";
import type { EnvConfig, EnvPresetData, EnvSnapshot } from "../types";

export const ENV_PRESETS: readonly EnvPresetData[] = [
  {
    time: 0,
    skyTop: "#010508",
    skyBottom: "#030c10",
    ambient: "#010405",
    ambientIntensity: 0.12,
    sun: "#769bb0",
    sunIntensity: 0.35,
    sunPos: [-8, 11, -6],
    fogColor: "#010508",
    fogDensity: 0.02,
    water: "#0C3540",
    waterSpecular: "#8ab4c8",
    waveSpeed: 0.15,
    waveAmplitude: 0.03,
    lanternIntensity: 1.6,
  },
  {
    time: 5.5,
    skyTop: "#3A6A8A",
    skyBottom: "#F0C8A0",
    ambient: "#4A6A7A",
    ambientIntensity: 0.65,
    sun: "#E8A87C",
    sunIntensity: 0.8,
    sunPos: [14, 2.8, 5],
    fogColor: "#2B1A24",
    fogDensity: 0.035,
    water: "#30A0A4",
    waterSpecular: "#E8A87C",
    waveSpeed: 0.2,
    waveAmplitude: 0.04,
    lanternIntensity: 0.8,
  },
  {
    time: 10,
    skyTop: "#2E9B9E",
    skyBottom: "#FFF5E8",
    ambient: "#E8F6F8",
    ambientIntensity: 1.05,
    sun: "#FFF8E7",
    sunIntensity: 1.4,
    sunPos: [10, 16, 3],
    fogColor: "#F5F0E6",
    fogDensity: 0.012,
    water: "#35A8AC",
    waterSpecular: "#FFF8E7",
    waveSpeed: 0.26,
    waveAmplitude: 0.05,
    lanternIntensity: 0.0,
  },
  {
    time: 14.5,
    skyTop: "#28A0A4",
    skyBottom: "#FFFBF4",
    ambient: "#ECF8FA",
    ambientIntensity: 1.1,
    sun: "#FFFFFF",
    sunIntensity: 1.5,
    sunPos: [2, 18, 1],
    fogColor: "#FAF6EE",
    fogDensity: 0.008,
    water: "#32A5A9",
    waterSpecular: "#FFFFFF",
    waveSpeed: 0.28,
    waveAmplitude: 0.055,
    lanternIntensity: 0.0,
  },
  {
    time: 18.5,
    skyTop: "#230A03",
    skyBottom: "#C9A55A",
    ambient: "#3D241E",
    ambientIntensity: 0.45,
    sun: "#E8904E",
    sunIntensity: 1.6,
    sunPos: [-14, 2.8, 5],
    fogColor: "#2A140F",
    fogDensity: 0.03,
    water: "#2D6A6E",
    waterSpecular: "#C9A55A",
    waveSpeed: 0.22,
    waveAmplitude: 0.042,
    lanternIntensity: 1.1,
  },
  {
    time: 21,
    skyTop: "#02070a",
    skyBottom: "#0b2027",
    ambient: "#051318",
    ambientIntensity: 0.25,
    sun: "#769bb0",
    sunIntensity: 0.5,
    sunPos: [9, 9, -5],
    fogColor: "#02070a",
    fogDensity: 0.015,
    water: "#123840",
    waterSpecular: "#8ab4c8",
    waveSpeed: 0.17,
    waveAmplitude: 0.035,
    lanternIntensity: 1.6,
  },
  {
    time: 24,
    skyTop: "#010508",
    skyBottom: "#030c10",
    ambient: "#010405",
    ambientIntensity: 0.12,
    sun: "#769bb0",
    sunIntensity: 0.35,
    sunPos: [-8, 11, -6],
    fogColor: "#010508",
    fogDensity: 0.02,
    water: "#0C3540",
    waterSpecular: "#769bb0",
    waveSpeed: 0.15,
    waveAmplitude: 0.03,
    lanternIntensity: 1.6,
  },
] as const;

const ENV_KEYFRAMES = ENV_PRESETS.map((preset) => ({
  time: preset.time,
  skyTop: new THREE.Color(preset.skyTop),
  skyBottom: new THREE.Color(preset.skyBottom),
  ambient: new THREE.Color(preset.ambient),
  ambientIntensity: preset.ambientIntensity,
  sun: new THREE.Color(preset.sun),
  sunIntensity: preset.sunIntensity,
  sunPos: new THREE.Vector3(...preset.sunPos),
  fogColor: new THREE.Color(preset.fogColor),
  fogDensity: preset.fogDensity,
  water: new THREE.Color(preset.water),
  waterSpecular: new THREE.Color(preset.waterSpecular),
  waveSpeed: preset.waveSpeed,
  waveAmplitude: preset.waveAmplitude,
  lanternIntensity: preset.lanternIntensity,
}));

export function createEnvConfig(): EnvConfig {
  return {
    skyTop: new THREE.Color(),
    skyBottom: new THREE.Color(),
    ambient: new THREE.Color(),
    ambientIntensity: 0.5,
    sun: new THREE.Color(),
    sunIntensity: 1,
    sunPos: new THREE.Vector3(),
    fogColor: new THREE.Color(),
    fogDensity: 0.015,
    water: new THREE.Color(),
    waterSpecular: new THREE.Color(),
    waveSpeed: 0.2,
    waveAmplitude: 0.045,
    lanternIntensity: 0,
  };
}

/** Onshore sea breeze 06:00–18:00; offshore land breeze at night. */
export function computeWindX(time: number): number {
  return time >= 6 && time < 20 ? 1 : -1;
}

export function computeGoldenHourBoost(time: number): number {
  const dawn = Math.max(0, 1 - Math.abs(time - 6.25) / 1.5);
  const dusk = Math.max(0, 1 - Math.abs(time - 18.75) / 1.5);
  return Math.min(1, Math.max(dawn, dusk));
}

export function computeIsNight(time: number): number {
  return time >= 20 || time < 5.5 ? 1 : 0;
}

export function computeNightSmooth(time: number): number {
  if (time >= 21) return 1;
  if (time >= 19) return (time - 19) / 2;
  if (time < 5) return 1;
  if (time < 6.5) return 1 - (time - 5) / 1.5;
  return 0;
}

export function computeBirdVisibility(time: number): number {
  const dawnPeak = Math.max(0, 1 - Math.abs(time - 6.5) / 2);
  const duskPeak = Math.max(0, 1 - Math.abs(time - 18) / 2);
  const midday = time >= 9 && time <= 16 ? 0.3 : 0.65;
  return Math.max(midday, Math.max(dawnPeak, duskPeak));
}

export function interpolateEnv(time: number, target: EnvConfig): void {
  const tOfDay = Math.max(0, Math.min(23.99, time));

  let idx = 0;
  for (let i = 0; i < ENV_KEYFRAMES.length - 1; i++) {
    if (tOfDay >= ENV_KEYFRAMES[i].time && tOfDay <= ENV_KEYFRAMES[i + 1].time) {
      idx = i;
      break;
    }
  }

  const kf1 = ENV_KEYFRAMES[idx];
  const kf2 = ENV_KEYFRAMES[idx + 1];
  const factor = (tOfDay - kf1.time) / (kf2.time - kf1.time);

  target.skyTop.copy(kf1.skyTop).lerp(kf2.skyTop, factor);
  target.skyBottom.copy(kf1.skyBottom).lerp(kf2.skyBottom, factor);
  target.ambient.copy(kf1.ambient).lerp(kf2.ambient, factor);
  target.ambientIntensity = THREE.MathUtils.lerp(kf1.ambientIntensity, kf2.ambientIntensity, factor);
  target.sun.copy(kf1.sun).lerp(kf2.sun, factor);
  target.sunIntensity = THREE.MathUtils.lerp(kf1.sunIntensity, kf2.sunIntensity, factor);
  target.sunPos.copy(kf1.sunPos).lerp(kf2.sunPos, factor);
  target.fogColor.copy(kf1.fogColor).lerp(kf2.fogColor, factor);
  target.fogDensity = THREE.MathUtils.lerp(kf1.fogDensity, kf2.fogDensity, factor);
  target.water.copy(kf1.water).lerp(kf2.water, factor);
  target.waterSpecular.copy(kf1.waterSpecular).lerp(kf2.waterSpecular, factor);
  target.waveSpeed = THREE.MathUtils.lerp(kf1.waveSpeed, kf2.waveSpeed, factor);
  target.waveAmplitude = THREE.MathUtils.lerp(kf1.waveAmplitude, kf2.waveAmplitude, factor);
  target.lanternIntensity = THREE.MathUtils.lerp(kf1.lanternIntensity, kf2.lanternIntensity, factor);
}

export function envConfigToSnapshot(config: EnvConfig, time: number): EnvSnapshot {
  return {
    skyTop: `#${config.skyTop.getHexString()}`,
    skyBottom: `#${config.skyBottom.getHexString()}`,
    ambient: `#${config.ambient.getHexString()}`,
    ambientIntensity: config.ambientIntensity,
    sun: `#${config.sun.getHexString()}`,
    sunIntensity: config.sunIntensity,
    sunPos: [config.sunPos.x, config.sunPos.y, config.sunPos.z],
    fogColor: `#${config.fogColor.getHexString()}`,
    fogDensity: config.fogDensity,
    water: `#${config.water.getHexString()}`,
    waterSpecular: `#${config.waterSpecular.getHexString()}`,
    waveSpeed: config.waveSpeed,
    waveAmplitude: config.waveAmplitude,
    lanternIntensity: config.lanternIntensity,
    windDirection: computeWindX(time),
    goldenHourBoost: computeGoldenHourBoost(time),
    isNight: computeIsNight(time) === 1,
    nightSmooth: computeNightSmooth(time),
    birdVisibility: computeBirdVisibility(time),
  };
}
