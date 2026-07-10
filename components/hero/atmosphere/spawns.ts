import { WATER_Y } from "../constants";
import { hash01 } from "../flora/hash01";

export interface MistSpawn {
  x: number;
  y: number;
  z: number;
  speedX: number;
  speedZ: number;
  limitX: number;
  originX: number;
}

export interface FireflySpawn {
  x: number;
  y: number;
  z: number;
  baseY: number;
  phase: number;
  speed: number;
}

export function createMistSpawns(count: number): MistSpawn[] {
  const spawns: MistSpawn[] = [];
  for (let i = 0; i < count; i++) {
    const x = (hash01(i + 2) - 0.5) * 20;
    spawns.push({
      x,
      y: WATER_Y + 0.2 + hash01(i + 11) * 0.6,
      z: -5.0 - hash01(i + 23) * 10.0,
      speedX: (hash01(i + 37) - 0.5) * 0.002,
      speedZ: (hash01(i + 41) - 0.5) * 0.001,
      limitX: 4 + hash01(i + 53) * 4,
      originX: x,
    });
  }
  return spawns;
}

export function createFireflySpawns(count: number): FireflySpawn[] {
  const spawns: FireflySpawn[] = [];
  for (let i = 0; i < count; i++) {
    const y = WATER_Y + 0.15 + hash01(i + 7) * 0.5;
    spawns.push({
      x: (hash01(i + 3) - 0.5) * 12.0,
      y,
      z: -3.0 - hash01(i + 19) * 8.0,
      baseY: y,
      phase: hash01(i + 31) * Math.PI * 2,
      speed: 0.6 + hash01(i + 47) * 0.6,
    });
  }
  return spawns;
}
