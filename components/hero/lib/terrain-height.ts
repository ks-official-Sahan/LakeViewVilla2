import * as THREE from "three";
import { WATER_Y } from "../constants";

export function getTerrainHeight(x: number, z: number): number {
  const localZ = z - -28;
  const t = THREE.MathUtils.clamp((8 - localZ) / 16, 0, 1);
  const shoreBlend = THREE.MathUtils.smoothstep(-20, -16, z);
  const slopeY = THREE.MathUtils.lerp(WATER_Y + 0.05, WATER_Y - 0.02 + t * 3.5, shoreBlend);
  const shoreCurve = Math.sin(x * 0.15) * 0.35 + Math.cos(x * 0.08) * 0.18;
  const detailNoise = Math.sin(x * 1.0 + localZ * 1.3) * 0.1 + Math.cos(x * 2.2) * 0.05;
  return slopeY + detailNoise + shoreCurve * Math.max(0, 1 - t * 1.5);
}
