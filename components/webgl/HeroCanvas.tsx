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
  lanternIntensity: number; // warm light strength
}

const ENV_PRESETS = [
  {
    time: 0, // Midnight
    skyTop: "#010508",
    skyBottom: "#030c10",
    ambient: "#010405",
    ambientIntensity: 0.12,
    sun: "#769bb0", // Moon
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
    time: 5.5, // Dawn — sun rises behind right of villa
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
    waveSpeed: 0.20,
    waveAmplitude: 0.04,
    lanternIntensity: 0.8,
  },
  {
    time: 10, // Morning
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
    time: 14.5, // Afternoon
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
    time: 18.5, // Sunset
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
    time: 21, // Night
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
    time: 24, // Midnight Wrap
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

/** Coastal breeze: day = sea→villa (+X), night = land→coast (−X). */
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
  sunPos: new THREE.Vector3(...p.sunPos),
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

/** Tangalle golden-hour intensity for horizon glow and god rays (dawn ~6h, dusk ~19h). */
function computeGoldenHourBoost(time: number): number {
  const dawn = Math.max(0, 1 - Math.abs(time - 6.25) / 1.5);
  const dusk = Math.max(0, 1 - Math.abs(time - 18.75) / 1.5);
  return Math.min(1, Math.max(dawn, dusk));
}

function computeIsNight(time: number): number {
  return time >= 20 || time < 5.5 ? 1 : 0;
}

/** Egrets/herons are most visible at lagoon dawn and dusk. */
function computeBirdVisibility(time: number): number {
  const dawnPeak = Math.max(0, 1 - Math.abs(time - 6.5) / 2);
  const duskPeak = Math.max(0, 1 - Math.abs(time - 18) / 2);
  const midday = time >= 9 && time <= 16 ? 0.3 : 0.65;
  return Math.max(midday, Math.max(dawnPeak, duskPeak));
}

// Far shore of lake (toward mountains) in water-plane local Y
const SHORE_PLANE_Y = 10.5;
const LAKE_CENTER = new THREE.Vector2(0.5, 1.5);
const LAKE_RADIUS = 9.5;

// ─── Shaders (FBM Sky Clouds + Wave Proximity Foam + Gerstner Waves) ───────────

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

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
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

    // Sun / moon disk with warm corona (Tangalle golden hour)
    float diskSize = mix(uSunSize, uSunSize * 0.5, uIsNight);
    float sunCore = smoothstep(1.0 - diskSize * 0.75, 1.0 - diskSize * 0.15, sunDot);
    float sunCorona = smoothstep(1.0 - diskSize * 2.8, 1.0 - diskSize * 0.55, sunDot);
    vec3 sunDisk = uSunColor * (sunCore * 4.2 + sunCorona * 1.4 * (1.0 - uIsNight * 0.55));

    // Volumetric horizon glow — strongest at sunrise / sunset
    float horizon = exp(-abs(direction.y) * 6.5);
    vec3 scatter = uSunColor * horizon * uGoldenHourBoost * 0.9;
    skyColor += scatter;

    // Crepuscular god rays from the sun direction
    float rayAngle = atan(direction.x, direction.z);
    float rayNoise = fbm(vec2(rayAngle * 4.0 + uTime * 0.018, direction.y * 3.5 + uTime * 0.01));
    float rayMask = smoothstep(0.91, 1.0, sunDot) * (1.0 - uIsNight) * uGoldenHourBoost;
    skyColor += uSunColor * rayNoise * rayMask * horizon * 0.42;

    // Three-layer tropical sky clouds (cirrus, cumulus, low haze)
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

      cloudMix = cirrus * 0.12 + cumulus * 0.24 + lowHaze * 0.16;
    }

    vec3 cloudTint = mix(
      vec3(0.9, 0.95, 1.0) * (uSunColor * 0.5 + 0.5),
      vec3(0.06, 0.12, 0.18),
      uIsNight * 0.75
    );
    vec3 finalColor = mix(skyColor + sunDisk, cloudTint, cloudMix * 0.85);
    float skyLuma = dot(finalColor, vec3(0.299, 0.587, 0.114));
    finalColor = mix(vec3(skyLuma), finalColor, 1.18);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const WATER_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uWaveSpeed;
  uniform float uWaveAmplitude;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPos;
  varying float vHeight;

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

    Wave waves[4];
    waves[0] = Wave(normalize(vec2(1.0, 0.4)), uWaveAmplitude * 0.7, 0.35, 0.6, uWaveSpeed * 0.8);
    waves[1] = Wave(normalize(vec2(-0.8, 0.8)), uWaveAmplitude * 0.35, 0.65, 0.45, uWaveSpeed * 1.3);
    waves[2] = Wave(normalize(vec2(0.3, -0.9)), uWaveAmplitude * 0.18, 1.20, 0.3, uWaveSpeed * 2.1);
    waves[3] = Wave(normalize(vec2(0.6, 0.2)), uWaveAmplitude * 0.12, 2.10, 0.22, uWaveSpeed * 2.8);

    vec3 displaced = pos;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 1.0, 0.0);

    for(int i = 0; i < 4; i++) {
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
  uniform float uShoreLine;
  uniform vec2 uLakeCenter;
  uniform float uLakeRadius;

  uniform vec3 uLanternViewPosition;
  uniform vec2 uLanternPlanePos;
  uniform vec3 uLanternColor;
  uniform float uLanternIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPos;
  varying float vHeight;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float causticNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float caustics(vec2 uv, float t) {
    float c = 0.0;
    c += causticNoise(uv * 3.5 + vec2(t * 0.4, t * 0.25));
    c += causticNoise(uv * 7.0 - vec2(t * 0.55, t * 0.35)) * 0.5;
    c += causticNoise(uv * 14.0 + vec2(t * 0.3, -t * 0.2)) * 0.25;
    return pow(c * 0.55, 1.4);
  }

  vec3 saturateColor(vec3 c, float amount) {
    float luma = dot(c, vec3(0.299, 0.587, 0.114));
    return mix(vec3(luma), c, amount);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float viewDepth = length(vViewPosition);

    // Depth readout — near water is clearer, far shore richer
    float depthFade = smoothstep(4.0, 28.0, viewDepth);
    float heightFactor = clamp((vHeight + 0.12) * 3.5, 0.0, 1.0);

    vec3 lagoonDeep = uWaterColor * 1.25;
    vec3 lagoonMid = uWaterColor * 1.75 + vec3(0.04, 0.14, 0.12);
    vec3 lagoonBright = uWaterColor * 2.1 + vec3(0.08, 0.18, 0.14);
    vec3 col = mix(mix(lagoonDeep, lagoonMid, heightFactor), lagoonBright, heightFactor * 0.45);
    col = mix(col, lagoonDeep * 0.95, depthFade * 0.25);

    // Sky reflection — mirror lagoon clarity
    vec3 reflectDir = reflect(-viewDir, normal);
    float skyBlend = reflectDir.y * 0.5 + 0.5;
    vec3 skyReflect = mix(uSkyBottom, uSkyTop, clamp(skyBlend, 0.0, 1.0));
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
    col = mix(col, skyReflect * 1.15, fresnel * 0.62);

    // Sun specular + glitter path across ripples
    vec3 halfDir = normalize(uSunDirection + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 28.0);
    col += uWaterSpecularColor * spec * uSunIntensity * 1.45;

    float glintSpec = pow(max(dot(normal, halfDir), 0.0), 180.0);
    col += vec3(1.0, 0.98, 0.9) * glintSpec * uSunIntensity * 2.2;

    // Anisotropic sun streak on wave crests
    vec2 sunXZ = normalize(uSunDirection.xz + vec2(0.001));
    float streak = pow(max(dot(normalize(vWorldPos.xy) * 0.08, sunXZ), 0.0), 6.0);
    col += uWaterSpecularColor * streak * uSunIntensity * 0.18;

    // Shallow caustic light patterns (visible lagoon floor detail)
    float distToShore = abs(vWorldPos.y - uShoreLine);
    float shallowMask = smoothstep(5.0, 0.3, distToShore);
    float caustic = caustics(vWorldPos.xy * 0.55, uTime) * shallowMask;
    col += vec3(0.55, 0.85, 0.75) * caustic * uSunIntensity * 0.42;

    // Lagoon floor sediment — visible clarity in shallows
    float floorVar = causticNoise(vWorldPos.xy * 0.22 + vec2(3.7, 1.2));
    col = mix(col, col * 0.82 + vec3(0.14, 0.24, 0.16), floorVar * shallowMask * 0.4);

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
    col += uLanternColor * causticDisc * uLanternIntensity * 0.25;

    // Tangalle shoreline color bands — sand → emerald shallows → teal depth
    vec3 sandShallow = vec3(0.94, 0.88, 0.72);
    vec3 emeraldShallow = vec3(0.35, 0.78, 0.62);
    vec3 tealMid = vec3(0.18, 0.62, 0.58);
    float sandZone = smoothstep(1.4, 0.1, distToShore);
    float shallowZone = smoothstep(4.0, 0.4, distToShore);
    float midZone = smoothstep(7.0, 2.0, distToShore);
    col = mix(col, sandShallow, sandZone * 0.5);
    col = mix(col, emeraldShallow, shallowZone * 0.65);
    col = mix(col, tealMid, midZone * 0.35);

    float wavePhase = uTime * 2.8 + vWorldPos.x * 2.0 + distToShore * 1.5;
    float shoreFoam = smoothstep(0.8, 0.0, distToShore) * (0.5 + 0.5 * sin(wavePhase));

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

    // Fine ripple detail on surface
    float ripple = sin(vWorldPos.x * 4.5 + uTime * 1.6) * sin(vWorldPos.y * 3.8 - uTime * 1.2);
    col += uWaterColor * ripple * 0.04;

    col = saturateColor(col, 1.55);

    // Lake perimeter — depth fades softly at edges and field junction (left)
    float distLake = length(vWorldPos.xy - uLakeCenter);
    float perimeterFade = smoothstep(uLakeRadius, uLakeRadius - 3.0, distLake);
    float fieldJunction = smoothstep(-7.5, -4.0, vWorldPos.x);
    float lakeMask = perimeterFade * fieldJunction;
    col = mix(col * 0.35, col, lakeMask);
    col = mix(col, uWaterColor * 0.5, (1.0 - perimeterFade) * 0.4);

    float alpha = 0.98 * lakeMask * (1.0 - uScrollProgress * 0.68);

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

  ctx.strokeStyle = "#2a1f16";
  ctx.lineWidth = 3;
  const plankWidth = 64;
  for (let x = 0; x < 512; x += plankWidth) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
    ctx.lineWidth = 1.2;
    for (let j = 0; j < 6; j++) {
      const gx = x + 5 + Math.random() * (plankWidth - 10);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.quadraticCurveTo(gx + (Math.random() - 0.5) * 20, 256, gx, 512);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
    if (Math.random() > 0.5) {
      ctx.fillRect(x, 0, plankWidth, 512);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

const createConcreteTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#5a6e72";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 1.5;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(x, y, size, size);
  }

  ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 128); ctx.lineTo(256, 128);
  ctx.moveTo(128, 0); ctx.lineTo(128, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
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

// ─── Component Props ─────────────────────────────────────────────────────────

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

    // ─── Renderer Setup ──────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.75);
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

    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 100);
    camera.position.set(2.5, 0.65, 7.5);
    scene.add(camera);

    // ─── Lighting Setup ──────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x9ee8ec, 0x3d8a7a, 0.55);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.castShadow = false;
    scene.add(sunLight);

    // ─── Sky Dome Background ──────────────────────────────────────────────
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

    // ─── Procedural Textures & Materials ──────────────────────────────────
    const woodTexture = createWoodTexture();
    const woodPlankMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.1,
    });

    const concreteTexture = createConcreteTexture();
    const concreteMat = new THREE.MeshStandardMaterial({
      map: concreteTexture,
      roughness: 0.72,
      metalness: 0.12,
    });

    const leafTexture = createPalmLeafTexture();
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


    const slimPillarMat = new THREE.MeshStandardMaterial({
      color: 0x030709,
      roughness: 0.2,
      metalness: 0.92,
    });

    const luxuryGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x7ba38c,
      transparent: true,
      opacity: 0.18,
      roughness: 0.05,
      metalness: 0.95,
      transmission: 0.75,
      thickness: 0.25,
    });

    // ─── Water Geometry & Material ───────────────────────────────────────
    const SEG = window.innerWidth < 768 ? 96 : 160;
    const waterGeo = new THREE.PlaneGeometry(18, 22, SEG, SEG);

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
      uShoreLine: { value: SHORE_PLANE_Y },
      uLakeCenter: { value: LAKE_CENTER.clone() },
      uLakeRadius: { value: LAKE_RADIUS },
      uLanternViewPosition: { value: new THREE.Vector3(0, 0, 0) },
      uLanternPlanePos: { value: new THREE.Vector2(0, 0) },
      uLanternColor: { value: new THREE.Color(0xffb04d) },
      uLanternIntensity: { value: 0.0 },
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
    waterMesh.position.set(0.5, -1.2, -2.5);
    scene.add(waterMesh);

    const fieldMat = new THREE.MeshStandardMaterial({
      color: 0x6a9e5a,
      roughness: 0.92,
    });
    const fieldGeo = new THREE.PlaneGeometry(12, 22);
    const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
    fieldMesh.rotation.x = -Math.PI / 2;
    fieldMesh.position.set(-7.5, -1.19, -2.5);
    scene.add(fieldMesh);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x6a6560, roughness: 0.96 });
    const roadGeo = new THREE.PlaneGeometry(2.2, 20);
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(5.2, -1.185, -2.5);
    scene.add(roadMesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc9a55a,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const wireMesh = new THREE.Mesh(waterGeo, wireMat);
    wireMesh.rotation.x = -Math.PI / 2;
    wireMesh.position.copy(waterMesh.position);
    wireMesh.position.y = -1.198;
    scene.add(wireMesh);

    // ─── Two-storey Lake View Villa (guest floor faces the lake) ───────────
    const villaGroup = new THREE.Group();
    villaGroup.position.set(7.8, 0, 0.5);
    scene.add(villaGroup);

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf2ebe0,
      roughness: 0.82,
    });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a5c62, roughness: 0.75 });
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: 0xa8dce8,
      transparent: true,
      opacity: 0.55,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.65,
    });

    const groundFloorGeo = new THREE.BoxGeometry(3.4, 1.5, 4.6);
    const groundFloor = new THREE.Mesh(groundFloorGeo, wallMat);
    groundFloor.position.set(0, -0.45, 0);
    villaGroup.add(groundFloor);

    const guestFloorGeo = new THREE.BoxGeometry(3.6, 1.6, 4.8);
    const guestFloor = new THREE.Mesh(guestFloorGeo, wallMat);
    guestFloor.position.set(0, 0.85, 0);
    villaGroup.add(guestFloor);

    const villaRoofGeo = new THREE.BoxGeometry(3.9, 0.18, 5.1);
    const villaRoof = new THREE.Mesh(villaRoofGeo, roofMat);
    villaRoof.position.set(0, 1.72, 0);
    villaGroup.add(villaRoof);

    const balconyGeo = new THREE.BoxGeometry(3.7, 0.08, 0.9);
    const balcony = new THREE.Mesh(balconyGeo, concreteMat);
    balcony.position.set(0, 0.15, -2.65);
    villaGroup.add(balcony);

    const windowGeo = new THREE.PlaneGeometry(0.75, 0.6);
    for (let w = 0; w < 3; w++) {
      const win = new THREE.Mesh(windowGeo, windowMat);
      win.position.set(-0.85 + w * 0.85, 0.95, -2.42);
      villaGroup.add(win);
    }

    const bulbGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd090 });
    const bulbSphere = new THREE.Mesh(bulbGeo, bulbMat);
    bulbSphere.position.set(0, 0.95, -2.3);
    villaGroup.add(bulbSphere);

    const warmLight = new THREE.PointLight(0xffa04d, 0, 14);
    warmLight.position.set(0, 0.9, -2.2);
    villaGroup.add(warmLight);

    const coneGeo = new THREE.CylinderGeometry(0.03, 0.8, 1.6, 12, 1, true);
    coneGeo.translate(0, -0.8, 0);
    const coneUniforms = {
      uColor: { value: new THREE.Color(0xffa04d) },
      uIntensity: { value: 0.0 },
    };
    const coneMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 uColor;
        uniform float uIntensity;
        void main() {
          float verticalFade = pow(1.0 - vUv.y, 2.0);
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float edgeFade = pow(1.0 - abs(dot(normal, viewDir)), 2.0);
          float alpha = verticalFade * edgeFade * uIntensity * 0.3;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      uniforms: coneUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    lightCone.position.set(0, 0.95, -2.2);
    lightCone.rotation.x = Math.PI;
    villaGroup.add(lightCone);

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

    // ─── Shoreline & Landscape Elements ───────────────────────────────────
    const landscapeGroup = new THREE.Group();
    scene.add(landscapeGroup);

    const shorelineGeo = new THREE.BoxGeometry(28, 0.35, 2.5);
    const shorelineSandMat = new THREE.MeshStandardMaterial({
      color: 0x9aae88,
      roughness: 0.88,
    });
    const shorelineMesh = new THREE.Mesh(shorelineGeo, shorelineSandMat);
    shorelineMesh.position.set(-1, -1.2, -12);
    landscapeGroup.add(shorelineMesh);

    const mtnMat = new THREE.MeshStandardMaterial({ color: 0x4a6a62, roughness: 0.95 });
    const mountainGeo1 = new THREE.ConeGeometry(5.5, 4.2, 8);
    const mountain1 = new THREE.Mesh(mountainGeo1, mtnMat);
    mountain1.position.set(-5, 0.6, -14.5);
    landscapeGroup.add(mountain1);

    const mountainGeo2 = new THREE.ConeGeometry(4.2, 3.4, 8);
    const mountain2 = new THREE.Mesh(mountainGeo2, mtnMat);
    mountain2.position.set(4.5, 0.3, -15);
    landscapeGroup.add(mountain2);

    const forestTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d4a32, roughness: 0.9 });
    const forestCrownMat = new THREE.MeshStandardMaterial({ color: 0x2d6a48, roughness: 0.85 });
    const forestTrunkGeo = new THREE.CylinderGeometry(0.06, 0.1, 1.2, 6);
    const forestCrownGeo = new THREE.ConeGeometry(0.55, 1.4, 7);
    for (let f = 0; f < 45; f++) {
      const tree = new THREE.Group();
      const tx = -14 + Math.random() * 28;
      const tz = -15.5 - Math.random() * 4;
      tree.position.set(tx, -0.5, tz);
      const trunk = new THREE.Mesh(forestTrunkGeo, forestTrunkMat);
      trunk.position.y = 0.6;
      tree.add(trunk);
      const crown = new THREE.Mesh(forestCrownGeo, forestCrownMat);
      crown.position.y = 1.5;
      tree.add(crown);
      landscapeGroup.add(tree);
    }

    const reedMat = new THREE.MeshStandardMaterial({
      color: 0x5cb87a,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });
    const reedGeo = new THREE.PlaneGeometry(0.05, 0.75);
    const reedsData: Array<{ mesh: THREE.Mesh; baseRotZ: number; phase: number }> = [];
    for (let r = 0; r < 24; r++) {
      const reed = new THREE.Mesh(reedGeo, reedMat);
      const rx = -4 + r * 0.55 + (Math.random() - 0.5) * 0.3;
      const baseRotZ = (Math.random() - 0.5) * 0.12;
      reed.position.set(rx, -0.85 + Math.random() * 0.12, -10.5 - Math.random() * 1.5);
      reed.rotation.y = (Math.random() - 0.5) * 0.4;
      reed.rotation.z = baseRotZ;
      landscapeGroup.add(reed);
      reedsData.push({ mesh: reed, baseRotZ, phase: Math.random() * Math.PI * 2 });
    }

    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x5a7a72,
      roughness: 0.82,
    });
    const rocks: THREE.Mesh[] = [];

    const rockPositions = [
      [-3.5, -1.1, -11.0, 0.7, 1.0, 0.8],
      [2.0, -1.1, -11.5, 0.5, 0.7, 0.6],
      [5.0, -1.1, -10.5, 0.6, 0.8, 0.7],
      [-1.0, -1.15, -12.0, 0.9, 0.6, 0.9],
    ];

    rockPositions.forEach(([rx, ry, rz, sx, sy, sz]) => {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(rx, ry, rz);
      rock.scale.set(sx, sy, sz);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      landscapeGroup.add(rock);
      rocks.push(rock);
    });

    // ─── Shoreline Silhouette Palms ──────────────────────────────────────
    const palmsGroup = new THREE.Group();
    scene.add(palmsGroup);

    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d5c48,
      roughness: 0.88,
    });

    const birdSilhouetteMat = new THREE.MeshStandardMaterial({
      color: 0x051319,
      roughness: 0.92,
      transparent: true,
      opacity: 1,
    });

    const palmsCount = 6;
    const palmsData: Array<{ group: THREE.Group; baseRotationZ: number; index: number }> = [];

    const trunkGeo = new THREE.CylinderGeometry(0.015, 0.055, 4.0, 8);

    for (let i = 0; i < palmsCount; i++) {
      const palmTree = new THREE.Group();
      const x = -10 + i * 4.0 + (Math.random() - 0.5) * 1.5;
      const z = -11 - Math.random() * 2.0;
      palmTree.position.set(x, -1.2, z);

      const leanZ = (Math.random() - 0.5) * 0.18 + (x < 0 ? -0.1 : 0.1);
      palmTree.rotation.z = leanZ;

      const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
      trunk.position.y = 2.0;
      palmTree.add(trunk);

      const leavesGroup = new THREE.Group();
      leavesGroup.position.y = 4.0;
      
      for (let j = 0; j < 8; j++) {
        const leafMesh = new THREE.Mesh(leafGeo, leafMaterial);
        const angle = (j / 8) * Math.PI * 2;
        leafMesh.rotation.y = angle;
        leafMesh.rotation.x = 0.52 + Math.random() * 0.14;
        leafMesh.rotation.z = (Math.random() - 0.5) * 0.1;
        leavesGroup.add(leafMesh);
      }
      palmTree.add(leavesGroup);
      palmsGroup.add(palmTree);

      palmsData.push({
        group: palmTree,
        baseRotationZ: leanZ,
        index: i,
      });
    }

    // ─── Phase 5: Silhouette lagoon egrets / herons ────────────────────────
    const birdsData: Array<{
      group: THREE.Group;
      wingL: THREE.Mesh;
      wingR: THREE.Mesh;
      speed: number;
      phase: number;
      radius: number;
      baseX: number;
    }> = [];
    const wingGeo = new THREE.PlaneGeometry(0.42, 0.13);
    wingGeo.translate(-0.21, 0, 0);
    const heronBodyGeo = new THREE.PlaneGeometry(0.22, 0.06);
    const heronNeckGeo = new THREE.PlaneGeometry(0.05, 0.28);
    heronNeckGeo.translate(0, 0.14, 0);

    const createHeronBird = () => {
      const birdGroup = new THREE.Group();

      const body = new THREE.Mesh(heronBodyGeo, birdSilhouetteMat);
      birdGroup.add(body);

      const neck = new THREE.Mesh(heronNeckGeo, birdSilhouetteMat);
      neck.position.set(0.1, 0.02, 0);
      neck.rotation.z = -0.35;
      birdGroup.add(neck);

      const wingL = new THREE.Mesh(wingGeo, birdSilhouetteMat);
      wingL.position.set(-0.02, 0.04, 0);
      birdGroup.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, birdSilhouetteMat);
      wingR.scale.x = -1;
      wingR.position.set(0.02, 0.04, 0);
      birdGroup.add(wingR);

      return { birdGroup, wingL, wingR };
    };

    for (let i = 0; i < 4; i++) {
      const { birdGroup, wingL, wingR } = createHeronBird();
      birdGroup.position.set(-9 + i * 6, 2.2 + Math.random() * 1.3, -9);
      scene.add(birdGroup);

      birdsData.push({
        group: birdGroup,
        wingL,
        wingR,
        speed: 4.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI,
        radius: 3.5 + Math.random() * 4.0,
        baseX: -6 + i * 4.5,
      });
    }

    // ─── Floating Lily Pads Geometry ─────────────────────────────────────
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
    const lotusCenterMat = new THREE.MeshStandardMaterial({ color: 0xffe8a0, emissive: 0x8a6020, emissiveIntensity: 0.3 });
    const lotusCenterGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6);

    const padData: Array<{ mesh: THREE.Mesh; lotus?: THREE.Group; x: number; z: number; phase: number; scale: number }> = [];

    const lotusLeafGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.012, 14);
    const lotusLeafMat = new THREE.MeshStandardMaterial({
      color: 0x4a9a68,
      roughness: 0.72,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 28; i++) {
      const x = -2 + Math.random() * 7;
      const z = -6 + Math.random() * 5;
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

      padData.push({
        mesh,
        lotus: lotusGroup,
        x,
        z,
        phase: Math.random() * Math.PI * 2,
        scale,
      });
    }

    const getWaveHeightAt = (x: number, z: number, time: number, speed: number, amp: number) => {
      const w1 = Math.sin(x * 0.35 + time * speed * 0.8) * amp * 0.7;
      const w2 = Math.sin(-x * 0.65 + time * speed * 1.3) * amp * 0.35;
      const w3 = Math.cos(x * 1.20 + time * speed * 2.1) * amp * 0.18;
      return w1 + w2 + w3;
    };

    // ─── Lake fish (visible just below surface) ───────────────────────────
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

    for (let i = 0; i < 16; i++) {
      const fish = new THREE.Mesh(fishGeo, fishMat);
      const fx = -1 + Math.random() * 6;
      const fz = -5 + Math.random() * 4;
      fish.position.set(fx, -1.28, fz);
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

    // ─── Mist/Fog Particles System (Horizon layer) ───────────────────────
    const mistTexture = (() => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
        grad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    })();

    const particleCount = window.innerWidth < 768 ? 40 : 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleData: Array<{ index: number; speedX: number; speedZ: number; limitX: number; originX: number }> = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = -0.8 + Math.random() * 0.6;
      const z = -6.0 - Math.random() * 8.0;

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

    // ─── Phase 2: Floating Fireflies/Bioluminescence ─────────────────────
    const isMobile = window.innerWidth < 768;
    const fireflyCount = isMobile ? 15 : 30;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflyData: Array<{ y: number; phase: number; speed: number }> = [];

    for (let i = 0; i < fireflyCount; i++) {
      const fx = (Math.random() - 0.5) * 8.0;
      const fy = -1.05 + Math.random() * 0.35;
      const fz = -2.0 + Math.random() * 5.5;

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
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, "rgba(255, 185, 91, 0.95)");
        grad.addColorStop(0.4, "rgba(255, 185, 91, 0.3)");
        grad.addColorStop(1, "rgba(255, 185, 91, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canvas);
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

    // ─── Environment Interpolation Handler ──────────────────────────────
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

    // Parallax
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

    const animate = () => {
      if (!prefersReduced) rafId = requestAnimationFrame(animate);
      
      const elapsed = clock.getElapsedTime();
      const scroll = scrollRef.current;
      const timeVal = timeRef.current;

      // 1. Interpolate environment values
      interpolateEnv(timeVal, currentEnv);

      // 2. Apply dynamic environment variables
      ambientLight.color.copy(currentEnv.ambient);
      ambientLight.intensity = currentEnv.ambientIntensity * 1.2;

      sunLight.color.copy(currentEnv.sun);
      sunLight.intensity = currentEnv.sunIntensity;
      sunLight.position.copy(currentEnv.sunPos);

      fog.color.copy(currentEnv.fogColor);
      fog.density = currentEnv.fogDensity * 0.28 * (1.0 - scroll * 0.4);
      hemiLight.intensity = 0.45 + currentEnv.ambientIntensity * 0.35;
      hemiLight.color.set(0x9ee8ec);
      hemiLight.groundColor.copy(currentEnv.water).multiplyScalar(0.85);

      // 3. Update Sky dome variables
      skyMat.uniforms.uColorTop.value.copy(currentEnv.skyTop);
      skyMat.uniforms.uColorBottom.value.copy(currentEnv.skyBottom);
      skyMat.uniforms.uSunDirection.value.copy(currentEnv.sunPos).normalize();
      skyMat.uniforms.uSunColor.value.copy(currentEnv.sun).multiplyScalar(currentEnv.sunIntensity);
      skyMat.uniforms.uTime.value = elapsed;
      skyMat.uniforms.uGoldenHourBoost.value = computeGoldenHourBoost(timeVal);
      skyMat.uniforms.uIsNight.value = computeIsNight(timeVal);
      skyMat.uniforms.uSunSize.value = computeIsNight(timeVal) > 0.5 ? 0.028 : 0.035;
      skyMat.uniforms.uWindX.value = computeWindX(timeVal);

      // Pin sky dome back to camera position to keep it infinite
      skyMesh.position.copy(camera.position);

      // 4. Compute View-Space Position of the warm lantern PointLight
      tempViewPos.copy(bulbSphere.position);
      tempViewPos.applyMatrix4(villaGroup.matrixWorld);
      tempViewPos.applyMatrix4(camera.matrixWorldInverse);

      tempWorldPos.copy(bulbSphere.position);
      tempWorldPos.applyMatrix4(villaGroup.matrixWorld);
      waterUniforms.uLanternPlanePos.value.set(tempWorldPos.x, -tempWorldPos.z);

      // 5. Update water uniforms
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

      // Apply light strength to local PointLight source
      warmLight.intensity = currentEnv.lanternIntensity * 2.2;

      // Update Volumetric Lantern Light Cone intensity
      coneUniforms.uIntensity.value = currentEnv.lanternIntensity;

      wireMat.opacity = 0.0;

      // 7. Sway palms silhouettes
      palmsData.forEach((palm) => {
        palm.group.rotation.z = palm.baseRotationZ + Math.sin(elapsed * 0.75 + palm.index) * 0.025;
        palm.group.rotation.x = Math.cos(elapsed * 0.6 + palm.index) * 0.012;
      });

      // 8. Flap wings & soar lagoon egrets (most active dawn/dusk)
      const birdVis = computeBirdVisibility(timeVal);
      birdsData.forEach((bird, idx) => {
        const flap = Math.sin(elapsed * bird.speed + bird.phase) * 0.65;
        bird.wingL.rotation.y = flap;
        bird.wingR.rotation.y = -flap;

        const angle = elapsed * 0.06 + idx * 2.0;
        bird.group.position.x = bird.baseX + Math.sin(angle) * bird.radius * 0.35;
        bird.group.position.z = -8.5 + Math.cos(angle) * 1.5;
        bird.group.visible = birdVis > 0.15;
        birdSilhouetteMat.opacity = birdVis;
      });

      // 9. Bob floating lily pads + lotus blooms on wave heights
      padData.forEach((pad) => {
        const height = getWaveHeightAt(
          pad.x,
          pad.z,
          elapsed,
          currentEnv.waveSpeed,
          currentEnv.waveAmplitude
        );
        const waterY = waterMesh.position.y + height + 0.005;
        pad.mesh.position.set(pad.x, waterY, pad.z);
        pad.mesh.rotation.z = Math.sin(elapsed * currentEnv.waveSpeed + pad.phase) * 0.04;
        pad.mesh.rotation.x = Math.cos(elapsed * currentEnv.waveSpeed + pad.phase) * 0.02;
        if (pad.lotus) {
          pad.lotus.position.set(pad.x, waterY + 0.01, pad.z);
          pad.lotus.rotation.y = pad.mesh.rotation.y;
        }
      });

      reedsData.forEach((reed) => {
        reed.mesh.rotation.z =
          reed.baseRotZ + Math.sin(elapsed * 1.1 + reed.phase) * 0.1;
      });

      const windX = computeWindX(timeVal);
      fishData.forEach((fish, i) => {
        const swim = elapsed * fish.speed + fish.phase;
        fish.mesh.position.x = fish.x + Math.sin(swim) * fish.radius + windX * elapsed * 0.02;
        fish.mesh.position.z = fish.z + Math.cos(swim * 0.8) * fish.radius * 0.6;
        fish.mesh.position.y =
          waterMesh.position.y +
          getWaveHeightAt(fish.mesh.position.x, fish.mesh.position.z, elapsed, currentEnv.waveSpeed, currentEnv.waveAmplitude) -
          0.06;
        fish.mesh.rotation.y = Math.atan2(
          Math.cos(swim * 0.8) * fish.radius * 0.6,
          Math.cos(swim) * fish.radius
        );
        fish.mesh.visible = computeIsNight(timeVal) < 0.5 || currentEnv.lanternIntensity > 0.5;
      });

      // 10. Drift mist particles
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

      // 11. Update Fireflies positions & fade opacity
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
      fgLeafMat.opacity = 0.25 + scroll * 0.08;

      // 12. Camera — field left, lake center, villa right, mountains beyond
      const targetCamX = 2.5 + mouse.x * 0.3;
      const targetCamY = 0.65 - mouse.y * 0.1;
      const targetCamZ = 7.5 - scroll * 4.0;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      camera.lookAt(0, 0.1 - scroll * 0.08, -6);

      // 13. Render
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
      fieldGeo.dispose();
      roadGeo.dispose();
      groundFloorGeo.dispose();
      guestFloorGeo.dispose();
      villaRoofGeo.dispose();
      balconyGeo.dispose();
      windowGeo.dispose();
      bulbGeo.dispose();
      coneGeo.dispose();
      foregroundLeafGeo.dispose();
      mountainGeo1.dispose();
      mountainGeo2.dispose();
      forestTrunkGeo.dispose();
      forestCrownGeo.dispose();
      wingGeo.dispose();
      heronBodyGeo.dispose();
      heronNeckGeo.dispose();
      reedGeo.dispose();
      shorelineGeo.dispose();
      rockGeo.dispose();
      leafGeo.dispose();
      trunkGeo.dispose();
      padGeometry.dispose();
      lotusLeafGeo.dispose();
      lotusGeo.dispose();
      lotusCenterGeo.dispose();
      fishGeo.dispose();
      particleGeo.dispose();
      fireflyGeo.dispose();

      // Materials
      waterMat.dispose();
      wireMat.dispose();
      skyMat.dispose();
      woodPlankMat.dispose();
      concreteMat.dispose();
      fieldMat.dispose();
      roadMat.dispose();
      wallMat.dispose();
      roofMat.dispose();
      windowMat.dispose();
      leafMaterial.dispose();
      slimPillarMat.dispose();
      luxuryGlassMat.dispose();
      bulbMat.dispose();
      coneMat.dispose();
      fgLeafMat.dispose();
      mtnMat.dispose();
      forestTrunkMat.dispose();
      forestCrownMat.dispose();
      shorelineSandMat.dispose();
      reedMat.dispose();
      rockMat.dispose();
      trunkMaterial.dispose();
      birdSilhouetteMat.dispose();
      padMaterial.dispose();
      lotusLeafMat.dispose();
      lotusMat.dispose();
      lotusCenterMat.dispose();
      fishMat.dispose();
      particleMat.dispose();
      fireflyMat.dispose();

      // Textures
      woodTexture.dispose();
      concreteTexture.dispose();
      leafTexture.dispose();
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
