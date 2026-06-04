"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uScrollY;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Fluid wave motion using multiple octaves of sine waves
    float waveX = sin(pos.x * 0.4 + uTime * 0.5) * 0.3;
    float waveY = sin(pos.y * 0.3 + uTime * 0.4) * 0.3;
    float waveOffset = sin((pos.x + pos.y) * 0.2 + uTime * 0.2) * 0.2;
    
    // Mouse interaction - distort waves near cursor
    float mouseDist = distance(uv, uMouse * 0.5 + 0.5);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * 0.45;
    
    float elevation = waveX + waveY + waveOffset + mouseInfluence * sin(uTime * 2.0);
    pos.z += elevation;
    
    // Scroll offset distortion
    pos.y -= uScrollY * 0.002;

    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Generate glowing line filaments based on elevation
    float linePattern = sin(vElevation * 8.0) * 0.5 + 0.5;
    float glow = smoothstep(0.1, 0.9, linePattern) * 0.35;
    
    // Asymmetrical color blending
    vec3 baseColor = uColor;
    vec3 glowColor = mix(baseColor, vec3(1.0, 0.9, 0.7), vElevation * 0.5 + 0.5);
    
    // Add subtle grid line highlight
    float grid = step(0.97, sin(vUv.x * 60.0)) + step(0.97, sin(vUv.y * 60.0));
    vec3 finalColor = mix(glowColor, baseColor * 1.5, grid * 0.15);
    
    // Vignette falloff towards the edges
    float edgeFalloff = smoothstep(1.0, 0.3, length(vUv - vec2(0.5)));
    
    gl_FragColor = vec4(finalColor, uOpacity * (glow + 0.05) * edgeFalloff);
  }
`;

export function InteractiveBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = useState(true);
  const { resolvedTheme } = useTheme();
  const stateRef = useRef({
    scrollY: 0,
    targetScrollY: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
  });

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIsSupported(false);
      return;
    }

    let cleanup: (() => void) | undefined;

    const initWebGL = async () => {
      try {
        const THREE = await import("three");
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Scene Setup
        const scene = new THREE.Scene();
        
        // Responsive camera settings
        const aspect = window.innerWidth / window.innerHeight;
        const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        camera.position.set(0, 0, 5);

        const dpr = Math.min(window.devicePixelRatio, 1.5);
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: dpr < 1.5,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Plane geometry with fine segments for wave distortion
        const geometry = new THREE.PlaneGeometry(16, 12, 100, 80);

        // Theme colors
        const isDark = resolvedTheme === "dark";
        const themeColor = new THREE.Color(isDark ? 0xc9a55a : 0xaa823a);

        // Custom Shader Material
        const uniforms = {
          uTime: { value: 0 },
          uScrollY: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uColor: { value: themeColor },
          uOpacity: { value: isDark ? 0.22 : 0.15 },
        };

        const material = new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -0.5;
        scene.add(mesh);

        // Add wireframe filaments
        const wireframeMat = new THREE.MeshBasicMaterial({
          color: isDark ? 0xc9a55a : 0xaa823a,
          wireframe: true,
          transparent: true,
          opacity: isDark ? 0.03 : 0.02,
          depthWrite: false,
        });
        const wireframeMesh = new THREE.Mesh(geometry, wireframeMat);
        wireframeMesh.rotation.x = -0.5;
        wireframeMesh.position.z = 0.01;
        scene.add(wireframeMesh);

        // Event listeners
        const handleResize = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };

        const handleMouseMove = (e: MouseEvent) => {
          stateRef.current.targetMouseX = e.clientX / window.innerWidth;
          stateRef.current.targetMouseY = 1.0 - e.clientY / window.innerHeight;
        };

        const handleScroll = () => {
          stateRef.current.targetScrollY = window.scrollY;
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("scroll", handleScroll, { passive: true });

        // Animation Loop
        const clock = new THREE.Clock();
        let rafId: number;

        const animate = () => {
          rafId = requestAnimationFrame(animate);

          const time = clock.getElapsedTime();
          
          // Smooth interpolation (Lerping) for mouse and scroll to ensure absolute luxury performance
          stateRef.current.mouseX += (stateRef.current.targetMouseX - stateRef.current.mouseX) * 0.05;
          stateRef.current.mouseY += (stateRef.current.targetMouseY - stateRef.current.mouseY) * 0.05;
          stateRef.current.scrollY += (stateRef.current.targetScrollY - stateRef.current.scrollY) * 0.08;

          // Update uniform values
          uniforms.uTime.value = time;
          uniforms.uScrollY.value = stateRef.current.scrollY;
          uniforms.uMouse.value.set(stateRef.current.mouseX, stateRef.current.mouseY);

          // Subtle mesh rotation based on mouse coordinates
          mesh.rotation.y = stateRef.current.mouseX * 0.05 - 0.025;
          mesh.rotation.z = stateRef.current.scrollY * 0.0001;
          wireframeMesh.rotation.y = mesh.rotation.y;
          wireframeMesh.rotation.z = mesh.rotation.z;

          renderer.render(scene, camera);
        };

        animate();

        cleanup = () => {
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("scroll", handleScroll);
          cancelAnimationFrame(rafId);
          geometry.dispose();
          material.dispose();
          wireframeMat.dispose();
          renderer.dispose();
          scene.clear();
        };
      } catch (err) {
        console.warn("Failed to initialize WebGL backdrop:", err);
        setIsSupported(false);
      }
    };

    initWebGL();

    return () => {
      if (cleanup) cleanup();
    };
  }, [resolvedTheme]);

  if (!isSupported) {
    return (
      <div 
        className="fixed inset-0 -z-50 pointer-events-none opacity-40 transition-opacity duration-700" 
        style={{
          background: resolvedTheme === "dark"
            ? "radial-gradient(circle at 70% 30%, rgba(201, 165, 90, 0.07) 0%, transparent 60%)"
            : "radial-gradient(circle at 70% 30%, rgba(201, 165, 90, 0.04) 0%, transparent 60%)"
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-50 pointer-events-none block h-full w-full opacity-60 transition-opacity duration-500"
    />
  );
}
