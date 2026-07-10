export interface PadSpawn {
  x: number;
  z: number;
  scale: number;
  rotY: number;
  phase: number;
  isLotusLeaf: boolean;
  hasLotus: boolean;
  lotusIndex: number;
}

function hash01(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Deterministic 28-pad layout (stable across remounts). */
export function createPadSpawns(): PadSpawn[] {
  const spawns: PadSpawn[] = [];
  let lotusIndex = 0;

  for (let i = 0; i < 28; i++) {
    const h1 = hash01(i + 1);
    const h2 = hash01(i + 17);
    const h3 = hash01(i + 43);
    const h4 = hash01(i + 91);
    const isLotusLeaf = h1 > 0.65;
    const hasLotus = i % 2 === 0;
    const lotusIdx = hasLotus ? lotusIndex++ : -1;

    spawns.push({
      x: -4 + h1 * 8,
      z: -6 - h2 * 6,
      scale: (isLotusLeaf ? 0.85 : 0.55) + h3 * (isLotusLeaf ? 0.55 : 0.75),
      rotY: h4 * Math.PI * 2,
      phase: h2 * Math.PI * 2,
      isLotusLeaf,
      hasLotus,
      lotusIndex: lotusIdx,
    });
  }

  return spawns;
}

export const LILY_PAD_COUNT = 28;
export const LOTUS_BLOOM_COUNT = 14;
