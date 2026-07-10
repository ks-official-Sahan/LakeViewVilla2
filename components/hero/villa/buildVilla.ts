import * as THREE from "three";
import { GROUND_Y } from "../constants";
import type { ProceduralTextureSet } from "../hooks/useProceduralTextures";
import { buildGardenPath, buildVillaLighting } from "./buildVillaLighting";
import { buildVillaExterior } from "./buildVillaExterior";
import { buildVillaInterior } from "./buildVillaInterior";
import { createVillaBuildContext, disposeVillaResources, type VillaDisposableResources } from "./villaContext";
import type { VillaRuntimeRefs } from "./villaRegistry";

export interface BuiltVilla {
  root: THREE.Group;
  gardenPath: THREE.Mesh;
  runtime: VillaRuntimeRefs;
  dispose: () => void;
}

export function buildVilla(textures: ProceduralTextureSet): BuiltVilla {
  const ctx = createVillaBuildContext(textures);
  const root = new THREE.Group();
  root.position.set(6, GROUND_Y + 0.88, 3.5);
  root.rotation.y = -0.15;
  root.name = "villa-root";

  const { windowMat } = buildVillaExterior(root, ctx);
  const interiorGroup = buildVillaInterior(root, ctx);
  const lighting = buildVillaLighting(root, interiorGroup, ctx);
  const gardenPath = buildGardenPath(ctx);

  const resources: VillaDisposableResources = ctx.resources;

  return {
    root,
    gardenPath,
    runtime: {
      villaGroup: root,
      bulbSphere: lighting.bulbSphere,
      windowMat,
      interiorLight: lighting.interiorLight,
      warmLight: lighting.warmLight,
    },
    dispose: () => disposeVillaResources(resources),
  };
}
