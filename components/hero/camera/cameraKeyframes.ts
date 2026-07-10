import * as THREE from "three";
import { LAKE_CENTER, WATER_Y } from "../constants";

export type CameraKeyframe = { t: number; pos: THREE.Vector3; look: THREE.Vector3 };

/** Lake look targets — camera stays locked on lagoon in the final third. */
const LAKE_FOCUS_NEAR = new THREE.Vector3(LAKE_CENTER.x, WATER_Y + 0.08, -10.5);
const LAKE_FOCUS_MID = new THREE.Vector3(LAKE_CENTER.x, WATER_Y, -13.5);
const LAKE_FOCUS_FAR = new THREE.Vector3(LAKE_CENTER.x, WATER_Y - 0.05, -19.0);

/**
 * Scroll-keyframed path: inside villa → balcony exit → garden → road → rise over lake.
 * Segment lerp only (no CatmullRom) so the camera never bows through walls.
 * Position stays on the villa's east side until past the façade, then arcs toward the lake.
 */
export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  // Inside — living room, lagoon glimpse through glass
  { t: 0.0, pos: new THREE.Vector3(6.02, 1.42, 4.9), look: new THREE.Vector3(4.8, 0.9, -2.0) },
  { t: 0.12, pos: new THREE.Vector3(6.04, 1.41, 3.75), look: new THREE.Vector3(4.4, 0.65, -3.8) },
  // Balcony threshold — still inside, look ahead to exit
  { t: 0.24, pos: new THREE.Vector3(6.07, 1.39, 2.45), look: new THREE.Vector3(3.6, 0.4, -5.8) },
  // Step onto balcony — above railing, no wall clipping
  { t: 0.36, pos: new THREE.Vector3(6.12, 1.34, 1.05), look: new THREE.Vector3(2.6, 0.15, -7.2) },
  { t: 0.46, pos: new THREE.Vector3(6.1, 1.24, -0.05), look: new THREE.Vector3(1.4, -0.02, -8.6) },
  // Garden path — beside villa, not through geometry
  { t: 0.56, pos: new THREE.Vector3(5.55, 1.14, -0.45), look: new THREE.Vector3(0.2, -0.12, -9.6) },
  { t: 0.66, pos: new THREE.Vector3(4.35, 1.08, -0.85), look: new THREE.Vector3(-0.3, -0.2, -10.8) },
  // Road — lake enters frame, look locks toward center
  { t: 0.74, pos: new THREE.Vector3(3.1, 1.06, -1.6), look: LAKE_FOCUS_NEAR.clone() },
  { t: 0.82, pos: new THREE.Vector3(1.6, 1.45, -3.2), look: LAKE_FOCUS_NEAR.clone() },
  // Rise — altitude increases, gaze stays on lake
  { t: 0.9, pos: new THREE.Vector3(0.2, 2.8, -6.2), look: LAKE_FOCUS_MID.clone() },
  { t: 0.96, pos: new THREE.Vector3(-0.35, 4.8, -9.5), look: LAKE_FOCUS_FAR.clone() },
  { t: 1.0, pos: new THREE.Vector3(-0.5, 6.4, -12.5), look: LAKE_FOCUS_FAR.clone() },
];

/**
 * Maps scroll 0–1 to camera path t so ~55% of scroll covers villa interior + exit,
 * and the final 45% covers road + lake rise (more time inside, deliberate lake reveal).
 */
export function mapScrollToCameraT(scroll: number): number {
  const s = Math.max(0, Math.min(1, scroll));
  const pathExitT = 0.66;
  const scrollExitShare = 0.55;

  if (s <= scrollExitShare) {
    return (s / scrollExitShare) * pathExitT;
  }
  return pathExitT + ((s - scrollExitShare) / (1 - scrollExitShare)) * (1 - pathExitT);
}

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
