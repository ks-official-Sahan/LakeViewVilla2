"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Shader sources ──────────────────────────────────────────────────────────

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2  uMouse;

  varying vec2  vUv;
  varying float vElevation;

  // Classic smooth noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;

    float t = uTime * 0.28;

    // Multi-octave organic terrain
    float n1 = snoise(vec3(position.x * 0.55, position.y * 0.55, t))        * 0.55;
    float n2 = snoise(vec3(position.x * 1.20 + 3.1, position.y * 1.20, t * 1.4)) * 0.22;
    float n3 = snoise(vec3(position.x * 2.80 + 7.3, position.y * 2.80, t * 2.1)) * 0.08;

    // Mouse attractor — subtle ridge forms near cursor
    float mDist = distance(vUv, uMouse * 0.5 + 0.5);
    float mInfluence = smoothstep(0.45, 0.0, mDist) * 0.18;

    float elevation = n1 + n2 + n3 + mInfluence;

    // Camera pull-in on scroll
    vec3 pos = position;
    pos.z += elevation;
    pos.z -= uScrollProgress * 2.2;

    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uScrollProgress;

  varying vec2  vUv;
  varying float vElevation;

  void main() {
    // Luxury ivory-to-charcoal palette — no cyan/blue/purple
    vec3 deepCharcoal = vec3(0.059, 0.063, 0.067);   // #0F1011
    vec3 warmGold     = vec3(0.788, 0.647, 0.353);   // #C9A55A
    vec3 softIvory    = vec3(0.965, 0.949, 0.910);   // #F5F2E8

    float t = uTime * 0.18;

    // Elevation-based color interpolation
    float ev = (vElevation + 0.65) * 0.77;
    vec3 col = mix(deepCharcoal, warmGold, smoothstep(0.2, 0.65, ev));
    col      = mix(col, softIvory,  smoothstep(0.65, 1.0, ev) * 0.35);

    // Edge vignette for depth
    float vignette = smoothstep(0.0, 0.45, distance(vUv, vec2(0.5)));
    col = mix(col, deepCharcoal, vignette * 0.55);

    // Scroll fade
    float alpha = (1.0 - uScrollProgress * 0.85) * 0.92;

    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

interface HeroCanvasProps {
  /** 0 → 1 progress of the hero's GSAP scroll phase, updated by parent */
  scrollProgress: number;
}

export default function HeroCanvas({ scrollProgress }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Mutable refs so closures inside animate() stay sync without re-renders
  const scrollRef   = useRef(scrollProgress);
  const mouseRef    = useRef({ x: 0.5, y: 0.5 });
  const mountedRef  = useRef(false);
  const disposeRef  = useRef<() => void>(() => {});

  // Sync scrollProgress into the mutable ref on every render
  scrollRef.current = scrollProgress;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: 1 - e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let raf: number;

    const boot = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const THREE = await import("three");

      // ─── Renderer ──────────────────────────────────────────────────────
      const dpr    = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.5);
      const w      = window.innerWidth;
      const h      = window.innerHeight;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: dpr < 1.5,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      // ─── Scene & Camera ─────────────────────────────────────────────────
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
      camera.position.set(0, 0, 4.5);

      // ─── Geometry — high-res plane for silky waves ──────────────────────
      const SEG = window.innerWidth < 768 ? 80 : 160;
      const geometry = new THREE.PlaneGeometry(8, 8, SEG, SEG);

      // ─── Shader Material ────────────────────────────────────────────────
      const uniforms = {
        uTime:           { value: 0 },
        uScrollProgress: { value: 0 },
        uMouse:          { value: new THREE.Vector2(0.5, 0.5) },
      };

      const material = new THREE.ShaderMaterial({
        vertexShader:   VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
        transparent:    true,
        side:           THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -0.35;
      scene.add(mesh);

      // ─── Wireframe overlay — luxury filament grid ────────────────────────
      const wireMat = new THREE.MeshBasicMaterial({
        color:       0xc9a55a,
        wireframe:   true,
        transparent: true,
        opacity:     0.06,
      });
      const wireMesh = new THREE.Mesh(geometry, wireMat);
      wireMesh.rotation.x = -0.35;
      wireMesh.position.z = 0.001;
      scene.add(wireMesh);

      // ─── Lighting (for reference — ShaderMaterial ignores it, used
      //     if you switch to StandardMaterial in future) ──────────────
      const ambient = new THREE.AmbientLight(0xffeedd, 0.5);
      scene.add(ambient);
      const spot = new THREE.SpotLight(0xd4a84b, 3, 20, Math.PI * 0.18, 0.4, 1.2);
      spot.position.set(2, 4, 5);
      scene.add(spot);
      scene.add(spot.target);

      // ─── Resize handler ─────────────────────────────────────────────────
      const onResize = () => {
        const nw = window.innerWidth;
        const nh = window.innerHeight;
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);
      window.addEventListener("mousemove", handleMouseMove);

      // ─── Render loop ────────────────────────────────────────────────────
      const clock = new THREE.Clock();

      const animate = () => {
        raf = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        uniforms.uTime.value           = elapsed;
        uniforms.uScrollProgress.value = scrollRef.current;
        uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

        // Subtle camera drift tracking mouse
        camera.position.x += (mouseRef.current.x * 0.3 - camera.position.x) * 0.04;
        camera.position.y += (mouseRef.current.y * 0.15 - camera.position.y) * 0.04;

        // Camera pull-in on scroll (Phase 1 → scene zoom into mesh)
        camera.position.z = 4.5 - scrollRef.current * 3.2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };
      animate();

      // ─── Cleanup ────────────────────────────────────────────────────────
      disposeRef.current = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", handleMouseMove);
        geometry.dispose();
        material.dispose();
        wireMat.dispose();
        renderer.dispose();
        scene.clear();
      };
    };

    boot();

    return () => {
      disposeRef.current();
      mountedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
