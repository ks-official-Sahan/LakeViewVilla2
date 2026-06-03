"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const RippleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If user prefers reduced motion, do not load WebGL
    if (prefersReducedMotion) {
      return;
    }

    const loadThree = async () => {
      let renderer: any = null;
      let geometry: any = null;
      let material: any = null;
      let mesh: any = null;
      let scene: any = null;

      try {
        const THREE = await import("three");
        setIsSupported(true);

        const canvas = canvasRef.current;
        if (!canvas) return;

        scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Define luxury wave geometry & shader materials
        geometry = new THREE.PlaneGeometry(20, 20, 80, 80);
        material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          },
          vertexShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              vec3 pos = position;
              pos.z += sin(pos.x * 1.8 + time) * 0.12;
              pos.z += sin(pos.y * 1.8 + time * 0.7) * 0.12;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
              vec2 center = vec2(0.5, 0.5);
              float dist = distance(vUv, center);
              float ripple = sin(dist * 18.0 - time * 1.5) * 0.5 + 0.5;
              gl_FragColor = vec4(0.04, 0.18, 0.22, ripple * 0.08);
            }
          `,
          transparent: true,
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        camera.position.z = 5;

        let animationFrameId: number;
        const animate = () => {
          material.uniforms.time.value += 0.008;
          renderer.render(scene, camera);
          animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
          if (!renderer) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        // Cleanup resources to prevent memory leaks (PUBLIC-04)
        return () => {
          window.removeEventListener("resize", handleResize);
          cancelAnimationFrame(animationFrameId);

          if (scene && mesh) {
            scene.remove(mesh);
          }
          if (geometry) {
            geometry.dispose();
          }
          if (material) {
            material.dispose();
          }
          if (renderer) {
            renderer.dispose();
          }
        };
      } catch (error) {
        console.warn("WebGL not supported:", error);
        setIsSupported(false);
      }
    };

    loadThree();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !isSupported) {
    // Elegant fallback style for accessibility compliance (PUBLIC-04)
    return (
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle at center, #0a1f24 0%, #02080a 100%)",
          mixBlendMode: "multiply",
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none opacity-30"
      style={{ mixBlendMode: "multiply" }}
    />
  );
};

export default RippleBackground;
