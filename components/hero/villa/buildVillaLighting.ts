import * as THREE from "three";
import { GROUND_Y } from "../constants";
import type { VillaBuildContext } from "./villaContext";

export interface VillaLightingResult {
  interiorLight: THREE.PointLight;
  warmLight: THREE.PointLight;
  bulbSphere: THREE.Mesh;
}

export function buildVillaLighting(
  villaGroup: THREE.Group,
  interiorGroup: THREE.Group,
  ctx: VillaBuildContext
): VillaLightingResult {
  const { trackGeo, trackMat } = ctx;

  const interiorLight = new THREE.PointLight(0xffa550, 0.8, 8.0);
  interiorLight.position.set(-0.1, 1.0, 0.6);
  interiorGroup.add(interiorLight);

  const sconceLightL = new THREE.PointLight(0xffb060, 0.4, 4);
  sconceLightL.position.set(-1.55, 1.05, -1.6);
  interiorGroup.add(sconceLightL);
  const sconceLightR = new THREE.PointLight(0xffb060, 0.4, 4);
  sconceLightR.position.set(1.55, 1.05, -1.6);
  interiorGroup.add(sconceLightR);

  const bulbGeo = trackGeo(new THREE.SphereGeometry(0.04, 8, 8));
  const bulbMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xffd090 }));
  const bulbSphere = new THREE.Mesh(bulbGeo, bulbMat);
  bulbSphere.position.set(0, 1.45, -2.8);
  villaGroup.add(bulbSphere);

  const warmLight = new THREE.PointLight(0xffa04d, 0, 14);
  warmLight.position.set(0, 1.4, -2.7);
  villaGroup.add(warmLight);

  return { interiorLight, warmLight, bulbSphere };
}

export function buildGardenPath(ctx: VillaBuildContext): THREE.Mesh {
  const { trackGeo, trackMat } = ctx;
  const pathGeo = trackGeo(new THREE.PlaneGeometry(0.8, 3.5));
  const pathMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.88 }));
  const gardenPath = new THREE.Mesh(pathGeo, pathMat);
  gardenPath.rotation.x = -Math.PI / 2;
  gardenPath.position.set(6.2, GROUND_Y + 0.01, 1.5);
  return gardenPath;
}
