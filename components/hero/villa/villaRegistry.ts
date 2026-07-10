import type * as THREE from "three";

export interface VillaRuntimeRefs {
  villaGroup: THREE.Group;
  bulbSphere: THREE.Mesh;
  windowMat: THREE.MeshStandardMaterial;
  interiorLight: THREE.PointLight;
  warmLight: THREE.PointLight;
}

let activeRefs: VillaRuntimeRefs | null = null;

export function registerVillaRuntime(refs: VillaRuntimeRefs | null): void {
  activeRefs = refs;
}

export function getVillaRuntime(): VillaRuntimeRefs | null {
  return activeRefs;
}
