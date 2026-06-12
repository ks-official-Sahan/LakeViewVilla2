/**
 * @deprecated Legacy imperative Three.js hero (Phase 0–6). Production uses `components/hero/HeroScene`.
 * Kept for rollback: `localStorage.setItem("hero-r3f", "0")` or `NEXT_PUBLIC_HERO_LEGACY=1`.
 */
"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Environment Keyframes for Time-of-Day Lighting ──────────────────────────

interface EnvConfig {
  skyTop: THREE.Color;
  skyBottom: THREE.Color;
  ambient: THREE.Color;
  ambientIntensity: number;
  sun: THREE.Color;
  sunIntensity: number;
  sunPos: THREE.Vector3;
  fogColor: THREE.Color;
  fogDensity: number;
  water: THREE.Color;
  waterSpecular: THREE.Color;
  waveSpeed: number;
  waveAmplitude: number;
  lanternIntensity: number;
}

const ENV_PRESETS = [
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
];

function computeWindX(time: number): number {
  return time >= 6 && time < 20 ? 1.0 : -1.0;
}

const ENV_KEYFRAMES = ENV_PRESETS.map((p) => ({
  time: p.time,
  skyTop: new THREE.Color(p.skyTop),
  skyBottom: new THREE.Color(p.skyBottom),
  ambient: new THREE.Color(p.ambient),
  ambientIntensity: p.ambientIntensity,
  sun: new THREE.Color(p.sun),
  sunIntensity: p.sunIntensity,
  sunPos: new THREE.Vector3(...(p.sunPos as [number, number, number])),
  fogColor: new THREE.Color(p.fogColor),
  fogDensity: p.fogDensity,
  water: new THREE.Color(p.water),
  waterSpecular: new THREE.Color(p.waterSpecular),
  waveSpeed: p.waveSpeed,
  waveAmplitude: p.waveAmplitude,
  lanternIntensity: p.lanternIntensity,
}));

function interpolateEnv(time: number, target: EnvConfig) {
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

function computeGoldenHourBoost(time: number): number {
  const dawn = Math.max(0, 1 - Math.abs(time - 6.25) / 1.5);
  const dusk = Math.max(0, 1 - Math.abs(time - 18.75) / 1.5);
  return Math.min(1, Math.max(dawn, dusk));
}

function computeIsNight(time: number): number {
  return time >= 20 || time < 5.5 ? 1 : 0;
}

/** Smooth night transition for celestial body cross-fade. */
function computeNightSmooth(time: number): number {
  if (time >= 21) return 1;
  if (time >= 19) return (time - 19) / 2;
  if (time < 5) return 1;
  if (time < 6.5) return 1 - (time - 5) / 1.5;
  return 0;
}

function computeBirdVisibility(time: number): number {
  const dawnPeak = Math.max(0, 1 - Math.abs(time - 6.5) / 2);
  const duskPeak = Math.max(0, 1 - Math.abs(time - 18) / 2);
  const midday = time >= 9 && time <= 16 ? 0.3 : 0.65;
  return Math.max(midday, Math.max(dawnPeak, duskPeak));
}

// ─── Scene Layout Constants ─────────────────────────────────────────────────

const ROAD_Y = -0.85;
const WATER_Y = -1.28;
const GROUND_Y = -0.88;
const SHORE_WORLD_Z = -4.8;
const LAKE_CENTER = new THREE.Vector2(-0.5, -8);
const LAKE_RADIUS = 10.5;

type CameraKeyframe = { t: number; pos: THREE.Vector3; look: THREE.Vector3 };

function sampleCameraKeyframes(
  scroll: number,
  keyframes: CameraKeyframe[],
  outPos: THREE.Vector3,
  outLook: THREE.Vector3
) {
  const t = Math.max(0, Math.min(1, scroll));
  let i = 0;
  for (let k = 0; k < keyframes.length - 1; k++) {
    if (t >= keyframes[k].t) i = k;
  }
  const a = keyframes[i];
  const b = keyframes[Math.min(i + 1, keyframes.length - 1)];
  const f = THREE.MathUtils.clamp((t - a.t) / Math.max(0.0001, b.t - a.t), 0, 1);
  const eased = f * f * (3 - 2 * f);
  outPos.lerpVectors(a.pos, b.pos, eased);
  outLook.lerpVectors(a.look, b.look, eased);
}

// ─── Enhanced Sky Shader ─────────────────────────────────────────────────────

const SKY_VERTEX = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uColorTop;
  uniform vec3 uColorBottom;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform float uSunSize;
  uniform float uTime;
  uniform float uGoldenHourBoost;
  uniform float uIsNight;
  uniform float uWindX;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * smoothNoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 direction = normalize(vWorldPosition);
    float h = direction.y * 0.5 + 0.5;
    vec3 skyColor = mix(uColorBottom, uColorTop, h);

    vec3 sunDir = normalize(uSunDirection);
    float sunDot = dot(direction, sunDir);

    // Sun / moon disk with warm corona
    float diskSize = mix(uSunSize, uSunSize * 0.5, uIsNight);
    float sunCore = smoothstep(1.0 - diskSize * 0.75, 1.0 - diskSize * 0.15, sunDot);
    float sunCorona = smoothstep(1.0 - diskSize * 2.8, 1.0 - diskSize * 0.55, sunDot);
    vec3 sunDisk = uSunColor * (sunCore * 4.2 + sunCorona * 1.4 * (1.0 - uIsNight * 0.55));

    // Volumetric horizon glow — strongest at sunrise/sunset
    float horizon = exp(-abs(direction.y) * 6.5);
    vec3 scatter = uSunColor * horizon * uGoldenHourBoost * 0.9;
    skyColor += scatter;

    // Mie scattering approximation (warm atmosphere near horizon)
    float mie = pow(max(sunDot, 0.0), 8.0) * horizon * 0.35 * (1.0 - uIsNight);
    skyColor += uSunColor * mie;

    // Crepuscular god rays
    float rayAngle = atan(direction.x, direction.z);
    float rayNoise = fbm(vec2(rayAngle * 4.0 + uTime * 0.018, direction.y * 3.5 + uTime * 0.01));
    float rayMask = smoothstep(0.91, 1.0, sunDot) * (1.0 - uIsNight) * uGoldenHourBoost;
    skyColor += uSunColor * rayNoise * rayMask * horizon * 0.42;

    // Star field (visible at night)
    float stars = 0.0;
    if (uIsNight > 0.3 && direction.y > 0.05) {
      vec2 starUV = direction.xz / (direction.y + 0.02) * 180.0;
      float starCell = hash(floor(starUV));
      float starBright = step(0.988, starCell);
      float twinkle = sin(uTime * 2.5 + starCell * 120.0) * 0.25 + 0.75;
      stars = starBright * twinkle * uIsNight * smoothstep(0.05, 0.35, direction.y);
      // Milky way band
      float milky = smoothstep(0.6, 0.8, fbm(direction.xz * 3.0 + vec2(0.0, uTime * 0.002)));
      stars += milky * 0.08 * uIsNight * smoothstep(0.1, 0.5, direction.y);
    }
    skyColor += vec3(1.0, 0.98, 0.93) * stars;

    // Five-layer tropical sky clouds
    float cloudMix = 0.0;
    if (direction.y > -0.08) {
      vec2 baseUv = vec2(direction.x, direction.z) / (direction.y + 0.1);

      vec2 cirrusUv = baseUv * 1.4;
      cirrusUv.x += uTime * 0.0035 * uWindX;
      cirrusUv.y += uTime * 0.0008 * abs(uWindX);
      float cirrus = smoothstep(0.55, 0.78, fbm(cirrusUv)) * smoothstep(0.15, 0.55, direction.y);

      vec2 cumulusUv = baseUv * 2.2;
      cumulusUv.x += uTime * 0.007 * uWindX;
      cumulusUv.y += uTime * 0.0012 * uWindX * 0.5;
      float cumulus = smoothstep(0.42, 0.72, fbm(cumulusUv)) * smoothstep(-0.05, 0.35, direction.y);

      vec2 hazeUv = baseUv * 0.9;
      hazeUv.x += uTime * 0.0045 * uWindX;
      float lowHaze = smoothstep(0.35, 0.65, fbm(hazeUv)) * smoothstep(-0.05, 0.18, direction.y);

      vec2 altUv = baseUv * 3.5;
      altUv.x += uTime * 0.005 * uWindX;
      float alto = smoothstep(0.50, 0.75, fbm(altUv)) * smoothstep(0.08, 0.45, direction.y);

      vec2 wispsUv = baseUv * 5.0;
      wispsUv.x += uTime * 0.009 * uWindX;
      float wisps = smoothstep(0.58, 0.82, fbm(wispsUv)) * smoothstep(0.20, 0.60, direction.y);

      cloudMix = cirrus * 0.12 + cumulus * 0.26 + lowHaze * 0.16 + alto * 0.10 + wisps * 0.06;
    }

    vec3 cloudTint = mix(
      vec3(0.92, 0.95, 1.0) * (uSunColor * 0.5 + 0.5),
      vec3(0.06, 0.12, 0.18),
      uIsNight * 0.75
    );
    // Golden-hour lit cloud undersides
    vec3 goldenCloudTint = mix(cloudTint, uSunColor * 1.2, uGoldenHourBoost * 0.4);
    vec3 finalColor = mix(skyColor + sunDisk, goldenCloudTint, cloudMix * 0.85);

    float skyLuma = dot(finalColor, vec3(0.299, 0.587, 0.114));
    finalColor = mix(vec3(skyLuma), finalColor, 1.18);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// ─── Water Shader ────────────────────────────────────────────────────────────

const WATER_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uWaveSpeed;
  uniform float uWaveAmplitude;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPos;
  varying float vHeight;
  varying float vWorldZ;
  varying float vWorldX;

  struct Wave {
    vec2 dir;
    float amp;
    float freq;
    float steepness;
    float speed;
  };

  void main() {
    vUv = uv;
    vec3 pos = position;

    Wave waves[5];
    waves[0] = Wave(normalize(vec2(1.0, 0.4)), uWaveAmplitude * 0.7, 0.35, 0.6, uWaveSpeed * 0.8);
    waves[1] = Wave(normalize(vec2(-0.8, 0.8)), uWaveAmplitude * 0.35, 0.65, 0.45, uWaveSpeed * 1.3);
    waves[2] = Wave(normalize(vec2(0.3, -0.9)), uWaveAmplitude * 0.18, 1.20, 0.3, uWaveSpeed * 2.1);
    waves[3] = Wave(normalize(vec2(0.6, 0.2)), uWaveAmplitude * 0.12, 2.10, 0.22, uWaveSpeed * 2.8);
    waves[4] = Wave(normalize(vec2(-0.4, -0.6)), uWaveAmplitude * 0.08, 3.20, 0.18, uWaveSpeed * 3.5);

    vec3 displaced = pos;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 1.0, 0.0);

    for(int i = 0; i < 5; i++) {
      float phase = dot(waves[i].dir, pos.xy) * waves[i].freq + uTime * waves[i].speed;
      float c = cos(phase);
      float s = sin(phase);
      float QA = waves[i].steepness * waves[i].amp;

      displaced.x += waves[i].dir.x * QA * c;
      displaced.y += waves[i].dir.y * QA * c;
      displaced.z += waves[i].amp * s;

      float kAmpSin = waves[i].freq * waves[i].amp * s;
      float kAmpCos = waves[i].freq * waves[i].amp * c;

      tangent.x -= waves[i].dir.x * waves[i].dir.x * waves[i].steepness * kAmpSin;
      tangent.y -= waves[i].dir.x * waves[i].dir.y * waves[i].steepness * kAmpSin;
      tangent.z += waves[i].dir.x * kAmpCos;

      binormal.x -= waves[i].dir.x * waves[i].dir.y * waves[i].steepness * kAmpSin;
      binormal.y -= waves[i].dir.y * waves[i].dir.y * waves[i].steepness * kAmpSin;
      binormal.z += waves[i].dir.y * kAmpCos;
    }

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(cross(tangent, binormal));
    vWorldPos = displaced;
    vHeight = displaced.z;
    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldX = worldPos.x;
    vWorldZ = worldPos.z;
  }
`;

const WATER_FRAGMENT = /* glsl */ `
  uniform vec3 uWaterColor;
  uniform vec3 uWaterSpecularColor;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyBottom;
  uniform vec3 uSunDirection;
  uniform float uSunIntensity;
  uniform float uScrollProgress;
  uniform float uTime;
  uniform float uShoreWorldZ;
  uniform vec2 uLakeCenter;
  uniform float uLakeRadius;

  uniform vec3 uLanternViewPosition;
  uniform vec2 uLanternPlanePos;
  uniform vec3 uLanternColor;
  uniform float uLanternIntensity;
  uniform float uShoreProximity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPos;
  varying float vHeight;
  varying float vWorldZ;
  varying float vWorldX;

  float noiseH(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float causticNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = noiseH(i);
    float b = noiseH(i + vec2(1.0, 0.0));
    float c = noiseH(i + vec2(0.0, 1.0));
    float d = noiseH(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float caustics(vec2 uv, float t) {
    float c = 0.0;
    c += causticNoise(uv * 3.5 + vec2(t * 0.4, t * 0.25));
    c += causticNoise(uv * 7.0 - vec2(t * 0.55, t * 0.35)) * 0.5;
    c += causticNoise(uv * 14.0 + vec2(t * 0.3, -t * 0.2)) * 0.25;
    c += causticNoise(uv * 22.0 - vec2(t * 0.15, t * 0.45)) * 0.12;
    return pow(c * 0.48, 1.4);
  }

  vec3 saturateColor(vec3 c, float amount) {
    float luma = dot(c, vec3(0.299, 0.587, 0.114));
    return mix(vec3(luma), c, amount);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float viewDepth = length(vViewPosition);

    // Depth readout
    float depthFade = smoothstep(4.0, 28.0, viewDepth);
    float heightFactor = clamp((vHeight + 0.12) * 3.5, 0.0, 1.0);

    vec3 lagoonDeep = uWaterColor * 1.25;
    vec3 lagoonMid = uWaterColor * 1.75 + vec3(0.04, 0.14, 0.12);
    vec3 lagoonBright = uWaterColor * 2.1 + vec3(0.08, 0.18, 0.14);
    vec3 col = mix(mix(lagoonDeep, lagoonMid, heightFactor), lagoonBright, heightFactor * 0.45);
    col = mix(col, lagoonDeep * 0.95, depthFade * 0.25);

    // Shore proximity — shallow water near grass embankment (world Z)
    float distToShore = abs(vWorldZ - uShoreWorldZ);
    float shoreShallow = smoothstep(3.5, 0.15, distToShore);

    // Sky reflection
    vec3 reflectDir = reflect(-viewDir, normal);
    float skyBlend = reflectDir.y * 0.5 + 0.5;
    vec3 skyReflect = mix(uSkyBottom, uSkyTop, clamp(skyBlend, 0.0, 1.0));
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
    col = mix(col, skyReflect * 1.15, fresnel * 0.62);

    // Sun specular + glitter
    vec3 halfDir = normalize(uSunDirection + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 28.0);
    col += uWaterSpecularColor * spec * uSunIntensity * 1.45;

    float glintSpec = pow(max(dot(normal, halfDir), 0.0), 180.0);
    col += vec3(1.0, 0.98, 0.9) * glintSpec * uSunIntensity * 2.2;

    // Anisotropic sun streak
    vec2 sunXZ = normalize(uSunDirection.xz + vec2(0.001));
    float streak = pow(max(dot(normalize(vWorldPos.xy) * 0.08, sunXZ), 0.0), 6.0);
    col += uWaterSpecularColor * streak * uSunIntensity * 0.18;

    // Shallow caustics
    float shallowMask = smoothstep(5.0, 0.3, distToShore);
    float caustic = caustics(vWorldPos.xy * 0.55, uTime) * shallowMask;
    col += vec3(0.55, 0.85, 0.75) * caustic * uSunIntensity * 0.42;

    // Lagoon floor sediment
    float floorVar = causticNoise(vWorldPos.xy * 0.22 + vec2(3.7, 1.2));
    col = mix(col, col * 0.82 + vec3(0.14, 0.24, 0.16), floorVar * shallowMask * 0.4);

    // Lantern reflection on water
    vec3 fragPosInView = -vViewPosition;
    vec3 lightDir = normalize(uLanternViewPosition - fragPosInView);
    vec3 halfDirLantern = normalize(lightDir + viewDir);
    float specLantern = pow(max(dot(normal, halfDirLantern), 0.0), 32.0);
    float lightDist = length(uLanternViewPosition - fragPosInView);
    float attenuation = 1.0 / (1.0 + 0.22 * lightDist + 0.12 * lightDist * lightDist);
    col += uLanternColor * specLantern * uLanternIntensity * attenuation * 2.2;

    vec2 lanternDist = vWorldPos.xy - uLanternPlanePos;
    float lanternRipple = sin(length(lanternDist) * 8.0 - uTime * 2.5) * 0.5 + 0.5;
    float causticDisc = exp(-dot(lanternDist, lanternDist) * 0.32) * lanternRipple;
    col += uLanternColor * causticDisc * uLanternIntensity * 0.12;

    // Shoreline color bands
    vec3 sandShallow = vec3(0.94, 0.88, 0.72);
    vec3 emeraldShallow = vec3(0.35, 0.78, 0.62);
    vec3 tealMid = vec3(0.18, 0.62, 0.58);
    float sandZone = smoothstep(1.4, 0.1, distToShore);
    float shallowZone = smoothstep(4.0, 0.4, distToShore);
    float midZone = smoothstep(7.0, 2.0, distToShore);
    col = mix(col, sandShallow, sandZone * 0.5);
    col = mix(col, emeraldShallow, shallowZone * 0.65);
    col = mix(col, tealMid, midZone * 0.35);

    // Shore foam
    float wavePhase = uTime * 2.8 + vWorldPos.x * 2.0 + distToShore * 1.5;
    float shoreFoam = smoothstep(0.8, 0.0, distToShore) * (0.5 + 0.5 * sin(wavePhase));

    // Rock foam
    vec2 rock1 = vec2(-4.0, 8.5);
    vec2 rock2 = vec2(1.5, 9.0);
    vec2 rock3 = vec2(4.5, 8.0);
    vec2 rock4 = vec2(-1.5, 9.5);
    vec2 rock5 = vec2(0.5, 10.0);
    float minRockDist = min(
      min(min(distance(vWorldPos.xy, rock1), distance(vWorldPos.xy, rock2)),
          min(distance(vWorldPos.xy, rock3), distance(vWorldPos.xy, rock4))),
      distance(vWorldPos.xy, rock5)
    );
    float rockFoam = smoothstep(0.5, 0.0, minRockDist) * (0.5 + 0.5 * sin(uTime * 3.4 + vWorldPos.x * 3.5));
    float finalFoam = max(shoreFoam, rockFoam);
    col = mix(col, vec3(0.96, 0.99, 1.0) * (uSunIntensity * 0.35 + 0.65), finalFoam * 0.72);

    // Fine ripple detail
    float ripple = sin(vWorldPos.x * 4.5 + uTime * 1.6) * sin(vWorldPos.y * 3.8 - uTime * 1.2);
    col += uWaterColor * ripple * 0.04;

    col = saturateColor(col, 1.42);

    // Lake perimeter mask (world XZ)
    vec2 lakePos = vec2(vWorldX, vWorldZ);
    float distLake = length(lakePos - uLakeCenter);
    float perimeterFade = smoothstep(uLakeRadius, uLakeRadius - 2.5, distLake);

    // Shallow transition near road-side embankment
    float shoreDepthFade = smoothstep(-2.5, -5.5, vWorldZ);
    col = mix(col, emeraldShallow * 1.15, (1.0 - shoreDepthFade) * 0.22);

    float fieldJunction = smoothstep(-9.0, -5.5, vWorldX);
    float lakeMask = perimeterFade * fieldJunction;
    col = mix(col * 0.55, col, lakeMask);

    float alpha = 0.94 * lakeMask * (1.0 - uScrollProgress * 0.45);

    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Procedural Texture Generators ───────────────────────────────────────────

const createWoodTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#3d2e22";
  ctx.fillRect(0, 0, 512, 512);

  const plankWidth = 64;
  for (let x = 0; x < 512; x += plankWidth) {
    ctx.strokeStyle = "#2a1f16";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
    ctx.lineWidth = 1.2;
    for (let j = 0; j < 8; j++) {
      const gx = x + 5 + Math.random() * (plankWidth - 10);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.quadraticCurveTo(gx + (Math.random() - 0.5) * 20, 256, gx, 512);
      ctx.stroke();
    }

    // Knots
    if (Math.random() > 0.7) {
      const kx = x + plankWidth / 2;
      const ky = Math.random() * 512;
      ctx.fillStyle = "rgba(30, 18, 10, 0.5)";
      ctx.beginPath();
      ctx.ellipse(kx, ky, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${0.04 + Math.random() * 0.08})`;
    if (Math.random() > 0.5) {
      ctx.fillRect(x, 0, plankWidth, 512);
    }
  }

  return new THREE.CanvasTexture(canvas);
};

const createConcreteTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#5a6e72";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 1.5;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(x, y, size, size);
  }

  ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(256, 128);
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 256);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
};

const createPalmLeafTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, 128, 256);

  ctx.strokeStyle = "#1a5c3a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 250);
  ctx.quadraticCurveTo(64, 128, 48, 10);
  ctx.stroke();

  ctx.strokeStyle = "#2a7a4a";
  ctx.lineWidth = 1.8;
  const leafletsCount = 38;
  for (let i = 0; i < leafletsCount; i++) {
    const t = i / leafletsCount;
    const py = 250 - t * 235;
    const px = 64 - t * t * 16;
    const length = Math.sin(t * Math.PI) * 48;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px - length * 0.7, py + 12, px - length, py + 26);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + length * 0.7, py + 12, px + length, py + 26);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

const createRoadTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  // Asphalt base
  ctx.fillStyle = "#4a4642";
  ctx.fillRect(0, 0, 256, 512);

  // Noise grain
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 512;
    const s = Math.random() * 1.8;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.04)";
    ctx.fillRect(x, y, s, s);
  }

  // Faded center marking
  ctx.strokeStyle = "rgba(200, 190, 160, 0.12)";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 30]);
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 512);
  ctx.stroke();
  ctx.setLineDash([]);

  // Edge wear
  ctx.fillStyle = "rgba(90, 85, 75, 0.15)";
  ctx.fillRect(0, 0, 12, 512);
  ctx.fillRect(244, 0, 12, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const createBarkTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#3a2a1e";
  ctx.fillRect(0, 0, 128, 256);

  // Vertical bark grooves
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  for (let i = 0; i < 20; i++) {
    ctx.lineWidth = 1 + Math.random() * 2;
    const x = Math.random() * 128;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 15, 128, x + (Math.random() - 0.5) * 10, 256);
    ctx.stroke();
  }

  // Horizontal texture bands
  for (let y = 0; y < 256; y += 8 + Math.random() * 12) {
    ctx.strokeStyle = `rgba(${50 + Math.random() * 30}, ${35 + Math.random() * 20}, ${20 + Math.random() * 15}, 0.3)`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const createSunGlowTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255, 245, 200, 0.9)");
  grad.addColorStop(0.15, "rgba(255, 225, 150, 0.5)");
  grad.addColorStop(0.4, "rgba(255, 200, 100, 0.15)");
  grad.addColorStop(0.7, "rgba(255, 180, 80, 0.04)");
  grad.addColorStop(1, "rgba(255, 160, 60, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
};

const createMoonGlowTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(200, 210, 230, 0.6)");
  grad.addColorStop(0.3, "rgba(180, 200, 220, 0.2)");
  grad.addColorStop(0.6, "rgba(150, 180, 210, 0.05)");
  grad.addColorStop(1, "rgba(130, 160, 200, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
};

// ─── Component ───────────────────────────────────────────────────────────────

interface HeroCanvasProps {
  scrollProgress: number;
  timeOfDay: number;
}

export default function HeroCanvas({ scrollProgress, timeOfDay }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(scrollProgress);
  const timeRef = useRef(timeOfDay);

  scrollRef.current = scrollProgress;
  timeRef.current = timeOfDay;

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId: number;
    const isMobile = window.innerWidth < 768;

    // ─── Renderer Setup ──────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75);
    const w = window.innerWidth;
    const h = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: dpr < 1.5,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.48;
    renderer.debug.checkShaderErrors = false;

    // ─── Scene & Camera ──────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const fog = new THREE.FogExp2(0x0a1f24, 0.015);
    scene.fog = fog;

    const camera = new THREE.PerspectiveCamera(62, w / h, 0.1, 120);
    camera.position.set(6.02, 1.42, 4.9);
    scene.add(camera);

    // ─── Lighting ────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x9ee8ec, 0x3d8a7a, 0.55);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.castShadow = false;
    scene.add(sunLight);

    // Fill light from lake direction to illuminate villa front
    const fillLight = new THREE.DirectionalLight(0x8ac8d0, 0.25);
    fillLight.position.set(0, 3, -8);
    scene.add(fillLight);

    // ─── Sky Dome ────────────────────────────────────────────────────────
    const skyGeo = new THREE.SphereGeometry(60, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERTEX,
      fragmentShader: SKY_FRAGMENT,
      uniforms: {
        uColorTop: { value: new THREE.Color() },
        uColorBottom: { value: new THREE.Color() },
        uSunDirection: { value: new THREE.Vector3() },
        uSunColor: { value: new THREE.Color() },
        uSunSize: { value: 0.035 },
        uTime: { value: 0.0 },
        uGoldenHourBoost: { value: 0.0 },
        uIsNight: { value: 0.0 },
        uWindX: { value: 1.0 },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // ─── Sun & Moon Celestial Bodies ─────────────────────────────────────
    const sunGlowTex = createSunGlowTexture();
    const moonGlowTex = createMoonGlowTexture();

    // Sun orb
    const sunOrbGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const sunOrbMat = new THREE.MeshBasicMaterial({
      color: 0xfff5d0,
      fog: false,
    });
    const sunOrb = new THREE.Mesh(sunOrbGeo, sunOrbMat);

    const sunGlowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: sunGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      })
    );
    sunGlowSprite.scale.set(12, 12, 1);
    sunOrb.add(sunGlowSprite);
    scene.add(sunOrb);

    // Moon orb
    const moonOrbGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const moonOrbMat = new THREE.MeshBasicMaterial({
      color: 0xd8d4cc,
      fog: false,
    });
    const moonOrb = new THREE.Mesh(moonOrbGeo, moonOrbMat);

    const moonGlowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: moonGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      })
    );
    moonGlowSprite.scale.set(5, 5, 1);
    moonOrb.add(moonGlowSprite);
    scene.add(moonOrb);

    // ─── 3D Cloud Clusters ───────────────────────────────────────────────
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      fog: false,
    });

    interface CloudData {
      group: THREE.Group;
      baseX: number;
      baseY: number;
      baseZ: number;
      speed: number;
    }

    const cloudGeometries: THREE.IcosahedronGeometry[] = [];
    const cloudsData: CloudData[] = [];
    const cloudCount = isMobile ? 5 : 10;

    const createCloudCluster = (scale: number): THREE.Group => {
      const cloud = new THREE.Group();
      const puffCount = 5 + Math.floor(Math.random() * 5);
      for (let i = 0; i < puffCount; i++) {
        const r = 0.4 + Math.random() * 0.6;
        const geo = new THREE.IcosahedronGeometry(r, 1);
        cloudGeometries.push(geo);
        const puff = new THREE.Mesh(geo, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 3.0,
          (Math.random() - 0.3) * 0.8,
          (Math.random() - 0.5) * 1.5
        );
        puff.scale.set(
          0.8 + Math.random() * 0.4,
          0.5 + Math.random() * 0.3,
          0.7 + Math.random() * 0.3
        );
        cloud.add(puff);
      }
      cloud.scale.setScalar(scale);
      return cloud;
    };

    for (let i = 0; i < cloudCount; i++) {
      const cx = -20 + Math.random() * 40;
      const cy = 12 + Math.random() * 18;
      const cz = -25 + Math.random() * 15;
      const cScale = 1.5 + Math.random() * 2.5;

      const cloudGroup = createCloudCluster(cScale);
      cloudGroup.position.set(cx, cy, cz);
      cloudGroup.rotation.y = Math.random() * Math.PI;
      scene.add(cloudGroup);

      cloudsData.push({
        group: cloudGroup,
        baseX: cx,
        baseY: cy,
        baseZ: cz,
        speed: 0.002 + Math.random() * 0.004,
      });
    }

    // ─── Procedural Textures ─────────────────────────────────────────────
    const woodTexture = createWoodTexture();
    const concreteTexture = createConcreteTexture();
    const leafTexture = createPalmLeafTexture();
    const roadTexture = createRoadTexture();
    const barkTexture = createBarkTexture();

    // ─── Materials ───────────────────────────────────────────────────────
    const woodPlankMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.1,
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      map: concreteTexture,
      roughness: 0.72,
      metalness: 0.12,
    });

    const leafMaterial = new THREE.MeshStandardMaterial({
      map: leafTexture,
      color: 0x5aaa78,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      roughness: 0.75,
    });

    const leafGeo = new THREE.PlaneGeometry(0.7, 1.8);
    leafGeo.translate(0, 0.9, 0);

    // ─── Water Geometry & Material ───────────────────────────────────────
    const SEG = isMobile ? 120 : 200;
    const waterGeo = new THREE.PlaneGeometry(20, 24, SEG, SEG);

    const waterUniforms = {
      uTime: { value: 0 },
      uWaveSpeed: { value: 0.2 },
      uWaveAmplitude: { value: 0.045 },
      uWaterColor: { value: new THREE.Color(0x35a8ac) },
      uWaterSpecularColor: { value: new THREE.Color(0xfff) },
      uSkyTop: { value: new THREE.Color(0x2e9b9e) },
      uSkyBottom: { value: new THREE.Color(0xfff5e8) },
      uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
      uSunIntensity: { value: 1.0 },
      uScrollProgress: { value: 0.0 },
      uShoreWorldZ: { value: SHORE_WORLD_Z },
      uLakeCenter: { value: LAKE_CENTER.clone() },
      uLakeRadius: { value: LAKE_RADIUS },
      uLanternViewPosition: { value: new THREE.Vector3(0, 0, 0) },
      uLanternPlanePos: { value: new THREE.Vector2(0, 0) },
      uLanternColor: { value: new THREE.Color(0xffb04d) },
      uLanternIntensity: { value: 0.0 },
      uShoreProximity: { value: 0.0 },
    };

    const waterMat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERTEX,
      fragmentShader: WATER_FRAGMENT,
      uniforms: waterUniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    // Lake is in FRONT of road (negative Z), centered slightly left
    waterMesh.position.set(-0.5, WATER_Y, -8);
    scene.add(waterMesh);

    // ─── Terrain: Ground beneath villa ───────────────────────────────────
    const villaGroundGeo = new THREE.PlaneGeometry(12, 10);
    const villaGroundMat = new THREE.MeshStandardMaterial({
      color: 0x5a8a4a,
      roughness: 0.94,
    });
    const villaGroundMesh = new THREE.Mesh(villaGroundGeo, villaGroundMat);
    villaGroundMesh.rotation.x = -Math.PI / 2;
    villaGroundMesh.position.set(5, GROUND_Y, 4);
    scene.add(villaGroundMesh);

    // ─── Road — elevated, runs along X axis in front of villa ────────────
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      color: 0x5a5550,
      roughness: 0.96,
    });
    const roadGeo = new THREE.PlaneGeometry(24, 2.8);
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    // Road at z ≈ 0, elevated above water
    roadMesh.position.set(0, ROAD_Y, 0.2);
    scene.add(roadMesh);

    // Road edge curbs
    const curbGeo = new THREE.BoxGeometry(24, 0.06, 0.12);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x8a8880, roughness: 0.8 });
    const curbNear = new THREE.Mesh(curbGeo, curbMat);
    curbNear.position.set(0, ROAD_Y + 0.02, 1.55);
    scene.add(curbNear);
    const curbFar = new THREE.Mesh(curbGeo, curbMat);
    curbFar.position.set(0, ROAD_Y + 0.02, -1.15);
    scene.add(curbFar);

    // ─── Grass Strip between road and lake ────────────────────────────────
    // This is the grassy embankment with terrain height difference
    const grassStripSeg = 40;
    const grassStripGeo = new THREE.PlaneGeometry(22, 3.5, grassStripSeg, grassStripSeg);
    grassStripGeo.rotateX(-Math.PI / 2);

    // Displace vertices to create slope from road level to water level
    const gsPositions = grassStripGeo.attributes.position;
    for (let i = 0; i < gsPositions.count; i++) {
      const z = gsPositions.getZ(i);
      const x = gsPositions.getX(i);
      // z goes from -1.75 to 1.75 (half-width of 3.5)
      // 1.75 = near road (top), -1.75 = near water (bottom)
      const t = (z + 1.75) / 3.5; // 0=water side, 1=road side
      const slopeY = THREE.MathUtils.lerp(WATER_Y + 0.08, ROAD_Y - 0.02, t * t);
      // Add subtle terrain undulation
      const noise = Math.sin(x * 1.8 + z * 2.3) * 0.02 + Math.cos(x * 3.1) * 0.01;
      gsPositions.setY(i, slopeY + noise);
    }
    grassStripGeo.computeVertexNormals();

    const grassStripMat = new THREE.MeshStandardMaterial({
      color: 0x5e9a4e,
      roughness: 0.92,
    });
    const grassStripMesh = new THREE.Mesh(grassStripGeo, grassStripMat);
    // Position between road (z≈-1.2) and lake (z≈-3)
    grassStripMesh.position.set(0, 0, -3.0);
    scene.add(grassStripMesh);

    // ─── Lake Field — angled at ~120° CCW from road ──────────────────────
    // Grassy terrain connecting road's left side to lake's left shore
    const lakeFieldGeo = new THREE.PlaneGeometry(5, 7, 10, 14);
    lakeFieldGeo.rotateX(-Math.PI / 2);

    const lfPositions = lakeFieldGeo.attributes.position;
    for (let i = 0; i < lfPositions.count; i++) {
      const localZ = lfPositions.getZ(i); // -3.5 to 3.5
      const t = (localZ + 3.5) / 7.0; // 0=lake side, 1=road side
      // Same height as road near road, slopes to near-water near lake
      const slopeY = THREE.MathUtils.lerp(WATER_Y + 0.12, ROAD_Y - 0.01, t * t);
      const nx = lfPositions.getX(i);
      const noise = Math.sin(nx * 2.0 + localZ * 1.5) * 0.015;
      lfPositions.setY(i, slopeY + noise);
    }
    lakeFieldGeo.computeVertexNormals();

    const lakeFieldMat = new THREE.MeshStandardMaterial({
      color: 0x6aaa5a,
      roughness: 0.9,
    });
    const lakeFieldMesh = new THREE.Mesh(lakeFieldGeo, lakeFieldMat);
    // 120° CCW from road direction: rotate around Y
    // Road goes along +X. 120° CCW in top-down view:
    // cos(120°) = -0.5, sin(120°) = 0.866
    // The field extends toward upper-left from the road
    lakeFieldMesh.rotation.y = (120 * Math.PI) / 180;
    lakeFieldMesh.position.set(-5.8, 0, -2.8);
    scene.add(lakeFieldMesh);

    // ─── Far Shore & Shoreline (organic sloped plane) ───────────────────
    const landscapeGroup = new THREE.Group();
    scene.add(landscapeGroup);

    const getTerrainHeight = (x: number, z: number) => {
      const localZ = z - (-28);
      const t = THREE.MathUtils.clamp((8 - localZ) / 16, 0, 1);
      const shoreBlend = THREE.MathUtils.smoothstep(-20, -16, z);
      const slopeY = THREE.MathUtils.lerp(WATER_Y + 0.05, WATER_Y - 0.02 + t * 3.5, shoreBlend);
      const shoreCurve = Math.sin(x * 0.15) * 0.35 + Math.cos(x * 0.08) * 0.18;
      const detailNoise = Math.sin(x * 1.0 + localZ * 1.3) * 0.1 + Math.cos(x * 2.2) * 0.05;
      return slopeY + detailNoise + shoreCurve * Math.max(0, 1 - t * 1.5);
    };

    // Shore transition wedge — blends lake embankment into far terrain
    const shoreWedgeGeo = new THREE.PlaneGeometry(42, 6, 28, 8);
    shoreWedgeGeo.rotateX(-Math.PI / 2);
    const swPos = shoreWedgeGeo.attributes.position;
    for (let i = 0; i < swPos.count; i++) {
      const x = swPos.getX(i);
      const localZ = swPos.getZ(i);
      const worldZ = -17 + localZ;
      const t = THREE.MathUtils.clamp((localZ + 3) / 6, 0, 1);
      const y = THREE.MathUtils.lerp(WATER_Y + 0.1, getTerrainHeight(x, worldZ), t * t);
      swPos.setY(i, y);
    }
    shoreWedgeGeo.computeVertexNormals();
    const shoreWedgeMat = new THREE.MeshStandardMaterial({
      color: 0x4a7a52,
      roughness: 0.94,
    });
    const shoreWedgeMesh = new THREE.Mesh(shoreWedgeGeo, shoreWedgeMat);
    shoreWedgeMesh.position.set(0, 0, -17);
    landscapeGroup.add(shoreWedgeMesh);

    const farTerrainGeo = new THREE.PlaneGeometry(50, 16, 40, 20);
    farTerrainGeo.rotateX(-Math.PI / 2);

    const ftPositions = farTerrainGeo.attributes.position;
    for (let i = 0; i < ftPositions.count; i++) {
      const x = ftPositions.getX(i);
      const localZ = ftPositions.getZ(i); // local Z goes from -8 to 8
      const worldZ = -28 + localZ; // convert to world Z
      const height = getTerrainHeight(x, worldZ);
      ftPositions.setY(i, height);
    }
    farTerrainGeo.computeVertexNormals();

    const farTerrainMat = new THREE.MeshStandardMaterial({
      color: 0x3d5a42, // beautiful deep forest green
      roughness: 0.95,
      metalness: 0.02,
    });
    const farTerrainMesh = new THREE.Mesh(farTerrainGeo, farTerrainMat);
    // Center it at z = -28. It spans from z = -20 to z = -36
    farTerrainMesh.position.set(0, 0, -28);
    landscapeGroup.add(farTerrainMesh);

    // Mountains (positioned smoothly on the sloped terrain)
    const mtnMat = new THREE.MeshStandardMaterial({ color: 0x4a6a62, roughness: 0.95 });
    const mountainGeo1 = new THREE.ConeGeometry(6.5, 5.5, 10);
    const mountain1 = new THREE.Mesh(mountainGeo1, mtnMat);
    const m1z = -28;
    const m1x = -7;
    mountain1.position.set(m1x, getTerrainHeight(m1x, m1z) + 2.75, m1z); // Center of ConeGeometry is half its height (5.5 / 2 = 2.75)
    landscapeGroup.add(mountain1);

    const mtnMat2 = new THREE.MeshStandardMaterial({ color: 0x3d5e55, roughness: 0.92 });
    const mountainGeo2 = new THREE.ConeGeometry(5.0, 4.2, 10);
    const mountain2 = new THREE.Mesh(mountainGeo2, mtnMat2);
    const m2z = -30;
    const m2x = 5;
    mountain2.position.set(m2x, getTerrainHeight(m2x, m2z) + 2.1, m2z); // 4.2 / 2 = 2.1
    landscapeGroup.add(mountain2);

    const mountainGeo3 = new THREE.ConeGeometry(4.0, 3.5, 8);
    const mountain3 = new THREE.Mesh(mountainGeo3, mtnMat);
    const m3z = -32;
    const m3x = 0;
    mountain3.position.set(m3x, getTerrainHeight(m3x, m3z) + 1.75, m3z); // 3.5 / 2 = 1.75
    landscapeGroup.add(mountain3);

    // ─── Forest Trees along far shore (enhanced multi-layer crowns) ──────
    const forestTrunkMat = new THREE.MeshStandardMaterial({
      map: barkTexture,
      color: 0x3d4a32,
      roughness: 0.9,
    });
    const forestCrownMats = [
      new THREE.MeshStandardMaterial({ color: 0x2d6a48, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x357a52, roughness: 0.82 }),
      new THREE.MeshStandardMaterial({ color: 0x2a5e3e, roughness: 0.88 }),
    ];
    const forestTrunkGeo = new THREE.CylinderGeometry(0.05, 0.12, 1.4, 6);
    const forestCrownGeo1 = new THREE.ConeGeometry(0.65, 1.0, 7);
    const forestCrownGeo2 = new THREE.ConeGeometry(0.50, 0.8, 7);
    const forestCrownGeo3 = new THREE.IcosahedronGeometry(0.55, 1);

    const forestTreeCount = isMobile ? 30 : 55;
    for (let f = 0; f < forestTreeCount; f++) {
      const tree = new THREE.Group();
      const tx = -14 + Math.random() * 28;
      // Spans from Z = -20 to -26 (water edge to forest area)
      const tz = -20 - Math.random() * 6;
      const treeHeight = 0.8 + Math.random() * 1.2;
      
      const treeY = getTerrainHeight(tx, tz);
      
      tree.position.set(tx, treeY - 0.05, tz);
      tree.scale.y = treeHeight;

      const trunk = new THREE.Mesh(forestTrunkGeo, forestTrunkMat);
      trunk.position.y = 0.7;
      tree.add(trunk);

      const matIdx = f % 3;
      // Multi-layer crown
      if (Math.random() > 0.4) {
        // Conifer-style: stacked cones
        const c1 = new THREE.Mesh(forestCrownGeo1, forestCrownMats[matIdx]);
        c1.position.y = 1.3;
        tree.add(c1);
        const c2 = new THREE.Mesh(forestCrownGeo2, forestCrownMats[(matIdx + 1) % 3]);
        c2.position.y = 1.85;
        tree.add(c2);
      } else {
        // Broadleaf-style: icosahedron
        const c = new THREE.Mesh(forestCrownGeo3, forestCrownMats[matIdx]);
        c.position.y = 1.5;
        c.scale.set(1.1, 0.8, 1.1);
        tree.add(c);
      }

      // Slight random lean for natural look
      tree.rotation.z = (Math.random() - 0.5) * 0.08;
      landscapeGroup.add(tree);
    }

    // Ground bushes along embankment
    const bushGeo = new THREE.IcosahedronGeometry(0.25, 1);
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x4a8a52, roughness: 0.9 });
    for (let b = 0; b < 18; b++) {
      const bush = new THREE.Mesh(bushGeo, bushMat);
      const bx = -8 + Math.random() * 16;
      const bz = -2.5 - Math.random() * 2;
      const t = Math.max(0, Math.min(1, (-bz - 2.5) / 2.0));
      const by = THREE.MathUtils.lerp(ROAD_Y, WATER_Y + 0.15, t);
      bush.position.set(bx, by + 0.1, bz);
      bush.scale.set(
        0.7 + Math.random() * 0.6,
        0.5 + Math.random() * 0.4,
        0.7 + Math.random() * 0.6
      );
      scene.add(bush);
    }

    // Reeds along waterline
    const reedMat = new THREE.MeshStandardMaterial({
      color: 0x5cb87a,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });
    const reedGeo = new THREE.PlaneGeometry(0.05, 0.75);
    const reedsData: Array<{ mesh: THREE.Mesh; baseRotZ: number; phase: number }> = [];
    for (let r = 0; r < 30; r++) {
      const reed = new THREE.Mesh(reedGeo, reedMat);
      const rx = -6 + r * 0.6 + (Math.random() - 0.5) * 0.3;
      const baseRotZ = (Math.random() - 0.5) * 0.12;
      reed.position.set(rx, WATER_Y + 0.2 + Math.random() * 0.1, -4.8 - Math.random() * 1.5);
      reed.rotation.y = (Math.random() - 0.5) * 0.4;
      reed.rotation.z = baseRotZ;
      scene.add(reed);
      reedsData.push({ mesh: reed, baseRotZ, phase: Math.random() * Math.PI * 2 });
    }

    // Rocks along the shore
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a7a72, roughness: 0.82 });
    const rocks: THREE.Mesh[] = [];

    const rockPositions = [
      [-4.5, WATER_Y + 0.05, -5.0, 0.5, 0.6, 0.5],
      [2.5, WATER_Y + 0.03, -5.5, 0.4, 0.5, 0.4],
      [6.0, WATER_Y + 0.04, -4.8, 0.35, 0.45, 0.35],
      [-1.0, WATER_Y + 0.02, -5.8, 0.6, 0.4, 0.55],
      [-7.5, WATER_Y + 0.06, -4.5, 0.45, 0.5, 0.4],
    ];

    rockPositions.forEach(([rx, ry, rz, sx, sy, sz]) => {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(rx, ry, rz);
      rock.scale.set(sx, sy, sz);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(rock);
      rocks.push(rock);
    });

    // ─── Villa (enhanced architecture) ───────────────────────────────────
    const villaGroup = new THREE.Group();
    // Villa on positive X, positive Z — behind road, right side
    villaGroup.position.set(6, GROUND_Y + 0.88, 3.5);
    // Rotate villa to face the road/lake (face toward -Z)
    villaGroup.rotation.y = -0.15;
    scene.add(villaGroup);

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf2ebe0,
      roughness: 0.82,
    });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a5c62, roughness: 0.75 });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x8ec2d0,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.65,
    });
    const windowFrameMat = new THREE.MeshStandardMaterial({
      color: 0x6a5d54,
      roughness: 0.35,
      metalness: 0.45,
      transparent: true,
      opacity: 0.85,
    });

    // Ground floor (hollow structure)
    const gfFloorGeo = new THREE.BoxGeometry(3.6, 0.1, 5.0);
    const gfFloor = new THREE.Mesh(gfFloorGeo, concreteMat);
    gfFloor.position.set(0, -1.15, 0);
    villaGroup.add(gfFloor);

    const gfBackGeo = new THREE.BoxGeometry(3.6, 1.1, 0.1);
    const gfBack = new THREE.Mesh(gfBackGeo, wallMat);
    gfBack.position.set(0, -0.6, 2.45);
    villaGroup.add(gfBack);

    const gfLeftGeo = new THREE.BoxGeometry(0.1, 1.1, 5.0);
    const gfLeft = new THREE.Mesh(gfLeftGeo, wallMat);
    gfLeft.position.set(-1.75, -0.6, 0);
    villaGroup.add(gfLeft);

    const gfRightGeo = new THREE.BoxGeometry(0.1, 1.1, 5.0);
    const gfRight = new THREE.Mesh(gfRightGeo, wallMat);
    gfRight.position.set(1.75, -0.6, 0);
    villaGroup.add(gfRight);

    // Upper floor (hollow structure)
    const ufFloorGeo = new THREE.BoxGeometry(3.8, 0.1, 5.2);
    const ufFloor = new THREE.Mesh(ufFloorGeo, concreteMat);
    ufFloor.position.set(0, 0.05, 0);
    villaGroup.add(ufFloor);

    const ufBackGeo = new THREE.BoxGeometry(3.8, 1.5, 0.1);
    const ufBack = new THREE.Mesh(ufBackGeo, wallMat);
    ufBack.position.set(0, 0.85, 2.55);
    villaGroup.add(ufBack);

    const ufLeftGeo = new THREE.BoxGeometry(0.1, 1.5, 5.2);
    const ufLeft = new THREE.Mesh(ufLeftGeo, wallMat);
    ufLeft.position.set(-1.85, 0.85, 0);
    villaGroup.add(ufLeft);

    const ufRightGeo = new THREE.BoxGeometry(0.1, 1.5, 5.2);
    const ufRight = new THREE.Mesh(ufRightGeo, wallMat);
    ufRight.position.set(1.85, 0.85, 0);
    villaGroup.add(ufRight);

    // Front Glass Facade (Upper Floor lakeside view)
    const glassFacadeGeo = new THREE.BoxGeometry(3.8, 1.5, 0.02);
    const glassFacadeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      roughness: 0.02,
      metalness: 0.05,
      transmission: 0.96,
      thickness: 0.01,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glassFacade = new THREE.Mesh(glassFacadeGeo, glassFacadeMat);
    glassFacade.position.set(0, 0.85, -2.55);
    villaGroup.add(glassFacade);

    // Elegant vertical window frame mullions on glass facade
    const mullionGeo = new THREE.BoxGeometry(0.018, 1.5, 0.012);
    for (let m = 0; m < 4; m++) {
      const mullion = new THREE.Mesh(mullionGeo, windowFrameMat);
      mullion.position.set(-1.8 + m * 1.2, 0.85, -2.54);
      villaGroup.add(mullion);
    }

    // Roof with slight overhang
    const villaRoofGeo = new THREE.BoxGeometry(4.2, 0.18, 5.6);
    const villaRoof = new THREE.Mesh(villaRoofGeo, roofMat);
    villaRoof.position.set(0, 1.72, 0);
    villaGroup.add(villaRoof);

    // Balcony facing the lake
    const balconyGeo = new THREE.BoxGeometry(3.9, 0.04, 1.0);
    const balconyMat = new THREE.MeshStandardMaterial({
      map: concreteTexture,
      color: 0xd8d2c8,
      roughness: 0.78,
      transparent: true,
      opacity: 0.92,
    });
    const balcony = new THREE.Mesh(balconyGeo, balconyMat);
    balcony.position.set(0, 0.12, -2.75);
    villaGroup.add(balcony);

    // Balcony railing
    const railGeo = new THREE.BoxGeometry(3.9, 0.4, 0.03);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x3a4a4e, roughness: 0.3, metalness: 0.8 });
    const railing = new THREE.Mesh(railGeo, railMat);
    railing.position.set(0, 0.38, -3.32);
    villaGroup.add(railing);

    // Railing posts
    const postGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6);
    for (let p = 0; p < 8; p++) {
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(-1.7 + p * 0.49, 0.36, -3.32);
      villaGroup.add(post);
    }

    // Ground floor windows and door
    const winFrameGeo = new THREE.BoxGeometry(0.82, 0.67, 0.012);
    const windowGeo = new THREE.PlaneGeometry(0.75, 0.6);
    for (let wn = 0; wn < 2; wn++) {
      const win = new THREE.Mesh(windowGeo, windowMat);
      win.position.set(-0.6 + wn * 1.2, -0.35, -2.48);
      villaGroup.add(win);

      const frame = new THREE.Mesh(winFrameGeo, windowFrameMat);
      frame.position.set(-0.6 + wn * 1.2, -0.35, -2.475);
      villaGroup.add(frame);
    }

    const doorGeo = new THREE.PlaneGeometry(0.6, 1.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2e22, roughness: 0.7 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0.6, -0.6, -2.48);
    villaGroup.add(door);

    // Porch pillars
    const pillarGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.6, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.6 });
    const pillarPositions = [-1.6, -0.5, 0.5, 1.6];
    pillarPositions.forEach((px) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, -0.4, -2.95);
      villaGroup.add(pillar);
    });

    // Porch overhang — thin, elevated to avoid blocking lake view
    const porchRoofGeo = new THREE.BoxGeometry(3.6, 0.03, 0.55);
    const porchRoofMat = new THREE.MeshStandardMaterial({
      color: 0x4a5c62,
      roughness: 0.75,
      transparent: true,
      opacity: 0.55,
    });
    const porchRoof = new THREE.Mesh(porchRoofGeo, porchRoofMat);
    porchRoof.position.set(0, 0.58, -2.88);
    villaGroup.add(porchRoof);

    // Chimney
    const chimneyGeo = new THREE.BoxGeometry(0.35, 0.8, 0.35);
    const chimney = new THREE.Mesh(chimneyGeo, new THREE.MeshStandardMaterial({ color: 0x6a5a50, roughness: 0.85 }));
    chimney.position.set(1.3, 2.1, 1.2);
    villaGroup.add(chimney);

    // ─── Interior Details for Hollow Upper Floor ─────────────────────────
    const interiorGroup = new THREE.Group();
    villaGroup.add(interiorGroup);

    // Sofa
    const fabricMat = new THREE.MeshStandardMaterial({
      color: 0xdfdcd6,
      roughness: 0.85,
    });
    const woodTrimMat = new THREE.MeshStandardMaterial({
      color: 0x4a3c31,
      roughness: 0.6,
    });

    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 0.75), fabricMat);
    sofaBase.position.set(-0.3, 0.15, 1.1);
    interiorGroup.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.18), fabricMat);
    sofaBack.position.set(-0.3, 0.45, 1.48);
    interiorGroup.add(sofaBack);

    const sofaArmL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.75), fabricMat);
    sofaArmL.position.set(-1.3, 0.28, 1.1);
    interiorGroup.add(sofaArmL);

    const sofaArmR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.75), fabricMat);
    sofaArmR.position.set(0.7, 0.28, 1.1);
    interiorGroup.add(sofaArmR);

    // Coffee table
    const glassTableMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6,
      thickness: 0.05,
    });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.5), glassTableMat);
    tableTop.position.set(-0.3, 0.18, 0.4);
    interiorGroup.add(tableTop);

    const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6);
    const legPositions = [
      [-0.72, 0.09, 0.18],
      [0.12, 0.09, 0.18],
      [-0.72, 0.09, 0.62],
      [0.12, 0.09, 0.62],
    ];
    legPositions.forEach(([lx, ly, lz], idx) => {
      const leg = new THREE.Mesh(legGeo, woodTrimMat);
      leg.position.set(lx, ly, lz);
      interiorGroup.add(leg);
    });

    // Bulbs / Pendant Lamps hanging from the ceiling
    const cordGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.65, 6);
    const cordMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    const bulbGeoInt = new THREE.SphereGeometry(0.05, 8, 8);
    const bulbMatInt = new THREE.MeshBasicMaterial({ color: 0xffe0a0 });

    // Lamp 1
    const cord1 = new THREE.Mesh(cordGeo, cordMat);
    cord1.position.set(-0.5, 1.32, 0.4);
    interiorGroup.add(cord1);
    const bulb1 = new THREE.Mesh(bulbGeoInt, bulbMatInt);
    bulb1.position.set(-0.5, 0.95, 0.4);
    interiorGroup.add(bulb1);

    // Lamp 2
    const cord2 = new THREE.Mesh(cordGeo, cordMat);
    cord2.position.set(0.3, 1.32, 0.4);
    interiorGroup.add(cord2);
    const bulb2 = new THREE.Mesh(bulbGeoInt, bulbMatInt);
    bulb2.position.set(0.3, 0.95, 0.4);
    interiorGroup.add(bulb2);

    // Interior Point Light (warm cozy ambiance inside)
    const interiorLight = new THREE.PointLight(0xffa550, 0.8, 8.0);
    interiorLight.position.set(-0.1, 1.0, 0.6);
    interiorGroup.add(interiorLight);

    // Corner Plant
    const potGeo = new THREE.CylinderGeometry(0.14, 0.1, 0.28, 8);
    const pot = new THREE.Mesh(potGeo, concreteMat);
    pot.position.set(1.4, 0.19, 1.9);
    interiorGroup.add(pot);

    const plantStemGeo = new THREE.CylinderGeometry(0.008, 0.015, 0.7, 6);
    const plantStem = new THREE.Mesh(plantStemGeo, woodTrimMat);
    plantStem.position.set(1.4, 0.45, 1.9);
    plantStem.rotation.z = -0.15;
    interiorGroup.add(plantStem);

    const plantLeaves = new THREE.Group();
    plantLeaves.position.set(1.35, 0.75, 1.9);
    for (let l = 0; l < 6; l++) {
      const leaf = new THREE.Mesh(leafGeo, leafMaterial);
      leaf.scale.setScalar(0.4);
      leaf.rotation.y = (l / 6) * Math.PI * 2;
      leaf.rotation.x = 0.6 + Math.random() * 0.3;
      plantLeaves.add(leaf);
    }
    interiorGroup.add(plantLeaves);

    // Accent armchair
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), fabricMat);
    chairSeat.position.set(1.1, 0.14, 0.35);
    interiorGroup.add(chairSeat);
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.1), fabricMat);
    chairBack.position.set(1.1, 0.38, 0.58);
    interiorGroup.add(chairBack);

    // Area rug
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x8a7a68, roughness: 0.95 });
    const rug = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.02, 1.6), rugMat);
    rug.position.set(-0.2, 0.08, 0.75);
    interiorGroup.add(rug);

    // Wall sconces flanking the view
    const sconceMat = new THREE.MeshStandardMaterial({
      color: 0xc9a55a,
      emissive: 0xffa040,
      emissiveIntensity: 0.35,
      metalness: 0.6,
      roughness: 0.3,
    });
    const sconceGeo = new THREE.BoxGeometry(0.08, 0.15, 0.06);
    const sconceL = new THREE.Mesh(sconceGeo, sconceMat);
    sconceL.position.set(-1.55, 1.05, -1.8);
    interiorGroup.add(sconceL);
    const sconceR = new THREE.Mesh(sconceGeo, sconceMat);
    sconceR.position.set(1.55, 1.05, -1.8);
    interiorGroup.add(sconceR);

    const sconceLightL = new THREE.PointLight(0xffb060, 0.4, 4);
    sconceLightL.position.set(-1.55, 1.05, -1.6);
    interiorGroup.add(sconceLightL);
    const sconceLightR = new THREE.PointLight(0xffb060, 0.4, 4);
    sconceLightR.position.set(1.55, 1.05, -1.6);
    interiorGroup.add(sconceLightR);

    // Exterior Balcony lantern (bulbSphere & warmLight) hanging from the overhang
    const bulbGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd090 });
    const bulbSphere = new THREE.Mesh(bulbGeo, bulbMat);
    bulbSphere.position.set(0, 1.45, -2.8);
    villaGroup.add(bulbSphere);

    const warmLight = new THREE.PointLight(0xffa04d, 0, 14);
    warmLight.position.set(0, 1.4, -2.7);
    villaGroup.add(warmLight);

    // Garden path from villa to road
    const pathGeo = new THREE.PlaneGeometry(0.8, 3.5);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.88 });
    const gardenPath = new THREE.Mesh(pathGeo, pathMat);
    gardenPath.rotation.x = -Math.PI / 2;
    gardenPath.position.set(6.2, GROUND_Y + 0.01, 1.5);
    scene.add(gardenPath);

    // Foreground lens silhouette leaf
    const foregroundLeafGeo = new THREE.PlaneGeometry(2.2, 4.4);
    foregroundLeafGeo.translate(0, 2.2, 0);
    const fgLeafMat = leafMaterial.clone();
    fgLeafMat.transparent = true;
    fgLeafMat.opacity = 0.28;
    const fgLeafMesh = new THREE.Mesh(foregroundLeafGeo, fgLeafMat);
    camera.add(fgLeafMesh);
    fgLeafMesh.position.set(-2.2, -2.0, -2.8);
    fgLeafMesh.rotation.set(0.5, 0.6, -0.3);
    fgLeafMesh.scale.setScalar(0.7);

    // ─── Shoreline Palm Trees ────────────────────────────────────────────
    const palmsGroup = new THREE.Group();
    scene.add(palmsGroup);

    const trunkMaterial = new THREE.MeshStandardMaterial({
      map: barkTexture,
      color: 0x4a6a52,
      roughness: 0.88,
    });

    const palmsCount = 7;
    const palmsData: Array<{ group: THREE.Group; baseRotationZ: number; index: number }> = [];
    const trunkGeo = new THREE.CylinderGeometry(0.015, 0.055, 4.0, 8);

    for (let i = 0; i < palmsCount; i++) {
      const palmTree = new THREE.Group();
      const x = -7.5 + i * 2.8 + (Math.random() - 0.5) * 0.8;
      // Grass strip between road (z ~ -1.2) and lake shore (z ~ -4.8) — never in water
      const z = -2.1 - Math.random() * 2.4;
      
      // Calculate palm Y height based on the grass slope height at that Z
      const localZ = z - (-3.0);
      const t = THREE.MathUtils.clamp((localZ + 1.75) / 3.5, 0, 1);
      const palmY = THREE.MathUtils.lerp(WATER_Y + 0.08, ROAD_Y - 0.02, t * t);
      
      palmTree.position.set(x, palmY, z);

      const leanZ = (Math.random() - 0.5) * 0.18 + (x < 0 ? -0.1 : 0.1);
      palmTree.rotation.z = leanZ;

      const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
      trunk.position.y = 2.0;
      palmTree.add(trunk);

      const leavesGroup = new THREE.Group();
      leavesGroup.position.y = 4.0;
      for (let j = 0; j < 10; j++) {
        const leafMesh = new THREE.Mesh(leafGeo, leafMaterial);
        const angle = (j / 10) * Math.PI * 2;
        leafMesh.rotation.y = angle;
        leafMesh.rotation.x = 0.52 + Math.random() * 0.14;
        leafMesh.rotation.z = (Math.random() - 0.5) * 0.1;
        leavesGroup.add(leafMesh);
      }
      palmTree.add(leavesGroup);
      palmsGroup.add(palmTree);

      palmsData.push({ group: palmTree, baseRotationZ: leanZ, index: i });
    }

    // ─── Birds (3D body + wings) ─────────────────────────────────────────
    const birdBodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a3840,
      roughness: 0.65,
      metalness: 0.08,
      transparent: true,
      opacity: 1,
    });
    const birdWingMat = new THREE.MeshStandardMaterial({
      color: 0x3d4f58,
      roughness: 0.55,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });

    const birdsData: Array<{
      group: THREE.Group;
      wingL: THREE.Mesh;
      wingR: THREE.Mesh;
      speed: number;
      phase: number;
      radius: number;
      baseX: number;
      baseY: number;
    }> = [];

    const birdBodyGeo = new THREE.SphereGeometry(0.09, 10, 8);
    birdBodyGeo.scale(1.6, 0.65, 2.8);
    const wingGeo = new THREE.PlaneGeometry(0.62, 0.18);
    wingGeo.translate(-0.28, 0, 0);
    const headGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const beakGeo = new THREE.ConeGeometry(0.018, 0.1, 5);
    beakGeo.rotateX(-Math.PI / 2);
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xc9a55a, roughness: 0.4 });

    for (let i = 0; i < 5; i++) {
      const birdGroup = new THREE.Group();

      const body = new THREE.Mesh(birdBodyGeo, birdBodyMat);
      birdGroup.add(body);

      const head = new THREE.Mesh(headGeo, birdBodyMat);
      head.position.set(0.17, 0.04, 0);
      birdGroup.add(head);

      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.position.set(0.26, 0.02, 0);
      birdGroup.add(beak);

      const wingL = new THREE.Mesh(wingGeo, birdWingMat);
      wingL.position.set(-0.02, 0.06, 0);
      birdGroup.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, birdWingMat);
      wingR.scale.x = -1;
      wingR.position.set(0.02, 0.06, 0);
      birdGroup.add(wingR);

      const birdY = 3.0 + Math.random() * 2.5;
      birdGroup.position.set(-6 + i * 3.5, birdY, -9 - Math.random() * 2);
      birdGroup.scale.setScalar(1.0 + Math.random() * 0.4);
      scene.add(birdGroup);

      birdsData.push({
        group: birdGroup,
        wingL,
        wingR,
        speed: 4.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI,
        radius: 3.5 + Math.random() * 4.0,
        baseX: -6 + i * 3.5,
        baseY: birdY,
      });
    }

    // ─── Floating Lily Pads (repositioned to lake area) ──────────────────
    const padsGroup = new THREE.Group();
    scene.add(padsGroup);

    const padGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.01, 12);
    const padMaterial = new THREE.MeshStandardMaterial({
      color: 0xa8ddb8,
      roughness: 0.7,
      emissive: 0x1a4a38,
      emissiveIntensity: 0.15,
    });

    const lotusMat = new THREE.MeshStandardMaterial({
      color: 0xf4b8c8,
      emissive: 0x6a2848,
      emissiveIntensity: 0.25,
      roughness: 0.65,
    });
    const lotusGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.025, 8);
    const lotusCenterMat = new THREE.MeshStandardMaterial({
      color: 0xffe8a0,
      emissive: 0x8a6020,
      emissiveIntensity: 0.3,
    });
    const lotusCenterGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6);
    const lotusLeafGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.012, 14);
    const lotusLeafMat = new THREE.MeshStandardMaterial({
      color: 0x4a9a68,
      roughness: 0.72,
      side: THREE.DoubleSide,
    });

    const padData: Array<{
      mesh: THREE.Mesh;
      lotus?: THREE.Group;
      x: number;
      z: number;
      phase: number;
      scale: number;
    }> = [];

    for (let i = 0; i < 28; i++) {
      // Position within the lake area (negative Z from road)
      const x = -4 + Math.random() * 8;
      const z = -6 - Math.random() * 6;
      const scale = 0.55 + Math.random() * 0.75;

      const mesh = new THREE.Mesh(
        Math.random() > 0.35 ? padGeometry : lotusLeafGeo,
        Math.random() > 0.35 ? padMaterial : lotusLeafMat
      );
      mesh.scale.set(scale, 1, scale);
      mesh.rotation.y = Math.random() * Math.PI;
      padsGroup.add(mesh);

      let lotusGroup: THREE.Group | undefined;
      if (i % 2 === 0) {
        lotusGroup = new THREE.Group();
        const bloom = new THREE.Mesh(lotusGeo, lotusMat);
        bloom.position.y = 0.02;
        lotusGroup.add(bloom);
        const center = new THREE.Mesh(lotusCenterGeo, lotusCenterMat);
        center.position.y = 0.035;
        lotusGroup.add(center);
        lotusGroup.scale.setScalar(scale);
        padsGroup.add(lotusGroup);
      }

      padData.push({ mesh, lotus: lotusGroup, x, z, phase: Math.random() * Math.PI * 2, scale });
    }

    const getWaveHeightAt = (x: number, z: number, time: number, speed: number, amp: number) => {
      const w1 = Math.sin(x * 0.35 + time * speed * 0.8) * amp * 0.7;
      const w2 = Math.sin(-x * 0.65 + time * speed * 1.3) * amp * 0.35;
      const w3 = Math.cos(x * 1.2 + time * speed * 2.1) * amp * 0.18;
      return w1 + w2 + w3;
    };

    // ─── Lake fish ───────────────────────────────────────────────────────
    const fishGeo = new THREE.SphereGeometry(0.05, 6, 4);
    fishGeo.scale(1.2, 0.45, 2.2);
    const fishMat = new THREE.MeshStandardMaterial({
      color: 0xffa040,
      emissive: 0x442200,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.82,
      roughness: 0.4,
    });
    const fishData: Array<{
      mesh: THREE.Mesh;
      x: number;
      z: number;
      phase: number;
      speed: number;
      radius: number;
    }> = [];

    for (let i = 0; i < 14; i++) {
      const fish = new THREE.Mesh(fishGeo, fishMat);
      const fx = -3 + Math.random() * 7;
      const fz = -7 - Math.random() * 5;
      fish.position.set(fx, WATER_Y - 0.06, fz);
      scene.add(fish);
      fishData.push({
        mesh: fish,
        x: fx,
        z: fz,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.5,
        radius: 0.4 + Math.random() * 0.8,
      });
    }

    // ─── Grass Blade Instances ───────────────────────────────────────────
    const grassBladeGeo = new THREE.PlaneGeometry(0.03, 0.2);
    grassBladeGeo.translate(0, 0.1, 0);
    const grassBladeMat = new THREE.MeshStandardMaterial({
      color: 0x5a9a4e,
      side: THREE.DoubleSide,
      roughness: 0.92,
    });
    const grassCount = isMobile ? 250 : 700;
    const grassInstanced = new THREE.InstancedMesh(grassBladeGeo, grassBladeMat, grassCount);
    const grassDummy = new THREE.Object3D();

    for (let i = 0; i < grassCount; i++) {
      const gx = -10 + Math.random() * 22;
      const gz = -1.5 - Math.random() * 3.5;
      // Height follows the embankment slope
      const slopeT = Math.max(0, Math.min(1, (-gz - 1.5) / 3.5));
      const gy = THREE.MathUtils.lerp(ROAD_Y - 0.02, WATER_Y + 0.12, slopeT * slopeT);

      grassDummy.position.set(gx, gy, gz);
      grassDummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.35);
      grassDummy.scale.set(
        0.7 + Math.random() * 0.5,
        0.5 + Math.random() * 1.0,
        1
      );
      grassDummy.updateMatrix();
      grassInstanced.setMatrixAt(i, grassDummy.matrix);
    }
    grassInstanced.instanceMatrix.needsUpdate = true;
    scene.add(grassInstanced);

    // ─── Mist Particles ──────────────────────────────────────────────────
    const mistTexture = (() => {
      const c = document.createElement("canvas");
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
        grad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(c);
    })();

    const particleCount = isMobile ? 40 : 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleData: Array<{
      index: number;
      speedX: number;
      speedZ: number;
      limitX: number;
      originX: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = WATER_Y + 0.2 + Math.random() * 0.6;
      const z = -5.0 - Math.random() * 10.0;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleData.push({
        index: i,
        speedX: (Math.random() - 0.5) * 0.002,
        speedZ: (Math.random() - 0.5) * 0.001,
        limitX: 4 + Math.random() * 4,
        originX: x,
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.8,
      map: mistTexture,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mistPoints = new THREE.Points(particleGeo, particleMat);
    scene.add(mistPoints);

    // ─── Fireflies / Bioluminescence ─────────────────────────────────────
    const fireflyCount = isMobile ? 15 : 30;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflyData: Array<{ y: number; phase: number; speed: number }> = [];

    for (let i = 0; i < fireflyCount; i++) {
      const fx = (Math.random() - 0.5) * 12.0;
      const fy = WATER_Y + 0.15 + Math.random() * 0.5;
      const fz = -3.0 - Math.random() * 8.0;

      fireflyPositions[i * 3] = fx;
      fireflyPositions[i * 3 + 1] = fy;
      fireflyPositions[i * 3 + 2] = fz;

      fireflyData.push({
        y: fy,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.6,
      });
    }
    fireflyGeo.setAttribute("position", new THREE.BufferAttribute(fireflyPositions, 3));

    const fireflyTexture = (() => {
      const c = document.createElement("canvas");
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, "rgba(255, 185, 91, 0.95)");
        grad.addColorStop(0.4, "rgba(255, 185, 91, 0.3)");
        grad.addColorStop(1, "rgba(255, 185, 91, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(c);
    })();

    const fireflyMat = new THREE.PointsMaterial({
      size: 0.35,
      map: fireflyTexture,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);

    // ─── Camera Path (scroll-keyframed: inside → balcony → road → rise over lake) ──
    const lakeFocusNear = new THREE.Vector3(-0.5, WATER_Y + 0.08, -10.5);
    const lakeFocusMid = new THREE.Vector3(-0.5, WATER_Y, -13.5);
    const lakeFocusFar = new THREE.Vector3(-0.5, WATER_Y - 0.05, -19.0);
    const cameraKeyframes: CameraKeyframe[] = [
      { t: 0.0, pos: new THREE.Vector3(6.02, 1.42, 4.9), look: new THREE.Vector3(4.8, 0.9, -2.0) },
      { t: 0.12, pos: new THREE.Vector3(6.04, 1.41, 3.75), look: new THREE.Vector3(4.4, 0.65, -3.8) },
      { t: 0.24, pos: new THREE.Vector3(6.07, 1.39, 2.45), look: new THREE.Vector3(3.6, 0.4, -5.8) },
      { t: 0.36, pos: new THREE.Vector3(6.12, 1.34, 1.05), look: new THREE.Vector3(2.6, 0.15, -7.2) },
      { t: 0.46, pos: new THREE.Vector3(6.1, 1.24, -0.05), look: new THREE.Vector3(1.4, -0.02, -8.6) },
      { t: 0.56, pos: new THREE.Vector3(5.55, 1.14, -0.45), look: new THREE.Vector3(0.2, -0.12, -9.6) },
      { t: 0.66, pos: new THREE.Vector3(4.35, 1.08, -0.85), look: new THREE.Vector3(-0.3, -0.2, -10.8) },
      { t: 0.74, pos: new THREE.Vector3(3.1, 1.06, -1.6), look: lakeFocusNear.clone() },
      { t: 0.82, pos: new THREE.Vector3(1.6, 1.45, -3.2), look: lakeFocusNear.clone() },
      { t: 0.9, pos: new THREE.Vector3(0.2, 2.8, -6.2), look: lakeFocusMid.clone() },
      { t: 0.96, pos: new THREE.Vector3(-0.35, 4.8, -9.5), look: lakeFocusFar.clone() },
      { t: 1.0, pos: new THREE.Vector3(-0.5, 6.4, -12.5), look: lakeFocusFar.clone() },
    ];

    // ─── Environment State ───────────────────────────────────────────────
    const currentEnv: EnvConfig = {
      skyTop: new THREE.Color(),
      skyBottom: new THREE.Color(),
      ambient: new THREE.Color(),
      ambientIntensity: 0.5,
      sun: new THREE.Color(),
      sunIntensity: 1.0,
      sunPos: new THREE.Vector3(),
      fogColor: new THREE.Color(),
      fogDensity: 0.015,
      water: new THREE.Color(),
      waterSpecular: new THREE.Color(),
      waveSpeed: 0.2,
      waveAmplitude: 0.045,
      lanternIntensity: 0.0,
    };

    // ─── Mouse Parallax ──────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ─── Animation Loop ──────────────────────────────────────────────────
    const clock = new THREE.Clock();
    const tempViewPos = new THREE.Vector3();
    const tempWorldPos = new THREE.Vector3();
    const boostedWater = new THREE.Color();
    const camPos = new THREE.Vector3();
    const camLookAt = new THREE.Vector3();
    const smoothedCamPos = new THREE.Vector3(6.02, 1.42, 4.9);
    const smoothedLookAt = new THREE.Vector3(4.8, 0.9, -2.0);

    const animate = () => {
      if (!prefersReduced) rafId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const scroll = scrollRef.current;
      const timeVal = timeRef.current;

      // 1. Interpolate environment
      interpolateEnv(timeVal, currentEnv);

      // 2. Apply lighting
      ambientLight.color.copy(currentEnv.ambient);
      ambientLight.intensity = currentEnv.ambientIntensity * 1.2;

      sunLight.color.copy(currentEnv.sun);
      sunLight.intensity = currentEnv.sunIntensity;
      sunLight.position.copy(currentEnv.sunPos);

      fog.color.copy(currentEnv.fogColor);
      fog.density = currentEnv.fogDensity * 0.25 * (1.0 - scroll * 0.4);
      hemiLight.intensity = 0.45 + currentEnv.ambientIntensity * 0.35;
      hemiLight.color.set(0x9ee8ec);
      hemiLight.groundColor.copy(currentEnv.water).multiplyScalar(0.85);

      // Adjust fill light based on time
      fillLight.intensity = currentEnv.ambientIntensity * 0.15;

      // 2b. Update villa window emissive glow based on night
      if (windowMat) {
        const nightVal = computeNightSmooth(timeVal);
        windowMat.emissive.setHex(0xffaa44);
        windowMat.emissiveIntensity = nightVal * 0.6;
      }

      if (interiorLight) {
        const nightVal = computeNightSmooth(timeVal);
        interiorLight.intensity = 0.25 + nightVal * 1.55;
      }

      // 3. Update sky dome
      skyMat.uniforms.uColorTop.value.copy(currentEnv.skyTop);
      skyMat.uniforms.uColorBottom.value.copy(currentEnv.skyBottom);
      skyMat.uniforms.uSunDirection.value.copy(currentEnv.sunPos).normalize();
      skyMat.uniforms.uSunColor.value.copy(currentEnv.sun).multiplyScalar(currentEnv.sunIntensity);
      skyMat.uniforms.uTime.value = elapsed;
      skyMat.uniforms.uGoldenHourBoost.value = computeGoldenHourBoost(timeVal);
      skyMat.uniforms.uIsNight.value = computeIsNight(timeVal);
      skyMat.uniforms.uSunSize.value = computeIsNight(timeVal) > 0.5 ? 0.028 : 0.035;
      skyMat.uniforms.uWindX.value = computeWindX(timeVal);
      skyMesh.position.copy(camera.position);

      // 4. Update celestial bodies (sun/moon)
      const nightSmooth = computeNightSmooth(timeVal);
      const sunDir = currentEnv.sunPos.clone().normalize();

      // Sun — visible during day
      sunOrb.position.copy(sunDir).multiplyScalar(42);
      sunOrb.visible = nightSmooth < 0.7;
      sunOrbMat.color.lerpColors(
        new THREE.Color(0xfff5d0),
        new THREE.Color(0xe8904e),
        computeGoldenHourBoost(timeVal)
      );
      const sunGlowMat = sunGlowSprite.material as THREE.SpriteMaterial;
      sunGlowMat.opacity = (1.0 - nightSmooth) * 0.8;
      sunGlowSprite.scale.setScalar(8 + computeGoldenHourBoost(timeVal) * 6);

      // Moon — opposite hemisphere from sun
      const moonDir = sunDir.clone().negate();
      moonDir.y = Math.abs(moonDir.y) * 0.85 + 0.12;
      moonDir.normalize();
      moonOrb.position.copy(moonDir).multiplyScalar(40);
      moonOrb.visible = nightSmooth > 0.3;
      const moonGlowMat = moonGlowSprite.material as THREE.SpriteMaterial;
      moonGlowMat.opacity = nightSmooth * 0.6;

      // 5. Drift clouds
      const windX = computeWindX(timeVal);
      cloudsData.forEach((cd) => {
        cd.group.position.x = cd.baseX + elapsed * cd.speed * windX * 20;
        // Wrap clouds
        if (cd.group.position.x > 30) cd.group.position.x = -30;
        if (cd.group.position.x < -30) cd.group.position.x = 30;
      });

      // Cloud color/opacity based on time
      const cloudDayColor = new THREE.Color(0xffffff);
      const cloudNightColor = new THREE.Color(0x1a2030);
      const cloudSunsetColor = new THREE.Color().copy(currentEnv.sun).multiplyScalar(0.8);
      const ghBoost = computeGoldenHourBoost(timeVal);

      if (nightSmooth > 0.5) {
        cloudMat.color.copy(cloudNightColor);
        cloudMat.opacity = 0.15;
      } else if (ghBoost > 0.3) {
        cloudMat.color.lerpColors(cloudDayColor, cloudSunsetColor, ghBoost);
        cloudMat.opacity = 0.7;
      } else {
        cloudMat.color.copy(cloudDayColor);
        cloudMat.opacity = 0.55;
      }

      // 6. Villa lantern (view-space position for water reflection)
      tempViewPos.copy(bulbSphere.position);
      tempViewPos.applyMatrix4(villaGroup.matrixWorld);
      tempViewPos.applyMatrix4(camera.matrixWorldInverse);

      tempWorldPos.copy(bulbSphere.position);
      tempWorldPos.applyMatrix4(villaGroup.matrixWorld);
      waterUniforms.uLanternPlanePos.value.set(tempWorldPos.x, -tempWorldPos.z);

      // 7. Update water uniforms
      waterUniforms.uTime.value = elapsed;
      waterUniforms.uWaveSpeed.value = currentEnv.waveSpeed;
      waterUniforms.uWaveAmplitude.value = currentEnv.waveAmplitude * 0.85;
      const isNight = computeIsNight(timeVal) > 0.5;
      boostedWater.copy(currentEnv.water).multiplyScalar(isNight ? 1.2 : 1.35);
      waterUniforms.uWaterColor.value.copy(boostedWater);
      waterUniforms.uWaterSpecularColor.value.copy(currentEnv.waterSpecular);
      waterUniforms.uSkyTop.value.copy(currentEnv.skyTop);
      waterUniforms.uSkyBottom.value.copy(currentEnv.skyBottom);
      waterUniforms.uSunDirection.value.copy(currentEnv.sunPos).normalize();
      waterUniforms.uSunIntensity.value = currentEnv.sunIntensity;
      waterUniforms.uScrollProgress.value = scroll;

      waterUniforms.uLanternViewPosition.value.copy(tempViewPos);
      waterUniforms.uLanternIntensity.value = currentEnv.lanternIntensity;

      // Villa lantern light intensity
      warmLight.intensity = currentEnv.lanternIntensity * 2.2;

      // 8. Sway palms
      palmsData.forEach((palm) => {
        palm.group.rotation.z = palm.baseRotationZ + Math.sin(elapsed * 0.75 + palm.index) * 0.025;
        palm.group.rotation.x = Math.cos(elapsed * 0.6 + palm.index) * 0.012;
      });

      // 9. Animate birds
      const birdVis = computeBirdVisibility(timeVal);
      birdsData.forEach((bird, idx) => {
        const flap = Math.sin(elapsed * bird.speed + bird.phase) * 0.65;
        bird.wingL.rotation.y = flap;
        bird.wingR.rotation.y = -flap;

        const angle = elapsed * 0.06 + idx * 1.8;
        bird.group.position.x = bird.baseX + Math.sin(angle) * bird.radius * 0.35;
        bird.group.position.z = -7 + Math.cos(angle) * 2.0;
        bird.group.position.y = bird.baseY + Math.sin(elapsed * 0.3 + idx) * 0.3;
        bird.group.visible = birdVis > 0.15;
        // Face flight direction
        bird.group.rotation.y = Math.atan2(
          Math.cos(angle) * bird.radius * 0.35,
          -Math.sin(angle) * 2.0
        );
        birdBodyMat.opacity = 0.75 + birdVis * 0.25;
        birdWingMat.opacity = 0.7 + birdVis * 0.3;
      });

      // 10. Bob lily pads
      padData.forEach((pad) => {
        const height = getWaveHeightAt(
          pad.x,
          pad.z,
          elapsed,
          currentEnv.waveSpeed,
          currentEnv.waveAmplitude
        );
        const waterY = WATER_Y + height + 0.005;
        pad.mesh.position.set(pad.x, waterY, pad.z);
        pad.mesh.rotation.z = Math.sin(elapsed * currentEnv.waveSpeed + pad.phase) * 0.04;
        pad.mesh.rotation.x = Math.cos(elapsed * currentEnv.waveSpeed + pad.phase) * 0.02;
        if (pad.lotus) {
          pad.lotus.position.set(pad.x, waterY + 0.01, pad.z);
          pad.lotus.rotation.y = pad.mesh.rotation.y;
        }
      });

      // 11. Sway reeds
      reedsData.forEach((reed) => {
        reed.mesh.rotation.z = reed.baseRotZ + Math.sin(elapsed * 1.1 + reed.phase) * 0.1;
      });

      // 12. Swim fish
      fishData.forEach((fish) => {
        const swim = elapsed * fish.speed + fish.phase;
        fish.mesh.position.x = fish.x + Math.sin(swim) * fish.radius + windX * elapsed * 0.01;
        fish.mesh.position.z = fish.z + Math.cos(swim * 0.8) * fish.radius * 0.6;
        fish.mesh.position.y =
          WATER_Y +
          getWaveHeightAt(fish.mesh.position.x, fish.mesh.position.z, elapsed, currentEnv.waveSpeed, currentEnv.waveAmplitude) -
          0.06;
        fish.mesh.rotation.y = Math.atan2(
          Math.cos(swim * 0.8) * fish.radius * 0.6,
          Math.cos(swim) * fish.radius
        );
        fish.mesh.visible = !isNight || currentEnv.lanternIntensity > 0.5;
      });

      // 13. Drift mist
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];
        positions[i * 3] += data.speedX;
        positions[i * 3 + 2] += data.speedZ;
        if (Math.abs(positions[i * 3] - data.originX) > data.limitX) {
          positions[i * 3] = data.originX;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleMat.color.copy(currentEnv.fogColor);
      particleMat.opacity = 0.1 * (1.0 - scroll);

      // 14. Fireflies
      const ffPositions = fireflyGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < fireflyCount; i++) {
        const data = fireflyData[i];
        ffPositions[i * 3 + 1] = data.y + Math.sin(elapsed * data.speed + data.phase) * 0.18;
        ffPositions[i * 3] += Math.sin(elapsed * 0.3 + i) * 0.0025;
        ffPositions[i * 3 + 2] += Math.cos(elapsed * 0.2 + i) * 0.002;
      }
      fireflyGeo.attributes.position.needsUpdate = true;
      const nightFactor = computeIsNight(timeVal);
      fireflyMat.opacity =
        (currentEnv.lanternIntensity * 0.35 + nightFactor * 0.45) * (1.0 - scroll);

      // Foreground leaf parallax depth on scroll
      fgLeafMat.opacity = Math.max(0, 0.25 - scroll * 0.3);

      // 15. Camera — scroll-keyframed path (height rises only after road segment)
      const scrollT = Math.max(0, Math.min(1, scroll));
      sampleCameraKeyframes(scrollT, cameraKeyframes, camPos, camLookAt);

      // Add subtle mouse parallax offset
      camPos.x += mouse.x * 0.25 * (1.0 - scrollT * 0.5);
      camPos.y -= mouse.y * 0.1 * (1.0 - scrollT * 0.5);

      // Add gentle breathing motion
      camPos.x += Math.sin(elapsed * 0.3) * 0.04;
      camPos.y += Math.cos(elapsed * 0.25) * 0.02;

      // Smooth camera interpolation
      smoothedCamPos.lerp(camPos, 0.06);
      smoothedLookAt.lerp(camLookAt, 0.06);

      camera.position.copy(smoothedCamPos);
      camera.lookAt(smoothedLookAt);

      // 16. Render
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(scene, camera);
    };

    animate();

    // ─── Cleanup ─────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);

      camera.remove(fgLeafMesh);

      // Geometries
      waterGeo.dispose();
      skyGeo.dispose();
      villaGroundGeo.dispose();
      roadGeo.dispose();
      grassStripGeo.dispose();
      lakeFieldGeo.dispose();
      curbGeo.dispose();
      gfFloorGeo.dispose();
      gfBackGeo.dispose();
      gfLeftGeo.dispose();
      gfRightGeo.dispose();
      ufFloorGeo.dispose();
      ufBackGeo.dispose();
      ufLeftGeo.dispose();
      ufRightGeo.dispose();
      glassFacadeGeo.dispose();
      mullionGeo.dispose();
      villaRoofGeo.dispose();
      balconyGeo.dispose();
      railGeo.dispose();
      postGeo.dispose();
      windowGeo.dispose();
      winFrameGeo.dispose();
      doorGeo.dispose();
      pillarGeo.dispose();
      porchRoofGeo.dispose();
      chimneyGeo.dispose();
      bulbGeo.dispose();
      foregroundLeafGeo.dispose();
      pathGeo.dispose();
      farTerrainGeo.dispose();
      mountainGeo1.dispose();
      mountainGeo2.dispose();
      mountainGeo3.dispose();
      forestTrunkGeo.dispose();
      forestCrownGeo1.dispose();
      forestCrownGeo2.dispose();
      forestCrownGeo3.dispose();
      bushGeo.dispose();
      wingGeo.dispose();
      birdBodyGeo.dispose();
      headGeo.dispose();
      beakGeo.dispose();
      reedGeo.dispose();
      rockGeo.dispose();
      leafGeo.dispose();
      trunkGeo.dispose();
      padGeometry.dispose();
      lotusLeafGeo.dispose();
      lotusGeo.dispose();
      lotusCenterGeo.dispose();
      fishGeo.dispose();
      grassBladeGeo.dispose();
      particleGeo.dispose();
      fireflyGeo.dispose();
      sunOrbGeo.dispose();
      moonOrbGeo.dispose();
      cloudGeometries.forEach((g) => g.dispose());

      // Interior geometries
      sofaBase.geometry.dispose();
      sofaBack.geometry.dispose();
      sofaArmL.geometry.dispose();
      sofaArmR.geometry.dispose();
      tableTop.geometry.dispose();
      legGeo.dispose();
      cordGeo.dispose();
      bulbGeoInt.dispose();
      potGeo.dispose();
      plantStemGeo.dispose();

      // Materials
      waterMat.dispose();
      skyMat.dispose();
      woodPlankMat.dispose();
      concreteMat.dispose();
      villaGroundMat.dispose();
      roadMat.dispose();
      grassStripMat.dispose();
      lakeFieldMat.dispose();
      curbMat.dispose();
      wallMat.dispose();
      roofMat.dispose();
      windowMat.dispose();
      windowFrameMat.dispose();
      doorMat.dispose();
      pillarMat.dispose();
      railMat.dispose();
      leafMaterial.dispose();
      fgLeafMat.dispose();
      bulbMat.dispose();
      pathMat.dispose();
      farTerrainMat.dispose();
      mtnMat.dispose();
      mtnMat2.dispose();
      forestTrunkMat.dispose();
      forestCrownMats.forEach((m) => m.dispose());
      bushMat.dispose();
      birdBodyMat.dispose();
      birdWingMat.dispose();
      beakMat.dispose();
      balconyMat.dispose();
      porchRoofMat.dispose();
      shoreWedgeGeo.dispose();
      shoreWedgeMat.dispose();
      rugMat.dispose();
      sconceMat.dispose();
      trunkMaterial.dispose();
      reedMat.dispose();
      rockMat.dispose();
      padMaterial.dispose();
      lotusLeafMat.dispose();
      lotusMat.dispose();
      lotusCenterMat.dispose();
      fishMat.dispose();
      grassBladeMat.dispose();
      particleMat.dispose();
      fireflyMat.dispose();
      sunOrbMat.dispose();
      moonOrbMat.dispose();
      cloudMat.dispose();

      // Interior materials
      fabricMat.dispose();
      woodTrimMat.dispose();
      glassTableMat.dispose();
      cordMat.dispose();
      bulbMatInt.dispose();
      glassFacadeMat.dispose();

      (sunGlowSprite.material as THREE.SpriteMaterial).dispose();
      (moonGlowSprite.material as THREE.SpriteMaterial).dispose();
      chimney.material.dispose();

      // Textures
      woodTexture.dispose();
      concreteTexture.dispose();
      leafTexture.dispose();
      roadTexture.dispose();
      barkTexture.dispose();
      sunGlowTex.dispose();
      moonGlowTex.dispose();
      mistTexture.dispose();
      fireflyTexture.dispose();

      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ display: "block" }}
    />
  );
}
