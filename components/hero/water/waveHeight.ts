/** CPU-side Gerstner height sample (matches lake vertex waves 0–3). */
export function getWaveHeightAt(
  x: number,
  z: number,
  time: number,
  speed: number,
  amp: number
): number {
  const waves = [
    { dx: 1.0, dy: 0.4, a: 0.7, f: 0.35, s: 0.8 },
    { dx: -0.8, dy: 0.8, a: 0.35, f: 0.65, s: 1.3 },
    { dx: 0.3, dy: -0.9, a: 0.18, f: 1.2, s: 2.1 },
    { dx: 0.6, dy: 0.2, a: 0.12, f: 2.1, s: 2.8 },
  ] as const;

  let h = 0;
  for (const w of waves) {
    const len = Math.hypot(w.dx, w.dy) || 1;
    const dirX = w.dx / len;
    const dirY = w.dy / len;
    const phase = (dirX * x + dirY * z) * w.f + time * speed * w.s;
    h += Math.sin(phase) * amp * w.a;
  }

  h += Math.sin(x * 3.2 + time * speed * 2.5) * amp * 0.08;
  return h;
}
