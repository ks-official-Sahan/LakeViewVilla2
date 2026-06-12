"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "@/stores/heroStore";
import { computeBirdVisibility } from "../environment/envKeyframes";
import { createBirdSpawns } from "./spawns";

interface BirdAnimRef {
  group: THREE.Group;
  wingL: THREE.Mesh;
  wingR: THREE.Mesh;
  speed: number;
  phase: number;
  radius: number;
  baseX: number;
  baseY: number;
}

const BIRD_COUNT = 5;

/** Five soaring birds with wing flap and time-of-day visibility. */
export function Birds() {
  const timeOfDay = useHeroStore((s) => s.timeOfDay);
  const birdsRef = useRef<BirdAnimRef[]>([]);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const wingMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const { birdGroups, disposeList } = useMemo(() => {
    const spawns = createBirdSpawns(BIRD_COUNT);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a3840,
      roughness: 0.65,
      metalness: 0.08,
      transparent: true,
      opacity: 1,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x3d4f58,
      roughness: 0.55,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xc9a55a, roughness: 0.4 });

    const bodyGeo = new THREE.SphereGeometry(0.09, 10, 8);
    bodyGeo.scale(1.6, 0.65, 2.8);
    const wingGeo = new THREE.PlaneGeometry(0.62, 0.18);
    wingGeo.translate(-0.28, 0, 0);
    const headGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const beakGeo = new THREE.ConeGeometry(0.018, 0.1, 5);
    beakGeo.rotateX(-Math.PI / 2);

    const animRefs: BirdAnimRef[] = [];
    const groups = spawns.map((spawn) => {
      const birdGroup = new THREE.Group();
      birdGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0.17, 0.04, 0);
      birdGroup.add(head);

      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.position.set(0.26, 0.02, 0);
      birdGroup.add(beak);

      const wingL = new THREE.Mesh(wingGeo, wingMat);
      wingL.position.set(-0.02, 0.06, 0);
      birdGroup.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, wingMat);
      wingR.scale.x = -1;
      wingR.position.set(0.02, 0.06, 0);
      birdGroup.add(wingR);

      birdGroup.position.set(spawn.baseX, spawn.baseY, spawn.baseZ);
      birdGroup.scale.setScalar(spawn.scale);

      animRefs.push({
        group: birdGroup,
        wingL,
        wingR,
        speed: spawn.speed,
        phase: spawn.phase,
        radius: spawn.radius,
        baseX: spawn.baseX,
        baseY: spawn.baseY,
      });

      return birdGroup;
    });

    birdsRef.current = animRefs;
    bodyMatRef.current = bodyMat;
    wingMatRef.current = wingMat;

    return {
      birdGroups: groups,
      disposeList: {
        geometries: [bodyGeo, wingGeo, headGeo, beakGeo],
        materials: [bodyMat, wingMat, beakMat],
      },
    };
  }, []);

  useEffect(() => {
    return () => {
      disposeList.geometries.forEach((g) => g.dispose());
      disposeList.materials.forEach((m) => m.dispose());
    };
  }, [disposeList]);

  useFrame(() => {
    const elapsed = useHeroStore.getState().elapsed;
    const birdVis = computeBirdVisibility(timeOfDay);
    const bodyMat = bodyMatRef.current;
    const wingMat = wingMatRef.current;

    if (bodyMat && wingMat) {
      bodyMat.opacity = 0.75 + birdVis * 0.25;
      wingMat.opacity = 0.7 + birdVis * 0.3;
    }

    birdsRef.current.forEach((bird, idx) => {
      const flap = Math.sin(elapsed * bird.speed + bird.phase) * 0.65;
      bird.wingL.rotation.y = flap;
      bird.wingR.rotation.y = -flap;

      const angle = elapsed * 0.06 + idx * 1.8;
      bird.group.position.x = bird.baseX + Math.sin(angle) * bird.radius * 0.35;
      bird.group.position.z = -7 + Math.cos(angle) * 2.0;
      bird.group.position.y = bird.baseY + Math.sin(elapsed * 0.3 + idx) * 0.3;
      bird.group.visible = birdVis > 0.15;
      bird.group.rotation.y = Math.atan2(
        Math.cos(angle) * bird.radius * 0.35,
        -Math.sin(angle) * 2.0
      );
    });
  });

  return (
    <group name="birds">
      {birdGroups.map((group, index) => (
        <primitive key={index} object={group} />
      ))}
    </group>
  );
}
