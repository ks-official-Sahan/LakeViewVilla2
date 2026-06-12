import * as THREE from "three";

export type CameraKeyframe = { t: number; pos: THREE.Vector3; look: THREE.Vector3 };

export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { t: 0.0, pos: new THREE.Vector3(6.0, 1.4, 3.0), look: new THREE.Vector3(0.0, 0.1, -6.0) },
  { t: 0.15, pos: new THREE.Vector3(6.06, 1.4, 3.6), look: new THREE.Vector3(4.2, 0.55, -4.0) },
  { t: 0.3, pos: new THREE.Vector3(6.1, 1.36, 2.2), look: new THREE.Vector3(3.2, 0.25, -6.0) },
  { t: 0.42, pos: new THREE.Vector3(6.12, 1.32, 1.0), look: new THREE.Vector3(2.0, 0.05, -7.5) },
  { t: 0.52, pos: new THREE.Vector3(6.08, 1.18, 0.15), look: new THREE.Vector3(0.8, -0.1, -8.8) },
  { t: 0.62, pos: new THREE.Vector3(5.2, 1.08, -0.35), look: new THREE.Vector3(0.0, -0.2, -9.8) },
  { t: 0.72, pos: new THREE.Vector3(3.6, 1.05, -0.8), look: new THREE.Vector3(-0.5, -0.25, -11.0) },
  { t: 0.82, pos: new THREE.Vector3(2.0, 1.55, -2.8), look: new THREE.Vector3(-0.3, -0.35, -13.5) },
  { t: 0.92, pos: new THREE.Vector3(0.4, 3.2, -6.5), look: new THREE.Vector3(0.0, -0.45, -16.0) },
  { t: 1.0, pos: new THREE.Vector3(-0.6, 5.8, -11.5), look: new THREE.Vector3(0.2, -0.55, -22.0) },
];

export function sampleCameraKeyframes(
  scroll: number,
  keyframes: CameraKeyframe[],
  outPos: THREE.Vector3,
  outLook: THREE.Vector3
) {
  const t = Math.max(0, Math.min(1, scroll));
  let i = 0;
  for (let k = 0; k < keyframes.length - 1; k++) {
    if (t >= keyframes[k].t) i = k;
  }
  const a = keyframes[i];
  const b = keyframes[Math.min(i + 1, keyframes.length - 1)];
  const f = THREE.MathUtils.clamp((t - a.t) / Math.max(0.0001, b.t - a.t), 0, 1);
  const eased = f * f * (3 - 2 * f);
  outPos.lerpVectors(a.pos, b.pos, eased);
  outLook.lerpVectors(a.look, b.look, eased);
}

export function buildCameraPath(): THREE.CatmullRomCurve3 {
  const points = CAMERA_KEYFRAMES.map((k) => k.pos.clone());
  return new THREE.CatmullRomCurve3(points);
}

export function buildLookAtPath(): THREE.CatmullRomCurve3 {
  const points = CAMERA_KEYFRAMES.map((k) => k.look.clone());
  return new THREE.CatmullRomCurve3(points);
}
