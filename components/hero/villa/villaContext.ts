import type * as THREE from "three";
import type { ProceduralTextureSet } from "../hooks/useProceduralTextures";

export interface VillaDisposableResources {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
}

export interface VillaBuildContext {
  resources: VillaDisposableResources;
  textures: ProceduralTextureSet;
  trackGeo: <T extends THREE.BufferGeometry>(geo: T) => T;
  trackMat: <T extends THREE.Material>(mat: T) => T;
  trackTex: <T extends THREE.Texture>(tex: T) => T;
}

export function createVillaBuildContext(textures: ProceduralTextureSet): VillaBuildContext {
  const resources: VillaDisposableResources = {
    geometries: [],
    materials: [],
    textures: [],
  };

  return {
    resources,
    textures,
    trackGeo(geo) {
      resources.geometries.push(geo);
      return geo;
    },
    trackMat(mat) {
      resources.materials.push(mat);
      return mat;
    },
    trackTex(tex) {
      resources.textures.push(tex);
      return tex;
    },
  };
}

export function disposeVillaResources(resources: VillaDisposableResources): void {
  resources.geometries.forEach((g) => g.dispose());
  resources.materials.forEach((m) => m.dispose());
  resources.textures.forEach((t) => t.dispose());
}
