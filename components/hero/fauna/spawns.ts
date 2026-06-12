import { WATER_Y } from "../constants";
import { hash01 } from "../flora/hash01";

export interface FishSpawn {
  x: number;
  z: number;
  phase: number;
  speed: number;
  radius: number;
  rotY: number;
}

export interface BirdSpawn {
  baseX: number;
  baseY: number;
  baseZ: number;
  speed: number;
  phase: number;
  radius: number;
  scale: number;
}

export function createFishSpawns(count = 14): FishSpawn[] {
  const spawns: FishSpawn[] = [];
  for (let i = 0; i < count; i++) {
    spawns.push({
      x: -3 + hash01(i + 4) * 7,
      z: -7 - hash01(i + 18) * 5,
      phase: hash01(i + 33) * Math.PI * 2,
      speed: 0.4 + hash01(i + 47) * 0.5,
      radius: 0.4 + hash01(i + 61) * 0.8,
      rotY: hash01(i + 73) * Math.PI,
    });
  }
  return spawns;
}

export function createBirdSpawns(count = 5): BirdSpawn[] {
  const spawns: BirdSpawn[] = [];
  for (let i = 0; i < count; i++) {
    spawns.push({
      baseX: -6 + i * 3.5,
      baseY: 3.0 + hash01(i + 11) * 2.5,
      baseZ: -9 - hash01(i + 27) * 2,
      speed: 4.5 + hash01(i + 39) * 2.5,
      phase: hash01(i + 51) * Math.PI,
      radius: 3.5 + hash01(i + 67) * 4.0,
      scale: 1.0 + hash01(i + 79) * 0.4,
    });
  }
  return spawns;
}

export const FISH_SUBMERGE_OFFSET = 0.06;
export const FISH_INITIAL_Y = WATER_Y - FISH_SUBMERGE_OFFSET;
