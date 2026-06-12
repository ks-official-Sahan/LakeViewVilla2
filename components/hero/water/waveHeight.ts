export function getWaveHeightAt(
  x: number,
  z: number,
  time: number,
  speed: number,
  amp: number
): number {
  const w1 = Math.sin(x * 0.35 + time * speed * 0.8) * amp * 0.7;
  const w2 = Math.sin(-x * 0.65 + time * speed * 1.3) * amp * 0.35;
  const w3 = Math.cos(x * 1.2 + time * speed * 2.1) * amp * 0.18;
  return w1 + w2 + w3;
}
