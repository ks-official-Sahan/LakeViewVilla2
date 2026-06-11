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
}

// Hex configs for smooth parsing on boot
const ENV_PRESETS = [
  {
    time: 0, // Midnight
    skyTop: "#02070A",
    skyBottom: "#051319",
    ambient: "#020709",
    ambientIntensity: 0.15,
    sun: "#8EB4C9", // Silver moon
    sunIntensity: 0.4,
    sunPos: [-12, 10, -8],
    fogColor: "#02070A",
    fogDensity: 0.02,
    water: "#030E12",
    waterSpecular: "#8EB4C9",
    waveSpeed: 0.15,
    waveAmplitude: 0.04,
  },
  {
    time: 5.5, // Dawn
    skyTop: "#1B0B22", // Purple indigo
    skyBottom: "#D48B6E", // Coral dawn
    ambient: "#1B0E1E",
    ambientIntensity: 0.35,
    sun: "#E8A87C", // Coral sun
    sunIntensity: 0.8,
    sunPos: [15, 4, -4],
    fogColor: "#2B1A24",
    fogDensity: 0.035,
    water: "#14252C",
    waterSpecular: "#E8A87C",
    waveSpeed: 0.20,
    waveAmplitude: 0.05,
  },
  {
    time: 10, // Morning
    skyTop: "#1A5C5E", // Lagoon teal
    skyBottom: "#F5F0E6", // Sand ivory
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
    waveAmplitude: 0.07,
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
    waveAmplitude: 0.08,
  },
  {
    time: 18.5, // Sunset
    skyTop: "#230A03", // Crimson dusk
    skyBottom: "#C9A55A", // Sunset gold
    ambient: "#3D241E",
    ambientIntensity: 0.45,
    sun: "#E8904E", // Orange sunset sun
    sunIntensity: 1.6,
    sunPos: [-15, 3, -2],
    fogColor: "#2A140F",
    fogDensity: 0.03,
    water: "#1D231E",
    waterSpecular: "#C9A55A",
    waveSpeed: 0.22,
    waveAmplitude: 0.055,
  },
  {
    time: 21, // Night
    skyTop: "#030A0D",
    skyBottom: "#0B2027",
    ambient: "#051318",
    ambientIntensity: 0.25,
    sun: "#8EB4C9", // Moonrise
    sunIntensity: 0.5,
    sunPos: [10, 8, -6],
    fogColor: "#030A0D",
    fogDensity: 0.015,
    water: "#05151C",
    waterSpecular: "#8EB4C9",
    waveSpeed: 0.17,
    waveAmplitude: 0.045,
  },
  {
    time: 24, // Midnight Wrap
    skyTop: "#02070A",
    skyBottom: "#051319",
    ambient: "#020709",
    ambientIntensity: 0.15,
    sun: "#8EB4C9",
    sunIntensity: 0.4,
    sunPos: [-12, 10, -8],
    fogColor: "#02070A",
    fogDensity: 0.02,
    water: "#030E12",
    waterSpecular: "#8EB4C9",
    waveSpeed: 0.15,
    waveAmplitude: 0.04,
  },
];

// Cache parsed colors for 60fps performance
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
}));

// Interpolation function
function interpolateEnv(time: number, target: EnvConfig) {
  // Clamp time
  const tOfDay = Math.max(0, Math.min(23.99, time));

  // Find keyframes
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
}

// ─── Shaders ──────────────────────────────────────────────────────────

const SKY_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uColorTop;
  uniform vec3 uColorBottom;
  varying vec2 vUv;
  void main() {
    // vertical sky gradient
    gl_FragColor = vec4(mix(uColorBottom, uColorTop, vUv.y), 1.0);
  }
`;

const WATER_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uWaveSpeed;
  uniform float uWaveAmplitude;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vHeight;

  float getWave(vec2 pos, float t) {
    float w1 = sin(pos.x * 0.45 + pos.y * 0.35 + t * uWaveSpeed) * uWaveAmplitude;
    float w2 = sin(pos.x * 0.95 - pos.y * 0.70 + t * uWaveSpeed * 1.5) * uWaveAmplitude * 0.4;
    float w3 = cos(pos.x * 1.80 + pos.y * 1.40 + t * uWaveSpeed * 2.1) * uWaveAmplitude * 0.18;
    return w1 + w2 + w3;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float height = getWave(pos.xy, uTime);
    pos.z += height;
    vHeight = height;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    vViewPosition = -mvPosition.xyz;
    
    // Approximate normal calculation on deformed surface
    float eps = 0.04;
    float hL = getWave(pos.xy - vec2(eps, 0.0), uTime);
    float hR = getWave(pos.xy + vec2(eps, 0.0), uTime);
    float hD = getWave(pos.xy - vec2(0.0, eps), uTime);
    float hU = getWave(pos.xy + vec2(0.0, eps), uTime);
    vec3 tangentX = vec3(2.0 * eps, 0.0, hR - hL);
    vec3 tangentY = vec3(0.0, 2.0 * eps, hU - hD);
    vNormal = normalize(cross(tangentX, tangentY));
  }
`;

const WATER_FRAGMENT = /* glsl */ `
  uniform vec3 uWaterColor;
  uniform vec3 uWaterSpecularColor;
  uniform vec3 uSunDirection;
  uniform float uSunIntensity;
  uniform float uScrollProgress;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vHeight;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Water depth effect based on wave height
    float heightFactor = clamp((vHeight + 0.1) * 3.5, 0.0, 1.0);
    vec3 col = mix(uWaterColor * 0.75, uWaterColor * 1.25, heightFactor);
    
    // Specular highlight (reflective sparkle)
    vec3 halfDir = normalize(uSunDirection + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 38.0);
    col += uWaterSpecularColor * spec * uSunIntensity * 0.7;
    
    // Fresnel reflectivity
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);
    col = mix(col, uWaterSpecularColor * 1.3, fresnel * 0.28);
    
    // Edge fade vignette
    float edgeVignette = smoothstep(0.0, 0.55, distance(vUv, vec2(0.5)));
    col = mix(col, uWaterColor * 0.5, edgeVignette * 0.4);
    
    // Scroll progress alpha reveal
    float alpha = 1.0 - uScrollProgress * 0.90;
    
    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Component Props ─────────────────────────────────────────────────────────

interface HeroCanvasProps {
  scrollProgress: number;
  timeOfDay: number; // 0 to 24 hours
}

export default function HeroCanvas({ scrollProgress, timeOfDay }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(scrollProgress);
  const timeRef = useRef(timeOfDay);

  // Keep progress state refs synced to avoid recreation of effect hooks
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

    // ─── Scene & Camera ──────────────────────────────────────────────────
    const scene = new THREE.Scene();
    
    // Setup initial fog (will be updated dynamically)
    const fog = new THREE.FogExp2(0x0a1f24, 0.015);
    scene.fog = fog;

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    // Positioned looking slightly down at the horizontal water plane
    camera.position.set(0, 3.2, 8.5);

    // ─── Lighting Setup ──────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    scene.add(sunLight);

    // ─── Sky Background ──────────────────────────────────────────────────
    // A full viewport quad drawn in the background
    const skyGeo = new THREE.PlaneGeometry(2, 2);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERTEX,
      fragmentShader: SKY_FRAGMENT,
      uniforms: {
        uColorTop: { value: new THREE.Color(0x02070a) },
        uColorBottom: { value: new THREE.Color(0x051319) },
      },
      depthWrite: false,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    // Create separate scene for background so it renders behind everything
    const skyScene = new THREE.Scene();
    const skyCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    skyScene.add(skyMesh);

    // ─── Water Geometry & Material ───────────────────────────────────────
    // Multi-segmented plane rotated flat to represent the lake surface
    const SEG = window.innerWidth < 768 ? 64 : 128;
    const waterGeo = new THREE.PlaneGeometry(28, 28, SEG, SEG);
    
    const waterUniforms = {
      uTime: { value: 0 },
      uWaveSpeed: { value: 0.2 },
      uWaveAmplitude: { value: 0.07 },
      uWaterColor: { value: new THREE.Color(0x1a5c5e) },
      uWaterSpecularColor: { value: new THREE.Color(0xfff) },
      uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
      uSunIntensity: { value: 1.0 },
      uScrollProgress: { value: 0.0 },
    };

    const waterMat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERTEX,
      fragmentShader: WATER_FRAGMENT,
      uniforms: waterUniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2; // Flat horizontal plane
    waterMesh.position.y = -1.2; // Sit slightly below camera view line
    scene.add(waterMesh);

    // ─── Water Wireframe Grid Overlay (Luxury styling) ───────────────────
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc9a55a,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
    });
    const wireMesh = new THREE.Mesh(waterGeo, wireMat);
    wireMesh.rotation.x = -Math.PI / 2;
    wireMesh.position.y = -1.198; // Sit exactly above water surface
    scene.add(wireMesh);

    // ─── Floating Lily Pads Geometry (Bobbing on waves) ──────────────────
    const padsGroup = new THREE.Group();
    scene.add(padsGroup);

    const padGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.01, 12);
    const padMaterial = new THREE.MeshStandardMaterial({
      color: 0x7ba38c, // Coastal Sage
      roughness: 0.8,
    });

    const padData: Array<{ mesh: THREE.Mesh; x: number; z: number; phase: number; scale: number }> = [];

    // Scatter 15 lily pads near the foreground camera view
    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(padGeometry, padMaterial);
      const x = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6 - 1; // Scatter in front of camera
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

    // Function to calculate exact wave height at (x,z) to bob pads
    const getWaveHeightAt = (x: number, z: number, time: number, speed: number, amp: number) => {
      const w1 = Math.sin(x * 0.45 + z * 0.35 + time * speed) * amp;
      const w2 = Math.sin(x * 0.95 - z * 0.70 + time * speed * 1.5) * amp * 0.4;
      const w3 = Math.cos(x * 1.80 + z * 1.40 + time * speed * 2.1) * amp * 0.18;
      return w1 + w2 + w3;
    };

    // ─── Mist/Fog Particles System (Horizon layer) ───────────────────────
    // Soft programmatic radial circle texture
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
      // Scatter particles at the far back shoreline
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
      waveAmplitude: 0.07,
    };

    // Mouse interactive camera parallax
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ─── Resize Handler ──────────────────────────────────────────────────
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

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      
      const elapsed = clock.getElapsedTime();
      const scroll = scrollRef.current;
      const timeVal = timeRef.current;

      // 1. Interpolate Environment variables based on Time of Day
      interpolateEnv(timeVal, currentEnv);

      // 2. Apply environment states to scene lighting
      ambientLight.color.copy(currentEnv.ambient);
      ambientLight.intensity = currentEnv.ambientIntensity;

      sunLight.color.copy(currentEnv.sun);
      sunLight.intensity = currentEnv.sunIntensity;
      sunLight.position.copy(currentEnv.sunPos);

      fog.color.copy(currentEnv.fogColor);
      fog.density = currentEnv.fogDensity * (1.0 - scroll * 0.4); // Thin out slightly as we scroll down

      // 3. Apply sky uniforms
      skyMat.uniforms.uColorTop.value.copy(currentEnv.skyTop);
      skyMat.uniforms.uColorBottom.value.copy(currentEnv.skyBottom);

      // 4. Apply water uniforms
      waterUniforms.uTime.value = elapsed;
      waterUniforms.uWaveSpeed.value = currentEnv.waveSpeed;
      waterUniforms.uWaveAmplitude.value = currentEnv.waveAmplitude;
      waterUniforms.uWaterColor.value.copy(currentEnv.water);
      waterUniforms.uWaterSpecularColor.value.copy(currentEnv.waterSpecular);
      waterUniforms.uSunDirection.value.copy(currentEnv.sunPos).normalize();
      waterUniforms.uSunIntensity.value = currentEnv.sunIntensity;
      waterUniforms.uScrollProgress.value = scroll;

      // 5. Update wireframe overlay
      wireMat.color.copy(currentEnv.waterSpecular);
      wireMat.opacity = (isDarkRefTheme() ? 0.025 : 0.05) * (1.0 - scroll);

      // 6. Bob floating Lily Pads
      padData.forEach((pad) => {
        const height = getWaveHeightAt(
          pad.x,
          pad.z,
          elapsed,
          currentEnv.waveSpeed,
          currentEnv.waveAmplitude
        );
        pad.mesh.position.set(pad.x, waterMesh.position.y + height + 0.005, pad.z);
        // Tilt pad slightly matching the wave normals
        pad.mesh.rotation.z = Math.sin(elapsed * currentEnv.waveSpeed + pad.phase) * 0.05;
        pad.mesh.rotation.x = Math.cos(elapsed * currentEnv.waveSpeed + pad.phase) * 0.03;
      });

      // 7. Animate Mist Particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];
        
        // Sway drift
        positions[i * 3] += data.speedX;
        positions[i * 3 + 2] += data.speedZ;

        // Reset particles that drift too far
        if (Math.abs(positions[i * 3] - data.originX) > data.limitX) {
          positions[i * 3] = data.originX;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleMat.color.copy(currentEnv.fogColor);
      particleMat.opacity = 0.35 * (1.0 - scroll);

      // 8. Scroll-driven camera pull & mouse parallax
      // Base positions
      const targetCamX = mouse.x * 0.7;
      const targetCamY = 3.2 - mouse.y * 0.3;
      const targetCamZ = 8.5 - scroll * 5.2; // Move camera closer to water on scroll

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      // Look slightly down at center water plane
      camera.lookAt(0, -0.6 - scroll * 0.4, -1);

      // Render sky, then scene
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(skyScene, skyCamera);
      renderer.render(scene, camera);
    };

    // Helper function to read dark theme dynamically
    const isDarkRefTheme = () => {
      return document.documentElement.classList.contains("dark");
    };

    animate();

    // ─── Cleanup ─────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      waterGeo.dispose();
      waterMat.dispose();
      wireMat.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      padGeometry.dispose();
      padMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
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
