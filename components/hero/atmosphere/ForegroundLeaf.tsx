"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { useProceduralTextures } from "../hooks/useProceduralTextures";
import type { HeroComponentProps } from "../types";

/** Camera-attached palm frond for depth parallax on scroll. */
export function ForegroundLeaf({ isMobile = false }: HeroComponentProps) {
  const camera = useThree((s) => s.camera);
  const scrollProgress = useHeroStore((s) => s.scrollProgress);
  const textures = useProceduralTextures(isMobile);

  const mesh = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2.2, 4.4);
    geo.translate(0, 2.2, 0);
    const mat = new THREE.MeshStandardMaterial({
      map: textures.palmLeaf,
      color: 0x5aaa78,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      roughness: 0.75,
      opacity: 0.28,
    });
    const leaf = new THREE.Mesh(geo, mat);
    leaf.position.set(-2.2, -2.0, -2.8);
    leaf.rotation.set(0.5, 0.6, -0.3);
    leaf.scale.setScalar(0.7);
    return leaf;
  }, [textures.palmLeaf, isMobile]);

  useLayoutEffect(() => {
    camera.add(mesh);
    return () => {
      camera.remove(mesh);
    };
  }, [camera, mesh]);

  useEffect(() => {
    return () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    };
  }, [mesh]);

  useFrame(() => {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const scroll = Math.max(0, Math.min(1, scrollProgress));
    mat.opacity = Math.max(0, 0.25 - scroll * 0.3);
  });

  return null;
}
