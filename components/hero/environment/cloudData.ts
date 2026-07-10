import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { getHeroLod } from "../performance";

export interface CloudClusterData {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseZ: number;
  speed: number;
}

function createMergedPuffGeometries(puffCount: number): THREE.BufferGeometry[] {
  const geos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < puffCount; i++) {
    const r = 0.4 + Math.random() * 0.6;
    const geo = new THREE.IcosahedronGeometry(r, 1);
    geo.translate(
      (Math.random() - 0.5) * 3.0,
      (Math.random() - 0.3) * 0.8,
      (Math.random() - 0.5) * 1.5
    );
    geo.scale(
      0.8 + Math.random() * 0.4,
      0.5 + Math.random() * 0.3,
      0.7 + Math.random() * 0.3
    );
    geos.push(geo);
  }
  return geos;
}

export function buildCloudClusters(
  isMobile: boolean,
  material: THREE.MeshBasicMaterial
): { clusters: CloudClusterData[]; geometries: THREE.BufferGeometry[] } {
  const cloudCount = getHeroLod(isMobile).cloudClusters;
  const clusters: CloudClusterData[] = [];
  const geometries: THREE.BufferGeometry[] = [];

  for (let i = 0; i < cloudCount; i++) {
    const cx = -20 + Math.random() * 40;
    const cy = 12 + Math.random() * 18;
    const cz = -25 + Math.random() * 15;
    const cScale = 1.5 + Math.random() * 2.5;
    const puffCount = 5 + Math.floor(Math.random() * 5);

    const puffGeos = createMergedPuffGeometries(puffCount);
    const merged = mergeGeometries(puffGeos, false);
    puffGeos.forEach((g) => g.dispose());

    if (!merged) continue;

    geometries.push(merged);
    const mesh = new THREE.Mesh(merged, material);
    mesh.position.set(cx, cy, cz);
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.scale.setScalar(cScale);

    clusters.push({
      mesh,
      baseX: cx,
      baseY: cy,
      baseZ: cz,
      speed: 0.002 + Math.random() * 0.004,
    });
  }

  return { clusters, geometries };
}
