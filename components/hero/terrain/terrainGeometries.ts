import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GROUND_Y, ROAD_Y, WATER_Y } from "../constants";
import { getTerrainHeight } from "../lib/terrain-height";
import { createRoadCurve } from "./roadCurve";

const ROCK_TRANSFORMS: ReadonlyArray<
  readonly [number, number, number, number, number, number]
> = [
  [-4.5, WATER_Y + 0.05, -5.0, 0.5, 0.6, 0.5],
  [2.5, WATER_Y + 0.03, -5.5, 0.4, 0.5, 0.4],
  [6.0, WATER_Y + 0.04, -4.8, 0.35, 0.45, 0.35],
  [-1.0, WATER_Y + 0.02, -5.8, 0.6, 0.4, 0.55],
  [-7.5, WATER_Y + 0.06, -4.5, 0.45, 0.5, 0.4],
];

function hash01(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function createVillaGroundGeometry(): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(12, 10);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export function createRoadTubeGeometry(): THREE.TubeGeometry {
  const curve = createRoadCurve();
  return new THREE.TubeGeometry(curve, 64, 1.4, 8, false);
}

export function createCurbGeometry(): THREE.BoxGeometry {
  return new THREE.BoxGeometry(24, 0.06, 0.12);
}

export function createGrassStripGeometry(): THREE.BufferGeometry {
  const grassStripSeg = 40;
  const geo = new THREE.PlaneGeometry(22, 3.5, grassStripSeg, grassStripSeg);
  geo.rotateX(-Math.PI / 2);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i);
    const x = positions.getX(i);
    const t = (z + 1.75) / 3.5;
    const slopeY = THREE.MathUtils.lerp(WATER_Y + 0.08, ROAD_Y - 0.02, t * t);
    const noise = Math.sin(x * 1.8 + z * 2.3) * 0.02 + Math.cos(x * 3.1) * 0.01;
    positions.setY(i, slopeY + noise);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createLakeFieldGeometry(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(5, 7, 10, 14);
  geo.rotateX(-Math.PI / 2);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const localZ = positions.getZ(i);
    const t = (localZ + 3.5) / 7.0;
    const slopeY = THREE.MathUtils.lerp(WATER_Y + 0.12, ROAD_Y - 0.01, t * t);
    const nx = positions.getX(i);
    const noise = Math.sin(nx * 2.0 + localZ * 1.5) * 0.015;
    positions.setY(i, slopeY + noise);
  }
  geo.computeVertexNormals();
  return geo;
}

export const LAKE_FIELD_POSITION: readonly [number, number, number] = [-5.8, 0, -2.8];

export function createShoreWedgeGeometry(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(42, 6, 28, 8);
  geo.rotateX(-Math.PI / 2);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const localZ = positions.getZ(i);
    const worldZ = -17 + localZ;
    const t = THREE.MathUtils.clamp((localZ + 3) / 6, 0, 1);
    const y = THREE.MathUtils.lerp(WATER_Y + 0.1, getTerrainHeight(x, worldZ), t * t);
    positions.setY(i, y);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createFarTerrainGeometry(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(50, 16, 40, 20);
  geo.rotateX(-Math.PI / 2);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const localZ = positions.getZ(i);
    const worldZ = -28 + localZ;
    positions.setY(i, getTerrainHeight(x, worldZ));
  }
  geo.computeVertexNormals();
  return geo;
}

export function createMergedRocksGeometry(): THREE.BufferGeometry {
  const baseGeo = new THREE.DodecahedronGeometry(1, 0);
  const dummy = new THREE.Object3D();
  const rockGeos: THREE.BufferGeometry[] = [];

  ROCK_TRANSFORMS.forEach(([rx, ry, rz, sx, sy, sz], index) => {
    const g = baseGeo.clone();
    g.scale(sx, sy, sz);
    dummy.position.set(rx, ry, rz);
    dummy.rotation.set(hash01(index + 1) * Math.PI, hash01(index + 17) * Math.PI, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    g.applyMatrix4(dummy.matrix);
    rockGeos.push(g);
  });

  baseGeo.dispose();
  const merged = mergeGeometries(rockGeos, false);
  rockGeos.forEach((g) => g.dispose());
  if (!merged) {
    throw new Error("Failed to merge shore rock geometries");
  }
  return merged;
}

export const VILLA_GROUND_POSITION: readonly [number, number, number] = [5, GROUND_Y, 4];
