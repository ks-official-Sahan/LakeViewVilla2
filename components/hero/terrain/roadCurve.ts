import * as THREE from "three";

/** Catmull-Rom control points — gentle east-west curve through the villa approach. */
export const ROAD_CURVE_POINTS = [
  new THREE.Vector3(-12, 0, 0.35),
  new THREE.Vector3(-5, 0, 0.12),
  new THREE.Vector3(0, 0, 0.2),
  new THREE.Vector3(5, 0, 0.08),
  new THREE.Vector3(12, 0, 0.28),
] as const;

export function createRoadCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(ROAD_CURVE_POINTS.map((p) => p.clone()));
}
