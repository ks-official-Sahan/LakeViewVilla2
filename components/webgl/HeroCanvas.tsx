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
    sunPos: [-12, 10, -8],
    fogColor: "#010508",
    fogDensity: 0.02,
    water: "#020a0d",
    waterSpecular: "#769bb0",
    waveSpeed: 0.15,
    waveAmplitude: 0.03,
    lanternIntensity: 1.6,
  },
  {
    time: 5.5, // Dawn
    skyTop: "#1B0B22",
    skyBottom: "#D48B6E",
    ambient: "#1B0E1E",
    ambientIntensity: 0.35,
    sun: "#E8A87C",
    sunIntensity: 0.8,
    sunPos: [15, 4, -4],
    fogColor: "#2B1A24",
    fogDensity: 0.035,
    water: "#14252C",
    waterSpecular: "#E8A87C",
    waveSpeed: 0.20,
    waveAmplitude: 0.04,
    lanternIntensity: 0.8,
  },
  {
    time: 10, // Morning
    skyTop: "#1A5C5E",
    skyBottom: "#F5F0E6",
    ambient: "#D6ECEF",
    ambientIntensity: 0.8,
    sun: "#FFF8E7",
    sunIntensity: 1.4,
    sunPos: [8, 15, 6],
    fogColor: "#F5F0E6",
    fogDensity: 0.012,
    water: "#1A5C5E",
    waterSpecular: "#FFF8E7",
    waveSpeed: 0.26,
    waveAmplitude: 0.05,
    lanternIntensity: 0.0,
  },
  {
    time: 14.5, // Afternoon
    skyTop: "#0F4648",
    skyBottom: "#FAF6EE",
    ambient: "#E2F0F2",
    ambientIntensity: 0.85,
    sun: "#FFFFFF",
    sunIntensity: 1.5,
    sunPos: [-6, 17, 8],
    fogColor: "#FAF6EE",
    fogDensity: 0.008,
    water: "#185658",
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
    sunPos: [-15, 3, -2],
    fogColor: "#2A140F",
    fogDensity: 0.03,
    water: "#1D231E",
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
    sunPos: [10, 8, -6],
    fogColor: "#02070a",
    fogDensity: 0.015,
    water: "#05151c",
    waterSpecular: "#769bb0",
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
    sunPos: [-12, 10, -8],
    fogColor: "#010508",
    fogDensity: 0.02,
    water: "#020a0d",
    waterSpecular: "#769bb0",
    waveSpeed: 0.15,
    waveAmplitude: 0.03,
    lanternIntensity: 1.6,
  },
];

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
    
    // Vertical sky gradient
    float h = direction.y * 0.5 + 0.5;
    vec3 skyColor = mix(uColorBottom, uColorTop, h);
    
    // Glowing Sun/Moon Disk
    float sunDot = dot(direction, normalize(uSunDirection));
    float sunOutline = smoothstep(1.0 - uSunSize * 1.5, 1.0 - uSunSize, sunDot);
    vec3 sunDisk = uSunColor * sunOutline * 3.2;

    // Drifting clouds above the horizon
    float cloudVal = 0.0;
    if (direction.y > -0.05) {
      vec2 cloudUv = vec2(direction.x, direction.z) / (direction.y + 0.08);
      cloudUv.x += uTime * 0.006; // horizontal drift
      float cloudNoise = fbm(cloudUv * 2.2);
      cloudVal = smoothstep(0.4, 0.7, cloudNoise) * smoothstep(-0.05, 0.25, direction.y);
    }

    vec3 cloudColor = mix(vec3(0.9, 0.95, 1.0) * (uSunColor + 0.35), vec3(0.05, 0.1, 0.15), 1.0 - clamp(uSunColor.r, 0.0, 1.0));
    vec3 finalColor = mix(skyColor + sunDisk, cloudColor, cloudVal * 0.25);
    
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

    Wave waves[3];
    waves[0] = Wave(normalize(vec2(1.0, 0.4)), uWaveAmplitude * 0.7, 0.35, 0.6, uWaveSpeed * 0.8);
    waves[1] = Wave(normalize(vec2(-0.8, 0.8)), uWaveAmplitude * 0.35, 0.65, 0.45, uWaveSpeed * 1.3);
    waves[2] = Wave(normalize(vec2(0.3, -0.9)), uWaveAmplitude * 0.18, 1.20, 0.3, uWaveSpeed * 2.1);

    vec3 displaced = pos;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 1.0, 0.0);

    for(int i = 0; i < 3; i++) {
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
  uniform vec3 uSunDirection;
  uniform float uSunIntensity;
  uniform float uScrollProgress;
  uniform float uTime;

  // Uniforms for warm pavilion lantern reflections
  uniform vec3 uLanternViewPosition;
  uniform vec3 uLanternColor;
  uniform float uLanternIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPos;
  varying float vHeight;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Depth color blend
    float heightFactor = clamp((vHeight + 0.12) * 3.5, 0.0, 1.0);
    vec3 col = mix(uWaterColor * 0.65, uWaterColor * 1.3, heightFactor);
    
    // Sun/Moon directional specular reflections
    vec3 halfDir = normalize(uSunDirection + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 38.0);
    col += uWaterSpecularColor * spec * uSunIntensity * 0.7;

    // Sparkling High-Frequency Glint dots
    float glintSpec = pow(max(dot(normal, halfDir), 0.0), 220.0);
    col += vec3(1.0, 0.95, 0.85) * glintSpec * uSunIntensity * 1.5;
    
    // Localized Warm Point Light specular (lantern reflection)
    vec3 fragPosInView = -vViewPosition;
    vec3 lightDir = normalize(uLanternViewPosition - fragPosInView);
    vec3 halfDirLantern = normalize(lightDir + viewDir);
    float specLantern = pow(max(dot(normal, halfDirLantern), 0.0), 32.0);
    float lightDist = length(uLanternViewPosition - fragPosInView);
    float attenuation = 1.0 / (1.0 + 0.22 * lightDist + 0.12 * lightDist * lightDist);
    col += uLanternColor * specLantern * uLanternIntensity * attenuation * 2.2;
    
    // Fresnel reflectivity (Sky color blend)
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.5);
    col = mix(col, uWaterSpecularColor * 1.4, fresnel * 0.35);

    // Wave proximity foam calculations near background shoreline (z = -7.5 which is plane y = 7.5)
    float distToShore = abs(vWorldPos.y - 7.5);
    float shoreFoam = smoothstep(0.7, 0.0, distToShore) * (0.45 + 0.45 * sin(uTime * 2.8 + vWorldPos.x * 2.0));

    // Rock proximity checks (rocks are fixed on the plane coordinates)
    vec2 rock1 = vec2(-6.0, 4.5);
    vec2 rock2 = vec2(-4.8, 5.2);
    vec2 rock3 = vec2(5.2, 4.8);
    vec2 rock4 = vec2(6.5, 3.5);
    vec2 rock5 = vec2(-2.0, 6.5);

    float d1 = distance(vWorldPos.xy, rock1);
    float d2 = distance(vWorldPos.xy, rock2);
    float d3 = distance(vWorldPos.xy, rock3);
    float d4 = distance(vWorldPos.xy, rock4);
    float d5 = distance(vWorldPos.xy, rock5);

    float minRockDist = min(min(min(d1, d2), min(d3, d4)), d5);
    float rockFoam = smoothstep(0.48, 0.0, minRockDist) * (0.4 + 0.6 * sin(uTime * 3.4 + vWorldPos.x * 3.5));

    float finalFoam = max(shoreFoam, rockFoam);
    col = mix(col, vec3(0.92, 0.96, 1.0) * (uSunIntensity * 0.4 + 0.6), finalFoam * 0.62);

    // Shallow shoreline sand gradient blending (shallows look mossy green)
    float shallowFactor = smoothstep(2.0, 0.0, distToShore);
    col = mix(col, vec3(0.12, 0.28, 0.24), shallowFactor * 0.45);

    // Fade to transparent near the deck position (approx center foreground)
    float distanceToPavilion = distance(vUv, vec2(0.5, 0.7));
    float transparency = smoothstep(0.05, 0.35, distanceToPavilion);
    
    // Edge fade vignette
    float edgeVignette = smoothstep(0.0, 0.65, distance(vUv, vec2(0.5)));
    col = mix(col, uWaterColor * 0.45, edgeVignette * 0.5);
    
    // Scroll fade
    float alpha = (0.3 + 0.7 * transparency) * (1.0 - uScrollProgress * 0.90);
    
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

  ctx.fillStyle = "#0a1417";
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = "#04080a";
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

  ctx.fillStyle = "#122024";
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
  
  ctx.strokeStyle = "#02070a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 250);
  ctx.quadraticCurveTo(64, 128, 48, 10);
  ctx.stroke();

  ctx.strokeStyle = "#010507";
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
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId: number;

    // ─── Renderer Setup ──────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.0 : 1.5);
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
    renderer.debug.checkShaderErrors = false;

    // ─── Scene & Camera ──────────────────────────────────────────────────
    const scene = new THREE.Scene();
    
    const fog = new THREE.FogExp2(0x0a1f24, 0.015);
    scene.fog = fog;

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0.4, 7.8);
    scene.add(camera);

    // ─── Lighting Setup ──────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
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
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.85,
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
    const SEG = window.innerWidth < 768 ? 64 : 128;
    const waterGeo = new THREE.PlaneGeometry(28, 28, SEG, SEG);
    
    const waterUniforms = {
      uTime: { value: 0 },
      uWaveSpeed: { value: 0.2 },
      uWaveAmplitude: { value: 0.045 },
      uWaterColor: { value: new THREE.Color(0x1a5c5e) },
      uWaterSpecularColor: { value: new THREE.Color(0xfff) },
      uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
      uSunIntensity: { value: 1.0 },
      uScrollProgress: { value: 0.0 },
      uLanternViewPosition: { value: new THREE.Vector3(0, 0, 0) },
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
    waterMesh.position.y = -1.2;
    scene.add(waterMesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc9a55a,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
    });
    const wireMesh = new THREE.Mesh(waterGeo, wireMat);
    wireMesh.rotation.x = -Math.PI / 2;
    wireMesh.position.y = -1.198;
    scene.add(wireMesh);

    // ─── 3D Architecture: Detailed Villa Pavilion ───────────────────────
    const deckGroup = new THREE.Group();
    scene.add(deckGroup);

    const deckBaseGeo = new THREE.BoxGeometry(6.6, 0.3, 5.6);
    const deckBase = new THREE.Mesh(deckBaseGeo, concreteMat);
    deckBase.position.set(0, -1.25, 1.8);
    deckGroup.add(deckBase);

    const mainDeckGeo = new THREE.BoxGeometry(6.5, 0.16, 5.5);
    const mainDeck = new THREE.Mesh(mainDeckGeo, woodPlankMat);
    mainDeck.position.set(0, -1.12, 1.8);
    deckGroup.add(mainDeck);

    const pillars: THREE.Mesh[] = [];
    const pillarGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.6, 12);
    const bracketGeo = new THREE.BoxGeometry(0.12, 0.04, 0.12);

    const pillarPositions = [
      [-3.0, 0.2, -0.6],
      [3.0, 0.2, -0.6],
      [-3.0, 0.2, 4.0],
      [3.0, 0.2, 4.0],
    ];

    pillarPositions.forEach(([px, py, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, slimPillarMat);
      pillar.position.set(px, py - 1.1, pz);
      deckGroup.add(pillar);
      pillars.push(pillar);

      const basePlate = new THREE.Mesh(bracketGeo, slimPillarMat);
      basePlate.position.set(px, -1.04, pz);
      deckGroup.add(basePlate);

      const capPlate = new THREE.Mesh(bracketGeo, slimPillarMat);
      capPlate.position.set(px, 1.6 - 1.1 + 1.25, pz);
      deckGroup.add(capPlate);
    });

    const roofSlabGeo = new THREE.BoxGeometry(6.7, 0.08, 5.7);
    const roofSlab = new THREE.Mesh(roofSlabGeo, concreteMat);
    roofSlab.position.set(0, 1.6 - 1.1 + 1.3, 1.8);
    deckGroup.add(roofSlab);

    const beamGeo = new THREE.BoxGeometry(6.6, 0.06, 0.06);
    const structuralBeams: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const beam = new THREE.Mesh(beamGeo, woodPlankMat);
      const bz = -0.5 + i * 1.12;
      beam.position.set(0, 1.6 - 1.1 + 1.18, bz);
      deckGroup.add(beam);
      structuralBeams.push(beam);
    }

    const glassRailGeo = new THREE.BoxGeometry(0.02, 0.7, 4.6);
    const handrailGeo = new THREE.BoxGeometry(0.03, 0.03, 4.6);
    const postGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8);

    const sideGlassL = new THREE.Mesh(glassRailGeo, luxuryGlassMat);
    sideGlassL.position.set(-3.0, -0.68, 1.7);
    deckGroup.add(sideGlassL);

    const handrailL = new THREE.Mesh(handrailGeo, slimPillarMat);
    handrailL.position.set(-3.0, -0.32, 1.7);
    deckGroup.add(handrailL);

    const postPositionsL = [
      [-3.0, -0.72, -0.6],
      [-3.0, -0.72, 1.7],
      [-3.0, -0.72, 4.0],
    ];
    postPositionsL.forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(postGeo, slimPillarMat);
      post.position.set(px, py, pz);
      deckGroup.add(post);
    });

    const sideGlassR = new THREE.Mesh(glassRailGeo, luxuryGlassMat);
    sideGlassR.position.set(3.0, -0.68, 1.7);
    deckGroup.add(sideGlassR);

    const handrailR = new THREE.Mesh(handrailGeo, slimPillarMat);
    handrailR.position.set(3.0, -0.32, 1.7);
    deckGroup.add(handrailR);

    const postPositionsR = [
      [3.0, -0.72, -0.6],
      [3.0, -0.72, 1.7],
      [3.0, -0.72, 4.0],
    ];
    postPositionsR.forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(postGeo, slimPillarMat);
      post.position.set(px, py, pz);
      deckGroup.add(post);
    });

    // Modern Lounge Chairs
    const frameGeo = new THREE.BoxGeometry(0.72, 0.04, 1.7);
    const cushionSeatGeo = new THREE.BoxGeometry(0.66, 0.08, 1.1);
    const cushionBackGeo = new THREE.BoxGeometry(0.66, 0.08, 0.6);
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xd6ecef, roughness: 0.9 });

    const chairGroup1 = new THREE.Group();
    chairGroup1.position.set(1.4, -1.02, 1.8);
    chairGroup1.rotation.y = -0.12;
    deckGroup.add(chairGroup1);

    const baseFrame1 = new THREE.Mesh(frameGeo, woodPlankMat);
    chairGroup1.add(baseFrame1);

    const seatCushion1 = new THREE.Mesh(cushionSeatGeo, cushionMat);
    seatCushion1.position.set(0, 0.06, 0.25);
    chairGroup1.add(seatCushion1);

    const backCushion1 = new THREE.Mesh(cushionBackGeo, cushionMat);
    backCushion1.position.set(0, 0.22, -0.45);
    backCushion1.rotation.x = -0.65;
    chairGroup1.add(backCushion1);

    // Warm Hanging Pendant Light
    const suspensionRodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.8, 4);
    const suspensionRod = new THREE.Mesh(suspensionRodGeo, slimPillarMat);
    suspensionRod.position.set(-1.8, 1.3, 1.8);
    deckGroup.add(suspensionRod);

    const cageGeo = new THREE.CylinderGeometry(0.08, 0.16, 0.28, 8, 2);
    const lanternCageMat = new THREE.MeshStandardMaterial({
      color: 0x050d10,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.9,
    });
    const lanternCage = new THREE.Mesh(cageGeo, lanternCageMat);
    lanternCage.position.set(-1.8, 0.82, 1.8);
    deckGroup.add(lanternCage);

    const bulbGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffb55b });
    const bulbSphere = new THREE.Mesh(bulbGeo, bulbMat);
    bulbSphere.position.set(-1.8, 0.82, 1.8);
    deckGroup.add(bulbSphere);

    // Dynamic light casting warm glow
    const warmLight = new THREE.PointLight(0xffa04d, 0, 12);
    warmLight.position.set(-1.8, 0.8, 1.8);
    deckGroup.add(warmLight);

    // ─── Phase 2: Volumetric light cone ───────────────────────────────────
    const coneGeo = new THREE.CylinderGeometry(0.04, 1.4, 2.6, 16, 1, true);
    coneGeo.translate(0, -1.3, 0); // shift pivot
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
          float alpha = verticalFade * edgeFade * uIntensity * 0.35;
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
    lightCone.position.set(-1.8, 0.82, 1.8);
    deckGroup.add(lightCone);

    // ─── Phase 4: Deck Foliage planters & accessories ─────────────────────
    const planterGroupL = new THREE.Group();
    planterGroupL.position.set(-2.7, -0.87, 3.7);
    deckGroup.add(planterGroupL);

    const potL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 12), concreteMat);
    potL.position.y = 0.25;
    planterGroupL.add(potL);

    for (let j = 0; j < 5; j++) {
      const leaf = new THREE.Mesh(leafGeo, leafMaterial);
      leaf.position.y = 0.5;
      leaf.rotation.y = (j / 5) * Math.PI * 2;
      leaf.rotation.x = 0.45 + Math.random() * 0.25;
      leaf.scale.set(0.6, 0.7, 0.6);
      planterGroupL.add(leaf);
    }

    const sideTable = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), concreteMat);
    sideTable.position.set(2.1, -0.89, 1.6);
    deckGroup.add(sideTable);

    const vaseGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 8);
    const vaseMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, transmission: 0.8 });
    const vase = new THREE.Mesh(vaseGeo, vaseMat);
    vase.position.set(2.1, -0.58, 1.6);
    deckGroup.add(vase);

    // Foreground lens silhouette leaf
    const foregroundLeafGeo = new THREE.PlaneGeometry(2.2, 4.4);
    foregroundLeafGeo.translate(0, 2.2, 0);
    const fgLeafMesh = new THREE.Mesh(foregroundLeafGeo, leafMaterial);
    camera.add(fgLeafMesh);
    fgLeafMesh.position.set(-1.8, -1.8, -2.5);
    fgLeafMesh.rotation.set(0.5, 0.6, -0.3);

    // ─── Shoreline & Landscape Elements ───────────────────────────────────
    const landscapeGroup = new THREE.Group();
    scene.add(landscapeGroup);

    const shorelineGeo = new THREE.BoxGeometry(45, 0.4, 3);
    const shorelineSandMat = new THREE.MeshStandardMaterial({
      color: 0x081316,
      roughness: 0.95,
    });
    const shorelineMesh = new THREE.Mesh(shorelineGeo, shorelineSandMat);
    shorelineMesh.position.set(0, -1.2, -7.5);
    landscapeGroup.add(shorelineMesh);

    const mountainGeo1 = new THREE.PlaneGeometry(60, 8);
    const mountainMat1 = new THREE.MeshBasicMaterial({
      color: 0x030a0d,
      transparent: true,
      opacity: 0.85,
    });
    const mountainMesh1 = new THREE.Mesh(mountainGeo1, mountainMat1);
    mountainMesh1.position.set(-5, 1.2, -15);
    landscapeGroup.add(mountainMesh1);

    const mountainGeo2 = new THREE.PlaneGeometry(60, 6);
    const mountainMat2 = new THREE.MeshBasicMaterial({
      color: 0x010507,
      transparent: true,
      opacity: 0.95,
    });
    const mountainMesh2 = new THREE.Mesh(mountainGeo2, mountainMat2);
    mountainMesh2.position.set(8, 0.6, -14.8);
    landscapeGroup.add(mountainMesh2);

    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x040e11,
      roughness: 0.88,
    });
    const rocks: THREE.Mesh[] = [];

    const rockPositions = [
      [-6.0, -1.1, -4.5, 0.8, 1.2, 0.9],
      [-4.8, -1.1, -5.2, 0.5, 0.6, 0.5],
      [5.2, -1.1, -4.8, 0.7, 0.9, 0.7],
      [6.5, -1.1, -3.5, 0.4, 0.5, 0.4],
      [-2.0, -1.15, -6.5, 1.2, 0.8, 1.0],
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
      color: 0x051319,
      roughness: 0.92,
    });

    const palmsCount = 6;
    const palmsData: Array<{ group: THREE.Group; baseRotationZ: number; index: number }> = [];

    const trunkGeo = new THREE.CylinderGeometry(0.015, 0.055, 4.0, 8);

    for (let i = 0; i < palmsCount; i++) {
      const palmTree = new THREE.Group();
      const x = -11 + i * 4.4 + (Math.random() - 0.5) * 1.5;
      const z = -7.5 - Math.random() * 2.5;
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

    // ─── Phase 5: Silhouette lagoon birds ──────────────────────────────────
    const birdsData: Array<{ group: THREE.Group; wingL: THREE.Mesh; wingR: THREE.Mesh; speed: number; phase: number; radius: number }> = [];
    const wingGeo = new THREE.PlaneGeometry(0.4, 0.14);
    wingGeo.translate(-0.2, 0, 0); // shift pivot to inner edge

    for (let i = 0; i < 3; i++) {
      const birdGroup = new THREE.Group();
      
      const wingL = new THREE.Mesh(wingGeo, trunkMaterial);
      wingL.position.x = -0.02;
      birdGroup.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, trunkMaterial);
      wingR.scale.x = -1;
      wingR.position.x = 0.02;
      birdGroup.add(wingR);

      birdGroup.position.set(-8 + i * 8, 2.2 + Math.random() * 1.3, -9);
      scene.add(birdGroup);

      birdsData.push({
        group: birdGroup,
        wingL,
        wingR,
        speed: 4.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI,
        radius: 3.5 + Math.random() * 4.0,
      });
    }

    // ─── Floating Lily Pads Geometry ─────────────────────────────────────
    const padsGroup = new THREE.Group();
    scene.add(padsGroup);

    const padGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.01, 12);
    const padMaterial = new THREE.MeshStandardMaterial({
      color: 0x7ba38c,
      roughness: 0.8,
    });

    const padData: Array<{ mesh: THREE.Mesh; x: number; z: number; phase: number; scale: number }> = [];

    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(padGeometry, padMaterial);
      const x = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6 - 0.5;
      const scale = 0.6 + Math.random() * 0.7;
      
      mesh.scale.set(scale, 1, scale);
      mesh.rotation.y = Math.random() * Math.PI;
      padsGroup.add(mesh);

      padData.push({
        mesh,
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
      size: 3.5,
      map: mistTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mistPoints = new THREE.Points(particleGeo, particleMat);
    scene.add(mistPoints);

    // ─── Phase 2: Floating Fireflies/Bioluminescence ─────────────────────
    const fireflyCount = 30;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflyData: Array<{ y: number; phase: number; speed: number }> = [];

    for (let i = 0; i < fireflyCount; i++) {
      const fx = (Math.random() - 0.5) * 8.0;
      const fy = -1.0 + Math.random() * 1.5;
      const fz = -1.0 + Math.random() * 6.0;

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

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      
      const elapsed = clock.getElapsedTime();
      const scroll = scrollRef.current;
      const timeVal = timeRef.current;

      // 1. Interpolate environment values
      interpolateEnv(timeVal, currentEnv);

      // 2. Apply dynamic environment variables
      ambientLight.color.copy(currentEnv.ambient);
      ambientLight.intensity = currentEnv.ambientIntensity;

      sunLight.color.copy(currentEnv.sun);
      sunLight.intensity = currentEnv.sunIntensity;
      sunLight.position.copy(currentEnv.sunPos);

      fog.color.copy(currentEnv.fogColor);
      fog.density = currentEnv.fogDensity * (1.0 - scroll * 0.4);

      // 3. Update Sky dome variables
      skyMat.uniforms.uColorTop.value.copy(currentEnv.skyTop);
      skyMat.uniforms.uColorBottom.value.copy(currentEnv.skyBottom);
      skyMat.uniforms.uSunDirection.value.copy(currentEnv.sunPos).normalize();
      skyMat.uniforms.uSunColor.value.copy(currentEnv.sun).multiplyScalar(currentEnv.sunIntensity);
      skyMat.uniforms.uTime.value = elapsed;

      // Pin sky dome back to camera position to keep it infinite
      skyMesh.position.copy(camera.position);

      // 4. Compute View-Space Position of the warm lantern PointLight
      tempViewPos.copy(bulbSphere.position);
      tempViewPos.applyMatrix4(deckGroup.matrixWorld);
      tempViewPos.applyMatrix4(camera.matrixWorldInverse);

      // 5. Update water uniforms
      waterUniforms.uTime.value = elapsed;
      waterUniforms.uWaveSpeed.value = currentEnv.waveSpeed;
      waterUniforms.uWaveAmplitude.value = currentEnv.waveAmplitude;
      waterUniforms.uWaterColor.value.copy(currentEnv.water);
      waterUniforms.uWaterSpecularColor.value.copy(currentEnv.waterSpecular);
      waterUniforms.uSunDirection.value.copy(currentEnv.sunPos).normalize();
      waterUniforms.uSunIntensity.value = currentEnv.sunIntensity;
      waterUniforms.uScrollProgress.value = scroll;
      
      waterUniforms.uLanternViewPosition.value.copy(tempViewPos);
      waterUniforms.uLanternIntensity.value = currentEnv.lanternIntensity;

      // Apply light strength to local PointLight source
      warmLight.intensity = currentEnv.lanternIntensity * 2.2;

      // Update Volumetric Lantern Light Cone intensity
      coneUniforms.uIntensity.value = currentEnv.lanternIntensity;

      // 6. Update wireframe overlay
      wireMat.color.copy(currentEnv.waterSpecular);
      wireMat.opacity = (isDarkRefTheme() ? 0.025 : 0.05) * (1.0 - scroll);

      // 7. Sway palms silhouettes
      palmsData.forEach((palm) => {
        palm.group.rotation.z = palm.baseRotationZ + Math.sin(elapsed * 0.75 + palm.index) * 0.025;
        palm.group.rotation.x = Math.cos(elapsed * 0.6 + palm.index) * 0.012;
      });

      // 8. Flap wings & fly background birds
      birdsData.forEach((bird, idx) => {
        const flap = Math.sin(elapsed * bird.speed + bird.phase) * 0.65;
        bird.wingL.rotation.y = flap;
        bird.wingR.rotation.y = -flap;

        const angle = elapsed * 0.06 + idx * 2.0;
        bird.group.position.x = -6.0 + Math.sin(angle) * bird.radius + idx * 4.5;
        bird.group.position.z = -8.5 + Math.cos(angle) * 1.5;
      });

      // 9. Bob floating lily pads on wave heights
      padData.forEach((pad) => {
        const height = getWaveHeightAt(
          pad.x,
          pad.z,
          elapsed,
          currentEnv.waveSpeed,
          currentEnv.waveAmplitude
        );
        pad.mesh.position.set(pad.x, waterMesh.position.y + height + 0.005, pad.z);
        pad.mesh.rotation.z = Math.sin(elapsed * currentEnv.waveSpeed + pad.phase) * 0.04;
        pad.mesh.rotation.x = Math.cos(elapsed * currentEnv.waveSpeed + pad.phase) * 0.02;
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
      particleMat.opacity = 0.35 * (1.0 - scroll);

      // 11. Update Fireflies positions & fade opacity
      const ffPositions = fireflyGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < fireflyCount; i++) {
        const data = fireflyData[i];
        ffPositions[i * 3 + 1] = data.y + Math.sin(elapsed * data.speed + data.phase) * 0.18;
        ffPositions[i * 3] += Math.sin(elapsed * 0.3 + i) * 0.0025;
        ffPositions[i * 3 + 2] += Math.cos(elapsed * 0.2 + i) * 0.002;
      }
      fireflyGeo.attributes.position.needsUpdate = true;
      fireflyMat.opacity = currentEnv.lanternIntensity * 0.55 * (1.0 - scroll);

      // 12. Camera positioning (calibrated lower-angle upward architectural look)
      const targetCamX = mouse.x * 0.45;
      const targetCamY = 0.4 - mouse.y * 0.20; 
      const targetCamZ = 7.0 - scroll * 4.2;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      camera.lookAt(0, 1.15 - scroll * 0.25, -2); // looking up towards canopy

      // 13. Render
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(scene, camera);
    };

    const isDarkRefTheme = () => {
      return document.documentElement.classList.contains("dark");
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
      deckBaseGeo.dispose();
      mainDeckGeo.dispose();
      pillarGeo.dispose();
      bracketGeo.dispose();
      roofSlabGeo.dispose();
      beamGeo.dispose();
      glassRailGeo.dispose();
      handrailGeo.dispose();
      postGeo.dispose();
      frameGeo.dispose();
      cushionSeatGeo.dispose();
      cushionBackGeo.dispose();
      suspensionRodGeo.dispose();
      cageGeo.dispose();
      bulbGeo.dispose();
      coneGeo.dispose();
      potL.geometry.dispose();
      foregroundLeafGeo.dispose();
      sideTable.geometry.dispose();
      vaseGeo.dispose();
      wingGeo.dispose();
      shorelineGeo.dispose();
      mountainGeo1.dispose();
      mountainGeo2.dispose();
      rockGeo.dispose();
      leafGeo.dispose();
      trunkGeo.dispose();
      padGeometry.dispose();
      particleGeo.dispose();
      fireflyGeo.dispose();

      // Materials
      waterMat.dispose();
      wireMat.dispose();
      skyMat.dispose();
      woodPlankMat.dispose();
      concreteMat.dispose();
      leafMaterial.dispose();
      slimPillarMat.dispose();
      luxuryGlassMat.dispose();
      cushionMat.dispose();
      lanternCageMat.dispose();
      bulbMat.dispose();
      coneMat.dispose();
      vaseMat.dispose();
      shorelineSandMat.dispose();
      mountainMat1.dispose();
      mountainMat2.dispose();
      rockMat.dispose();
      trunkMaterial.dispose();
      padMaterial.dispose();
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
