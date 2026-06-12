import * as THREE from "three";
import { ROAD_Y, WATER_Y } from "../constants";
import { getTerrainHeight } from "../lib/terrain-height";
import { hash01 } from "./hash01";

export interface ForestTreeSpawn {
  x: number;
  z: number;
  treeHeight: number;
  leanZ: number;
  isConifer: boolean;
}

export interface BushSpawn {
  x: number;
  y: number;
  z: number;
  rotY: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

export interface ReedSpawn {
  x: number;
  y: number;
  z: number;
  baseRotZ: number;
  baseRotY: number;
  phase: number;
}

export interface GrassBladeSpawn {
  x: number;
  y: number;
  z: number;
  baseRotY: number;
  baseRotZ: number;
  scaleX: number;
  scaleY: number;
}

export interface PalmSpawn {
  x: number;
  y: number;
  z: number;
  leanZ: number;
  index: number;
  leafTilts: number[];
  leafRolls: number[];
}

export function createForestSpawns(count: number): ForestTreeSpawn[] {
  const spawns: ForestTreeSpawn[] = [];
  for (let f = 0; f < count; f++) {
    spawns.push({
      x: -14 + hash01(f + 1) * 28,
      z: -20 - hash01(f + 29) * 6,
      treeHeight: 0.8 + hash01(f + 53) * 1.2,
      leanZ: (hash01(f + 71) - 0.5) * 0.08,
      isConifer: hash01(f + 97) > 0.4,
    });
  }
  return spawns;
}

export function createBushSpawns(count = 18): BushSpawn[] {
  const spawns: BushSpawn[] = [];
  for (let b = 0; b < count; b++) {
    const bz = -2.5 - hash01(b + 3) * 2;
    const t = Math.max(0, Math.min(1, (-bz - 2.5) / 2.0));
    const by = THREE.MathUtils.lerp(ROAD_Y, WATER_Y + 0.15, t);
    spawns.push({
      x: -8 + hash01(b + 11) * 16,
      y: by + 0.1,
      z: bz,
      rotY: hash01(b + 19) * Math.PI,
      scaleX: 0.7 + hash01(b + 31) * 0.6,
      scaleY: 0.5 + hash01(b + 41) * 0.4,
      scaleZ: 0.7 + hash01(b + 47) * 0.6,
    });
  }
  return spawns;
}

export function createReedSpawns(count = 30): ReedSpawn[] {
  const spawns: ReedSpawn[] = [];
  for (let r = 0; r < count; r++) {
    spawns.push({
      x: -6 + r * 0.6 + (hash01(r + 5) - 0.5) * 0.3,
      y: WATER_Y + 0.2 + hash01(r + 13) * 0.1,
      z: -4.8 - hash01(r + 23) * 1.5,
      baseRotZ: (hash01(r + 37) - 0.5) * 0.12,
      baseRotY: (hash01(r + 43) - 0.5) * 0.4,
      phase: hash01(r + 59) * Math.PI * 2,
    });
  }
  return spawns;
}

export function createGrassBladeSpawns(count: number): GrassBladeSpawn[] {
  const spawns: GrassBladeSpawn[] = [];
  for (let i = 0; i < count; i++) {
    const gz = -1.5 - hash01(i + 7) * 3.5;
    const slopeT = Math.max(0, Math.min(1, (-gz - 1.5) / 3.5));
    const gy = THREE.MathUtils.lerp(ROAD_Y - 0.02, WATER_Y + 0.12, slopeT * slopeT);
    spawns.push({
      x: -10 + hash01(i + 2) * 22,
      y: gy,
      z: gz,
      baseRotY: hash01(i + 17) * Math.PI,
      baseRotZ: (hash01(i + 31) - 0.5) * 0.35,
      scaleX: 0.7 + hash01(i + 43) * 0.5,
      scaleY: 0.5 + hash01(i + 61) * 1.0,
    });
  }
  return spawns;
}

export function createPalmSpawns(count = 7): PalmSpawn[] {
  const spawns: PalmSpawn[] = [];
  for (let i = 0; i < count; i++) {
    const z = -2.1 - hash01(i + 9) * 2.4;
    const localZ = z - -3.0;
    const t = THREE.MathUtils.clamp((localZ + 1.75) / 3.5, 0, 1);
    const palmY = THREE.MathUtils.lerp(WATER_Y + 0.08, ROAD_Y - 0.02, t * t);
    const x = -7.5 + i * 2.8 + (hash01(i + 3) - 0.5) * 0.8;
    const leanZ = (hash01(i + 21) - 0.5) * 0.18 + (x < 0 ? -0.1 : 0.1);
    const leafTilts: number[] = [];
    const leafRolls: number[] = [];
    for (let j = 0; j < 10; j++) {
      leafTilts.push(0.52 + hash01(i * 10 + j + 1) * 0.14);
      leafRolls.push((hash01(i * 10 + j + 50) - 0.5) * 0.1);
    }
    spawns.push({ x, y: palmY, z, leanZ, index: i, leafTilts, leafRolls });
  }
  return spawns;
}

export function getForestTreeY(x: number, z: number): number {
  return getTerrainHeight(x, z);
}
