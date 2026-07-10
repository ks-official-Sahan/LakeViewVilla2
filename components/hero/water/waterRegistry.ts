import type { WaterUniforms } from "./waterUniforms";

let activeUniforms: WaterUniforms | null = null;

export function registerWaterUniforms(uniforms: WaterUniforms | null): void {
  activeUniforms = uniforms;
}

export function getWaterUniforms(): WaterUniforms | null {
  return activeUniforms;
}
