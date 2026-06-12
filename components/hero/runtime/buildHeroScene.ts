import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  GROUND_Y,
  LAKE_CENTER,
  LAKE_FIELD_ROTATION_Y,
  LAKE_RADIUS,
  ROAD_Y,
  SHORE_WORLD_Z,
  WATER_Y,
} from "../constants";
import { createEnvConfig } from "../environment/envKeyframes";
import type { EnvConfig } from "../types";
import { getProceduralTextures } from "../lib/procedural-textures";
import { getTerrainHeight } from "../lib/terrain-height";
import { SKY_FRAGMENT, SKY_VERTEX } from "../shaders/sky";
import { WATER_FRAGMENT, WATER_VERTEX } from "../shaders/water";

// ─── Ref types ───────────────────────────────────────────────────────────────

export interface CloudData {
  group: THREE.Group;
  baseX: number;
  baseY: number;
  baseZ: number;
  speed: number;
}

export interface PalmData {
  group: THREE.Group;
  baseRotationZ: number;
  index: number;
}

export interface BirdData {
  group: THREE.Group;
  wingL: THREE.Mesh;
  wingR: THREE.Mesh;
  speed: number;
  phase: number;
  radius: number;
  baseX: number;
  baseY: number;
}

export interface PadData {
  mesh: THREE.Mesh;
  lotus?: THREE.Group;
  x: number;
  z: number;
  phase: number;
  scale: number;
}

export interface ReedInstanceData {
  index: number;
  baseRotZ: number;
  baseRotY: number;
  phase: number;
  x: number;
  y: number;
  z: number;
}

export interface FishInstanceData {
  index: number;
  x: number;
  z: number;
  phase: number;
  speed: number;
  radius: number;
}

export interface GrassInstanceData {
  index: number;
  baseRotY: number;
  baseRotZ: number;
  x: number;
  y: number;
  z: number;
  scaleX: number;
  scaleY: number;
}

export interface ForestTreeMeta {
  isConifer: boolean;
  matIdx: number;
  treeHeight: number;
  leanZ: number;
}

export interface MistParticleData {
  index: number;
  speedX: number;
  speedZ: number;
  limitX: number;
  originX: number;
}

export interface FireflyData {
  y: number;
  phase: number;
  speed: number;
}

export interface WaterUniforms {
  uTime: { value: number };
  uWaveSpeed: { value: number };
  uWaveAmplitude: { value: number };
  uWaterColor: { value: THREE.Color };
  uWaterSpecularColor: { value: THREE.Color };
  uSkyTop: { value: THREE.Color };
  uSkyBottom: { value: THREE.Color };
  uSunDirection: { value: THREE.Vector3 };
  uSunIntensity: { value: number };
  uScrollProgress: { value: number };
  uShoreWorldZ: { value: number };
  uLakeCenter: { value: THREE.Vector2 };
  uLakeRadius: { value: number };
  uLanternViewPosition: { value: THREE.Vector3 };
  uLanternPlanePos: { value: THREE.Vector2 };
  uLanternColor: { value: THREE.Color };
  uLanternIntensity: { value: number };
  uMobile: { value: number };
}

export interface HeroSceneRefs {
  fog: THREE.FogExp2;
  ambientLight: THREE.AmbientLight;
  hemiLight: THREE.HemisphereLight;
  sunLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  skyMesh: THREE.Mesh;
  skyMat: THREE.ShaderMaterial;
  sunOrb: THREE.Mesh;
  sunOrbMat: THREE.MeshBasicMaterial;
  sunGlowSprite: THREE.Sprite;
  moonOrb: THREE.Mesh;
  moonGlowSprite: THREE.Sprite;
  cloudsData: CloudData[];
  cloudMat: THREE.MeshBasicMaterial;
  waterMesh: THREE.Mesh;
  waterUniforms: WaterUniforms;
  villaGroup: THREE.Group;
  bulbSphere: THREE.Mesh;
  warmLight: THREE.PointLight;
  windowMat: THREE.MeshStandardMaterial;
  interiorLight: THREE.PointLight;
  palmsData: PalmData[];
  birdsData: BirdData[];
  birdBodyMat: THREE.MeshStandardMaterial;
  birdWingMat: THREE.MeshStandardMaterial;
  padData: PadData[];
  reedsInstanced: THREE.InstancedMesh;
  reedsData: ReedInstanceData[];
  fishInstanced: THREE.InstancedMesh;
  fishData: FishInstanceData[];
  grassInstanced: THREE.InstancedMesh;
  grassData: GrassInstanceData[];
  forestTrunks: THREE.InstancedMesh;
  forestConeCrowns: THREE.InstancedMesh;
  forestSphereCrowns: THREE.InstancedMesh;
  forestTreeMeta: ForestTreeMeta[];
  mistPoints: THREE.Points;
  particleGeo: THREE.BufferGeometry;
  particleMat: THREE.PointsMaterial;
  particleData: MistParticleData[];
  particleCount: number;
  fireflies: THREE.Points;
  fireflyGeo: THREE.BufferGeometry;
  fireflyMat: THREE.PointsMaterial;
  fireflyData: FireflyData[];
  fireflyCount: number;
  fgLeafMesh: THREE.Mesh;
  fgLeafMat: THREE.MeshStandardMaterial;
  currentEnv: EnvConfig;
}

interface DisposableResources {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
}

function trackGeo(resources: DisposableResources, geo: THREE.BufferGeometry): THREE.BufferGeometry {
  resources.geometries.push(geo);
  return geo;
}

function trackMat(resources: DisposableResources, mat: THREE.Material): THREE.Material {
  resources.materials.push(mat);
  return mat;
}

function trackTex(resources: DisposableResources, tex: THREE.Texture): THREE.Texture {
  resources.textures.push(tex);
  return tex;
}

// ─── Scene builder ───────────────────────────────────────────────────────────

export function buildHeroScene(
  scene: THREE.Scene,
  isMobile: boolean
): { refs: HeroSceneRefs; dispose: () => void } {
  const resources: DisposableResources = { geometries: [], materials: [], textures: [] };
  const textures = getProceduralTextures(isMobile);
  const dummy = new THREE.Object3D();

  // Fog
  const fog = new THREE.FogExp2(0x0a1f24, 0.015);
  scene.fog = fog;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0x9ee8ec, 0x3d8a7a, 0.55);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  sunLight.castShadow = false;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x8ac8d0, 0.25);
  fillLight.position.set(0, 3, -8);
  scene.add(fillLight);

  // Sky
  const skyGeo = trackGeo(resources, new THREE.SphereGeometry(60, 32, 15));
  const skyMat = trackMat(
    resources,
    new THREE.ShaderMaterial({
      vertexShader: SKY_VERTEX,
      fragmentShader: SKY_FRAGMENT,
      uniforms: {
        uColorTop: { value: new THREE.Color() },
        uColorBottom: { value: new THREE.Color() },
        uSunDirection: { value: new THREE.Vector3() },
        uSunColor: { value: new THREE.Color() },
        uSunSize: { value: 0.035 },
        uTime: { value: 0.0 },
        uGoldenHourBoost: { value: 0.0 },
        uIsNight: { value: 0.0 },
        uWindX: { value: 1.0 },
        uMobile: { value: isMobile ? 1.0 : 0.0 },
      },
      side: THREE.BackSide,
      depthWrite: false,
    })
  ) as THREE.ShaderMaterial;
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyMesh);

  // Celestial bodies
  const sunGlowTex = trackTex(resources, textures.sunGlow);
  const moonGlowTex = trackTex(resources, textures.moonGlow);

  const sunOrbGeo = trackGeo(resources, new THREE.SphereGeometry(1.2, 16, 16));
  const sunOrbMat = trackMat(
    resources,
    new THREE.MeshBasicMaterial({ color: 0xfff5d0, fog: false })
  ) as THREE.MeshBasicMaterial;
  const sunOrb = new THREE.Mesh(sunOrbGeo, sunOrbMat);
  const sunGlowSprite = new THREE.Sprite(
    trackMat(
      resources,
      new THREE.SpriteMaterial({
        map: sunGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      })
    ) as THREE.SpriteMaterial
  );
  sunGlowSprite.scale.set(12, 12, 1);
  sunOrb.add(sunGlowSprite);
  scene.add(sunOrb);

  const moonOrbGeo = trackGeo(resources, new THREE.SphereGeometry(0.6, 16, 16));
  const moonOrbMat = trackMat(
    resources,
    new THREE.MeshBasicMaterial({ color: 0xd8d4cc, fog: false })
  );
  const moonOrb = new THREE.Mesh(moonOrbGeo, moonOrbMat);
  const moonGlowSprite = new THREE.Sprite(
    trackMat(
      resources,
      new THREE.SpriteMaterial({
        map: moonGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      })
    ) as THREE.SpriteMaterial
  );
  moonGlowSprite.scale.set(5, 5, 1);
  moonOrb.add(moonGlowSprite);
  scene.add(moonOrb);

  // Clouds
  const cloudMat = trackMat(
    resources,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      fog: false,
    })
  ) as THREE.MeshBasicMaterial;

  const cloudsData: CloudData[] = [];
  const cloudCount = isMobile ? 5 : 10;

  const createCloudCluster = (scale: number): THREE.Group => {
    const cloud = new THREE.Group();
    const puffCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < puffCount; i++) {
      const r = 0.4 + Math.random() * 0.6;
      const geo = trackGeo(resources, new THREE.IcosahedronGeometry(r, 1));
      const puff = new THREE.Mesh(geo, cloudMat);
      puff.position.set(
        (Math.random() - 0.5) * 3.0,
        (Math.random() - 0.3) * 0.8,
        (Math.random() - 0.5) * 1.5
      );
      puff.scale.set(
        0.8 + Math.random() * 0.4,
        0.5 + Math.random() * 0.3,
        0.7 + Math.random() * 0.3
      );
      cloud.add(puff);
    }
    cloud.scale.setScalar(scale);
    return cloud;
  };

  for (let i = 0; i < cloudCount; i++) {
    const cx = -20 + Math.random() * 40;
    const cy = 12 + Math.random() * 18;
    const cz = -25 + Math.random() * 15;
    const cScale = 1.5 + Math.random() * 2.5;
    const cloudGroup = createCloudCluster(cScale);
    cloudGroup.position.set(cx, cy, cz);
    cloudGroup.rotation.y = Math.random() * Math.PI;
    scene.add(cloudGroup);
    cloudsData.push({ group: cloudGroup, baseX: cx, baseY: cy, baseZ: cz, speed: 0.002 + Math.random() * 0.004 });
  }

  // Materials
  const woodTexture = trackTex(resources, textures.wood);
  const concreteTexture = trackTex(resources, textures.concrete);
  const leafTexture = trackTex(resources, textures.palmLeaf);
  const roadTexture = trackTex(resources, textures.road);
  const barkTexture = trackTex(resources, textures.bark);

  const concreteMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({ map: concreteTexture, roughness: 0.72, metalness: 0.12 })
  );

  const leafMaterial = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      map: leafTexture,
      color: 0x5aaa78,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      roughness: 0.75,
    })
  );

  const leafGeo = trackGeo(resources, new THREE.PlaneGeometry(0.7, 1.8));
  leafGeo.translate(0, 0.9, 0);

  // Water
  const waterSeg = isMobile ? 80 : 108;
  const waterGeo = trackGeo(resources, new THREE.PlaneGeometry(20, 24, waterSeg, waterSeg));
  const waterUniforms: WaterUniforms = {
    uTime: { value: 0 },
    uWaveSpeed: { value: 0.2 },
    uWaveAmplitude: { value: 0.045 },
    uWaterColor: { value: new THREE.Color(0x35a8ac) },
    uWaterSpecularColor: { value: new THREE.Color(0xfff) },
    uSkyTop: { value: new THREE.Color(0x2e9b9e) },
    uSkyBottom: { value: new THREE.Color(0xfff5e8) },
    uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
    uSunIntensity: { value: 1.0 },
    uScrollProgress: { value: 0.0 },
    uShoreWorldZ: { value: SHORE_WORLD_Z },
    uLakeCenter: { value: LAKE_CENTER.clone() },
    uLakeRadius: { value: LAKE_RADIUS },
    uLanternViewPosition: { value: new THREE.Vector3(0, 0, 0) },
    uLanternPlanePos: { value: new THREE.Vector2(0, 0) },
    uLanternColor: { value: new THREE.Color(0xffb04d) },
    uLanternIntensity: { value: 0.0 },
    uMobile: { value: isMobile ? 1.0 : 0.0 },
  };

  const waterMat = trackMat(
    resources,
    new THREE.ShaderMaterial({
      vertexShader: WATER_VERTEX,
      fragmentShader: WATER_FRAGMENT,
      uniforms: waterUniforms as unknown as { [uniform: string]: THREE.IUniform },
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(-0.5, WATER_Y, -8);
  scene.add(waterMesh);

  // Villa ground
  const villaGroundGeo = trackGeo(resources, new THREE.PlaneGeometry(12, 10));
  const villaGroundMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.94 })
  );
  const villaGroundMesh = new THREE.Mesh(villaGroundGeo, villaGroundMat);
  villaGroundMesh.rotation.x = -Math.PI / 2;
  villaGroundMesh.position.set(5, GROUND_Y, 4);
  scene.add(villaGroundMesh);

  // Road — CatmullRom tube, gentle east-west curve
  const roadMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      map: roadTexture,
      color: 0x5a5550,
      roughness: 0.96,
    })
  );
  const roadCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-12, 0, 0.35),
    new THREE.Vector3(-5, 0, 0.12),
    new THREE.Vector3(0, 0, 0.2),
    new THREE.Vector3(5, 0, 0.08),
    new THREE.Vector3(12, 0, 0.28),
  ]);
  const roadGeo = trackGeo(resources, new THREE.TubeGeometry(roadCurve, 64, 1.4, 8, false));
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.position.y = ROAD_Y;
  scene.add(roadMesh);

  const curbGeo = trackGeo(resources, new THREE.BoxGeometry(24, 0.06, 0.12));
  const curbMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x8a8880, roughness: 0.8 }));
  const curbNear = new THREE.Mesh(curbGeo, curbMat);
  curbNear.position.set(0, ROAD_Y + 0.02, 1.55);
  scene.add(curbNear);
  const curbFar = new THREE.Mesh(curbGeo, curbMat);
  curbFar.position.set(0, ROAD_Y + 0.02, -1.15);
  scene.add(curbFar);

  // Grass strip
  const grassStripSeg = 40;
  const grassStripGeo = trackGeo(resources, new THREE.PlaneGeometry(22, 3.5, grassStripSeg, grassStripSeg));
  grassStripGeo.rotateX(-Math.PI / 2);
  const gsPositions = grassStripGeo.attributes.position;
  for (let i = 0; i < gsPositions.count; i++) {
    const z = gsPositions.getZ(i);
    const x = gsPositions.getX(i);
    const t = (z + 1.75) / 3.5;
    const slopeY = THREE.MathUtils.lerp(WATER_Y + 0.08, ROAD_Y - 0.02, t * t);
    const noise = Math.sin(x * 1.8 + z * 2.3) * 0.02 + Math.cos(x * 3.1) * 0.01;
    gsPositions.setY(i, slopeY + noise);
  }
  grassStripGeo.computeVertexNormals();
  const grassStripMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x5e9a4e, roughness: 0.92 }));
  const grassStripMesh = new THREE.Mesh(grassStripGeo, grassStripMat);
  grassStripMesh.position.set(0, 0, -3.0);
  scene.add(grassStripMesh);

  // Lake field — 85° rotation
  const lakeFieldGeo = trackGeo(resources, new THREE.PlaneGeometry(5, 7, 10, 14));
  lakeFieldGeo.rotateX(-Math.PI / 2);
  const lfPositions = lakeFieldGeo.attributes.position;
  for (let i = 0; i < lfPositions.count; i++) {
    const localZ = lfPositions.getZ(i);
    const t = (localZ + 3.5) / 7.0;
    const slopeY = THREE.MathUtils.lerp(WATER_Y + 0.12, ROAD_Y - 0.01, t * t);
    const nx = lfPositions.getX(i);
    const noise = Math.sin(nx * 2.0 + localZ * 1.5) * 0.015;
    lfPositions.setY(i, slopeY + noise);
  }
  lakeFieldGeo.computeVertexNormals();
  const lakeFieldMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x6aaa5a, roughness: 0.9 }));
  const lakeFieldMesh = new THREE.Mesh(lakeFieldGeo, lakeFieldMat);
  lakeFieldMesh.rotation.y = LAKE_FIELD_ROTATION_Y;
  lakeFieldMesh.position.set(-5.8, 0, -2.8);
  scene.add(lakeFieldMesh);

  // Far shore landscape
  const landscapeGroup = new THREE.Group();
  scene.add(landscapeGroup);

  const shoreWedgeGeo = trackGeo(resources, new THREE.PlaneGeometry(42, 6, 28, 8));
  shoreWedgeGeo.rotateX(-Math.PI / 2);
  const swPos = shoreWedgeGeo.attributes.position;
  for (let i = 0; i < swPos.count; i++) {
    const x = swPos.getX(i);
    const localZ = swPos.getZ(i);
    const worldZ = -17 + localZ;
    const t = THREE.MathUtils.clamp((localZ + 3) / 6, 0, 1);
    const y = THREE.MathUtils.lerp(WATER_Y + 0.1, getTerrainHeight(x, worldZ), t * t);
    swPos.setY(i, y);
  }
  shoreWedgeGeo.computeVertexNormals();
  const shoreWedgeMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x4a7a52, roughness: 0.94 }));
  const shoreWedgeMesh = new THREE.Mesh(shoreWedgeGeo, shoreWedgeMat);
  shoreWedgeMesh.position.set(0, 0, -17);
  landscapeGroup.add(shoreWedgeMesh);

  const farTerrainGeo = trackGeo(resources, new THREE.PlaneGeometry(50, 16, 40, 20));
  farTerrainGeo.rotateX(-Math.PI / 2);
  const ftPositions = farTerrainGeo.attributes.position;
  for (let i = 0; i < ftPositions.count; i++) {
    const x = ftPositions.getX(i);
    const localZ = ftPositions.getZ(i);
    const worldZ = -28 + localZ;
    ftPositions.setY(i, getTerrainHeight(x, worldZ));
  }
  farTerrainGeo.computeVertexNormals();
  const farTerrainMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({ color: 0x3d5a42, roughness: 0.95, metalness: 0.02 })
  );
  const farTerrainMesh = new THREE.Mesh(farTerrainGeo, farTerrainMat);
  farTerrainMesh.position.set(0, 0, -28);
  landscapeGroup.add(farTerrainMesh);

  const mtnMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x4a6a62, roughness: 0.95 }));
  const mountainGeo1 = trackGeo(resources, new THREE.ConeGeometry(6.5, 5.5, 10));
  const mountain1 = new THREE.Mesh(mountainGeo1, mtnMat);
  const m1z = -28;
  const m1x = -7;
  mountain1.position.set(m1x, getTerrainHeight(m1x, m1z) + 2.75, m1z);
  landscapeGroup.add(mountain1);

  const mtnMat2 = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x3d5e55, roughness: 0.92 }));
  const mountainGeo2 = trackGeo(resources, new THREE.ConeGeometry(5.0, 4.2, 10));
  const mountain2 = new THREE.Mesh(mountainGeo2, mtnMat2);
  const m2z = -30;
  const m2x = 5;
  mountain2.position.set(m2x, getTerrainHeight(m2x, m2z) + 2.1, m2z);
  landscapeGroup.add(mountain2);

  const mountainGeo3 = trackGeo(resources, new THREE.ConeGeometry(4.0, 3.5, 8));
  const mountain3 = new THREE.Mesh(mountainGeo3, mtnMat);
  const m3z = -32;
  const m3x = 0;
  mountain3.position.set(m3x, getTerrainHeight(m3x, m3z) + 1.75, m3z);
  landscapeGroup.add(mountain3);

  // Forest — InstancedMesh (trunk, cone crown, sphere crown)
  const forestCount = isMobile ? 80 : 200;
  const forestTrunkMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({ map: barkTexture, color: 0x3d4a32, roughness: 0.9 })
  );
  const forestCrownMats = [
    trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x2d6a48, roughness: 0.85 })),
    trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x357a52, roughness: 0.82 })),
    trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x2a5e3e, roughness: 0.88 })),
  ];
  const forestTrunkGeo = trackGeo(resources, new THREE.CylinderGeometry(0.05, 0.12, 1.4, 6));
  const forestCrownGeo = trackGeo(resources, new THREE.ConeGeometry(0.65, 1.0, 7));
  const forestSphereGeo = trackGeo(resources, new THREE.IcosahedronGeometry(0.55, 1));

  const forestTrunks = new THREE.InstancedMesh(forestTrunkGeo, forestTrunkMat, forestCount);
  const forestConeCrowns = new THREE.InstancedMesh(forestCrownGeo, forestCrownMats[0], forestCount);
  const forestSphereCrowns = new THREE.InstancedMesh(forestSphereGeo, forestCrownMats[1], forestCount);
  const forestTreeMeta: ForestTreeMeta[] = [];

  for (let f = 0; f < forestCount; f++) {
    const tx = -14 + Math.random() * 28;
    const tz = -20 - Math.random() * 6;
    const treeHeight = 0.8 + Math.random() * 1.2;
    const treeY = getTerrainHeight(tx, tz);
    const leanZ = (Math.random() - 0.5) * 0.08;
    const isConifer = Math.random() > 0.4;
    const matIdx = f % 3;

    forestTreeMeta.push({ isConifer, matIdx, treeHeight, leanZ });

    dummy.position.set(tx, treeY - 0.05, tz);
    dummy.rotation.set(0, 0, leanZ);
    dummy.scale.set(1, treeHeight, 1);
    dummy.updateMatrix();
    forestTrunks.setMatrixAt(f, dummy.matrix);

    if (isConifer) {
      dummy.position.set(tx, treeY + 1.3 * treeHeight, tz);
      dummy.rotation.set(0, 0, leanZ);
      dummy.scale.set(treeHeight, treeHeight, treeHeight);
      dummy.updateMatrix();
      forestConeCrowns.setMatrixAt(f, dummy.matrix);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      forestSphereCrowns.setMatrixAt(f, dummy.matrix);
    } else {
      dummy.position.set(tx, treeY + 1.5 * treeHeight, tz);
      dummy.rotation.set(0, 0, leanZ);
      dummy.scale.set(1.1 * treeHeight, 0.8 * treeHeight, 1.1 * treeHeight);
      dummy.updateMatrix();
      forestSphereCrowns.setMatrixAt(f, dummy.matrix);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      forestConeCrowns.setMatrixAt(f, dummy.matrix);
    }
  }
  forestTrunks.instanceMatrix.needsUpdate = true;
  forestConeCrowns.instanceMatrix.needsUpdate = true;
  forestSphereCrowns.instanceMatrix.needsUpdate = true;
  landscapeGroup.add(forestTrunks, forestConeCrowns, forestSphereCrowns);

  // Bushes — InstancedMesh
  const bushCount = 18;
  const bushGeo = trackGeo(resources, new THREE.IcosahedronGeometry(0.25, 1));
  const bushMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x4a8a52, roughness: 0.9 }));
  const bushesInstanced = new THREE.InstancedMesh(bushGeo, bushMat, bushCount);
  for (let b = 0; b < bushCount; b++) {
    const bx = -8 + Math.random() * 16;
    const bz = -2.5 - Math.random() * 2;
    const t = Math.max(0, Math.min(1, (-bz - 2.5) / 2.0));
    const by = THREE.MathUtils.lerp(ROAD_Y, WATER_Y + 0.15, t);
    dummy.position.set(bx, by + 0.1, bz);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.scale.set(
      0.7 + Math.random() * 0.6,
      0.5 + Math.random() * 0.4,
      0.7 + Math.random() * 0.6
    );
    dummy.updateMatrix();
    bushesInstanced.setMatrixAt(b, dummy.matrix);
  }
  bushesInstanced.instanceMatrix.needsUpdate = true;
  scene.add(bushesInstanced);

  // Reeds — InstancedMesh
  const reedCount = 30;
  const reedMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({ color: 0x5cb87a, side: THREE.DoubleSide, roughness: 0.9 })
  );
  const reedGeo = trackGeo(resources, new THREE.PlaneGeometry(0.05, 0.75));
  const reedsInstanced = new THREE.InstancedMesh(reedGeo, reedMat, reedCount);
  const reedsData: ReedInstanceData[] = [];
  for (let r = 0; r < reedCount; r++) {
    const rx = -6 + r * 0.6 + (Math.random() - 0.5) * 0.3;
    const ry = WATER_Y + 0.2 + Math.random() * 0.1;
    const rz = -4.8 - Math.random() * 1.5;
    const baseRotZ = (Math.random() - 0.5) * 0.12;
    const baseRotY = (Math.random() - 0.5) * 0.4;
    const phase = Math.random() * Math.PI * 2;
    dummy.position.set(rx, ry, rz);
    dummy.rotation.set(0, baseRotY, baseRotZ);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    reedsInstanced.setMatrixAt(r, dummy.matrix);
    reedsData.push({ index: r, baseRotZ, baseRotY, phase, x: rx, y: ry, z: rz });
  }
  reedsInstanced.instanceMatrix.needsUpdate = true;
  scene.add(reedsInstanced);

  // Rocks — merged single mesh
  const rockMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x5a7a72, roughness: 0.82 }));
  const rockBaseGeo = trackGeo(resources, new THREE.DodecahedronGeometry(1, 0));
  const rockPositions: [number, number, number, number, number, number][] = [
    [-4.5, WATER_Y + 0.05, -5.0, 0.5, 0.6, 0.5],
    [2.5, WATER_Y + 0.03, -5.5, 0.4, 0.5, 0.4],
    [6.0, WATER_Y + 0.04, -4.8, 0.35, 0.45, 0.35],
    [-1.0, WATER_Y + 0.02, -5.8, 0.6, 0.4, 0.55],
    [-7.5, WATER_Y + 0.06, -4.5, 0.45, 0.5, 0.4],
  ];
  const rockGeos: THREE.BufferGeometry[] = [];
  rockPositions.forEach(([rx, ry, rz, sx, sy, sz]) => {
    const g = rockBaseGeo.clone();
    g.scale(sx, sy, sz);
    dummy.position.set(rx, ry, rz);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    g.applyMatrix4(dummy.matrix);
    rockGeos.push(g);
    resources.geometries.push(g);
  });
  const mergedRockGeo = trackGeo(resources, mergeGeometries(rockGeos, false)!);
  const rocksMesh = new THREE.Mesh(mergedRockGeo, rockMat);
  scene.add(rocksMesh);

  // Villa
  const villaGroup = new THREE.Group();
  villaGroup.position.set(6, GROUND_Y + 0.88, 3.5);
  villaGroup.rotation.y = -0.15;
  scene.add(villaGroup);

  const wallMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0xf2ebe0, roughness: 0.82 }));
  const roofMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x4a5c62, roughness: 0.75 }));
  const windowMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0x8ec2d0,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.65,
    })
  ) as THREE.MeshStandardMaterial;
  const windowFrameMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0x6a5d54,
      roughness: 0.35,
      metalness: 0.45,
      transparent: true,
      opacity: 0.85,
    })
  );

  const addBox = (w: number, h: number, d: number, mat: THREE.Material, px: number, py: number, pz: number) => {
    const geo = trackGeo(resources, new THREE.BoxGeometry(w, h, d));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    villaGroup.add(mesh);
    return mesh;
  };

  addBox(3.6, 0.1, 5.0, concreteMat, 0, -1.15, 0);
  addBox(3.6, 1.1, 0.1, wallMat, 0, -0.6, 2.45);
  addBox(0.1, 1.1, 5.0, wallMat, -1.75, -0.6, 0);
  addBox(0.1, 1.1, 5.0, wallMat, 1.75, -0.6, 0);
  addBox(3.8, 0.1, 5.2, concreteMat, 0, 0.05, 0);
  addBox(3.8, 1.5, 0.1, wallMat, 0, 0.85, 2.55);
  addBox(0.1, 1.5, 5.2, wallMat, -1.85, 0.85, 0);
  addBox(0.1, 1.5, 5.2, wallMat, 1.85, 0.85, 0);

  const glassFacadeMat = trackMat(
    resources,
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      roughness: 0.02,
      metalness: 0.05,
      transmission: 0.96,
      thickness: 0.01,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  addBox(3.8, 1.5, 0.02, glassFacadeMat, 0, 0.85, -2.55);

  const mullionGeo = trackGeo(resources, new THREE.BoxGeometry(0.018, 1.5, 0.012));
  for (let m = 0; m < 4; m++) {
    const mullion = new THREE.Mesh(mullionGeo, windowFrameMat);
    mullion.position.set(-1.8 + m * 1.2, 0.85, -2.54);
    villaGroup.add(mullion);
  }

  addBox(4.2, 0.18, 5.6, roofMat, 0, 1.72, 0);

  const balconyMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      map: concreteTexture,
      color: 0xd8d2c8,
      roughness: 0.78,
      transparent: true,
      opacity: 0.92,
    })
  );
  addBox(3.9, 0.04, 1.0, balconyMat, 0, 0.12, -2.75);

  const railMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({ color: 0x3a4a4e, roughness: 0.3, metalness: 0.8 })
  );
  addBox(3.9, 0.4, 0.03, railMat, 0, 0.38, -3.32);

  const postGeo = trackGeo(resources, new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6));
  for (let p = 0; p < 8; p++) {
    const post = new THREE.Mesh(postGeo, railMat);
    post.position.set(-1.7 + p * 0.49, 0.36, -3.32);
    villaGroup.add(post);
  }

  const windowGeo = trackGeo(resources, new THREE.PlaneGeometry(0.75, 0.6));
  const winFrameGeo = trackGeo(resources, new THREE.BoxGeometry(0.82, 0.67, 0.012));
  for (let wn = 0; wn < 2; wn++) {
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(-0.6 + wn * 1.2, -0.35, -2.48);
    villaGroup.add(win);
    const frame = new THREE.Mesh(winFrameGeo, windowFrameMat);
    frame.position.set(-0.6 + wn * 1.2, -0.35, -2.475);
    villaGroup.add(frame);
  }

  const doorGeo = trackGeo(resources, new THREE.PlaneGeometry(0.6, 1.1));
  const doorMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x3d2e22, roughness: 0.7 }));
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0.6, -0.6, -2.48);
  villaGroup.add(door);

  const pillarGeo = trackGeo(resources, new THREE.CylinderGeometry(0.04, 0.06, 1.6, 8));
  const pillarMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.6 }));
  [-1.6, -0.5, 0.5, 1.6].forEach((px) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, -0.4, -2.95);
    villaGroup.add(pillar);
  });

  const porchRoofMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0x4a5c62,
      roughness: 0.75,
      transparent: true,
      opacity: 0.55,
    })
  );
  addBox(3.6, 0.03, 0.55, porchRoofMat, 0, 0.58, -2.88);

  const chimneyMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x6a5a50, roughness: 0.85 }));
  addBox(0.35, 0.8, 0.35, chimneyMat, 1.3, 2.1, 1.2);

  const interiorGroup = new THREE.Group();
  villaGroup.add(interiorGroup);

  const fabricMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0xdfdcd6, roughness: 0.85 }));
  const woodTrimMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x4a3c31, roughness: 0.6 }));

  addBox(2.0, 0.2, 0.75, fabricMat, -0.3, 0.15, 1.1);
  addBox(2.0, 0.5, 0.18, fabricMat, -0.3, 0.45, 1.48);
  addBox(0.18, 0.45, 0.75, fabricMat, -1.3, 0.28, 1.1);
  addBox(0.18, 0.45, 0.75, fabricMat, 0.7, 0.28, 1.1);

  const glassTableMat = trackMat(
    resources,
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6,
      thickness: 0.05,
    })
  );
  addBox(0.9, 0.03, 0.5, glassTableMat, -0.3, 0.18, 0.4);

  const legGeo = trackGeo(resources, new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6));
  [
    [-0.72, 0.09, 0.18],
    [0.12, 0.09, 0.18],
    [-0.72, 0.09, 0.62],
    [0.12, 0.09, 0.62],
  ].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, woodTrimMat);
    leg.position.set(lx, ly, lz);
    interiorGroup.add(leg);
  });

  const cordGeo = trackGeo(resources, new THREE.CylinderGeometry(0.006, 0.006, 0.65, 6));
  const cordMat = trackMat(resources, new THREE.MeshBasicMaterial({ color: 0x111111 }));
  const bulbGeoInt = trackGeo(resources, new THREE.SphereGeometry(0.05, 8, 8));
  const bulbMatInt = trackMat(resources, new THREE.MeshBasicMaterial({ color: 0xffe0a0 }));

  const cord1 = new THREE.Mesh(cordGeo, cordMat);
  cord1.position.set(-0.5, 1.32, 0.4);
  interiorGroup.add(cord1);
  const bulb1 = new THREE.Mesh(bulbGeoInt, bulbMatInt);
  bulb1.position.set(-0.5, 0.95, 0.4);
  interiorGroup.add(bulb1);

  const cord2 = new THREE.Mesh(cordGeo, cordMat);
  cord2.position.set(0.3, 1.32, 0.4);
  interiorGroup.add(cord2);
  const bulb2 = new THREE.Mesh(bulbGeoInt, bulbMatInt);
  bulb2.position.set(0.3, 0.95, 0.4);
  interiorGroup.add(bulb2);

  const interiorLight = new THREE.PointLight(0xffa550, 0.8, 8.0);
  interiorLight.position.set(-0.1, 1.0, 0.6);
  interiorGroup.add(interiorLight);

  const potGeo = trackGeo(resources, new THREE.CylinderGeometry(0.14, 0.1, 0.28, 8));
  const pot = new THREE.Mesh(potGeo, concreteMat);
  pot.position.set(1.4, 0.19, 1.9);
  interiorGroup.add(pot);

  const plantStemGeo = trackGeo(resources, new THREE.CylinderGeometry(0.008, 0.015, 0.7, 6));
  const plantStem = new THREE.Mesh(plantStemGeo, woodTrimMat);
  plantStem.position.set(1.4, 0.45, 1.9);
  plantStem.rotation.z = -0.15;
  interiorGroup.add(plantStem);

  const plantLeaves = new THREE.Group();
  plantLeaves.position.set(1.35, 0.75, 1.9);
  for (let l = 0; l < 6; l++) {
    const leaf = new THREE.Mesh(leafGeo, leafMaterial);
    leaf.scale.setScalar(0.4);
    leaf.rotation.y = (l / 6) * Math.PI * 2;
    leaf.rotation.x = 0.6 + Math.random() * 0.3;
    plantLeaves.add(leaf);
  }
  interiorGroup.add(plantLeaves);

  addBox(0.55, 0.12, 0.55, fabricMat, 1.1, 0.14, 0.35);
  addBox(0.55, 0.45, 0.1, fabricMat, 1.1, 0.38, 0.58);

  const rugMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x8a7a68, roughness: 0.95 }));
  addBox(2.4, 0.02, 1.6, rugMat, -0.2, 0.08, 0.75);

  const sconceMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0xc9a55a,
      emissive: 0xffa040,
      emissiveIntensity: 0.35,
      metalness: 0.6,
      roughness: 0.3,
    })
  );
  addBox(0.08, 0.15, 0.06, sconceMat, -1.55, 1.05, -1.8);
  addBox(0.08, 0.15, 0.06, sconceMat, 1.55, 1.05, -1.8);

  const sconceLightL = new THREE.PointLight(0xffb060, 0.4, 4);
  sconceLightL.position.set(-1.55, 1.05, -1.6);
  interiorGroup.add(sconceLightL);
  const sconceLightR = new THREE.PointLight(0xffb060, 0.4, 4);
  sconceLightR.position.set(1.55, 1.05, -1.6);
  interiorGroup.add(sconceLightR);

  const bulbGeo = trackGeo(resources, new THREE.SphereGeometry(0.04, 8, 8));
  const bulbMat = trackMat(resources, new THREE.MeshBasicMaterial({ color: 0xffd090 }));
  const bulbSphere = new THREE.Mesh(bulbGeo, bulbMat);
  bulbSphere.position.set(0, 1.45, -2.8);
  villaGroup.add(bulbSphere);

  const warmLight = new THREE.PointLight(0xffa04d, 0, 14);
  warmLight.position.set(0, 1.4, -2.7);
  villaGroup.add(warmLight);

  const pathGeo = trackGeo(resources, new THREE.PlaneGeometry(0.8, 3.5));
  const pathMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.88 }));
  const gardenPath = new THREE.Mesh(pathGeo, pathMat);
  gardenPath.rotation.x = -Math.PI / 2;
  gardenPath.position.set(6.2, GROUND_Y + 0.01, 1.5);
  scene.add(gardenPath);

  // Foreground leaf (attached to camera in HeroWorld)
  const foregroundLeafGeo = trackGeo(resources, new THREE.PlaneGeometry(2.2, 4.4));
  foregroundLeafGeo.translate(0, 2.2, 0);
  const fgLeafMat = leafMaterial.clone() as THREE.MeshStandardMaterial;
  resources.materials.push(fgLeafMat);
  fgLeafMat.transparent = true;
  fgLeafMat.opacity = 0.28;
  const fgLeafMesh = new THREE.Mesh(foregroundLeafGeo, fgLeafMat);

  // Palms
  const palmsGroup = new THREE.Group();
  scene.add(palmsGroup);
  const trunkMaterial = trackMat(
    resources,
    new THREE.MeshStandardMaterial({ map: barkTexture, color: 0x4a6a52, roughness: 0.88 })
  );
  const trunkGeo = trackGeo(resources, new THREE.CylinderGeometry(0.015, 0.055, 4.0, 8));
  const palmsData: PalmData[] = [];

  for (let i = 0; i < 7; i++) {
    const palmTree = new THREE.Group();
    const x = -7.5 + i * 2.8 + (Math.random() - 0.5) * 0.8;
    const z = -2.1 - Math.random() * 2.4;
    const localZ = z - -3.0;
    const t = THREE.MathUtils.clamp((localZ + 1.75) / 3.5, 0, 1);
    const palmY = THREE.MathUtils.lerp(WATER_Y + 0.08, ROAD_Y - 0.02, t * t);
    palmTree.position.set(x, palmY, z);
    const leanZ = (Math.random() - 0.5) * 0.18 + (x < 0 ? -0.1 : 0.1);
    palmTree.rotation.z = leanZ;

    const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
    trunk.position.y = 2.0;
    palmTree.add(trunk);

    const leavesGroup = new THREE.Group();
    leavesGroup.position.y = 4.0;
    for (let j = 0; j < 10; j++) {
      const leafMesh = new THREE.Mesh(leafGeo, leafMaterial);
      const angle = (j / 10) * Math.PI * 2;
      leafMesh.rotation.y = angle;
      leafMesh.rotation.x = 0.52 + Math.random() * 0.14;
      leafMesh.rotation.z = (Math.random() - 0.5) * 0.1;
      leavesGroup.add(leafMesh);
    }
    palmTree.add(leavesGroup);
    palmsGroup.add(palmTree);
    palmsData.push({ group: palmTree, baseRotationZ: leanZ, index: i });
  }

  // Birds
  const birdBodyMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0x2a3840,
      roughness: 0.65,
      metalness: 0.08,
      transparent: true,
      opacity: 1,
    })
  ) as THREE.MeshStandardMaterial;
  const birdWingMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0x3d4f58,
      roughness: 0.55,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    })
  ) as THREE.MeshStandardMaterial;

  const birdsData: BirdData[] = [];
  const birdBodyGeo = trackGeo(resources, new THREE.SphereGeometry(0.09, 10, 8));
  birdBodyGeo.scale(1.6, 0.65, 2.8);
  const wingGeo = trackGeo(resources, new THREE.PlaneGeometry(0.62, 0.18));
  wingGeo.translate(-0.28, 0, 0);
  const headGeo = trackGeo(resources, new THREE.SphereGeometry(0.045, 8, 8));
  const beakGeo = trackGeo(resources, new THREE.ConeGeometry(0.018, 0.1, 5));
  beakGeo.rotateX(-Math.PI / 2);
  const beakMat = trackMat(resources, new THREE.MeshStandardMaterial({ color: 0xc9a55a, roughness: 0.4 }));

  for (let i = 0; i < 5; i++) {
    const birdGroup = new THREE.Group();
    birdGroup.add(new THREE.Mesh(birdBodyGeo, birdBodyMat));
    const head = new THREE.Mesh(headGeo, birdBodyMat);
    head.position.set(0.17, 0.04, 0);
    birdGroup.add(head);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.position.set(0.26, 0.02, 0);
    birdGroup.add(beak);
    const wingL = new THREE.Mesh(wingGeo, birdWingMat);
    wingL.position.set(-0.02, 0.06, 0);
    birdGroup.add(wingL);
    const wingR = new THREE.Mesh(wingGeo, birdWingMat);
    wingR.scale.x = -1;
    wingR.position.set(0.02, 0.06, 0);
    birdGroup.add(wingR);

    const birdY = 3.0 + Math.random() * 2.5;
    birdGroup.position.set(-6 + i * 3.5, birdY, -9 - Math.random() * 2);
    birdGroup.scale.setScalar(1.0 + Math.random() * 0.4);
    scene.add(birdGroup);
    birdsData.push({
      group: birdGroup,
      wingL,
      wingR,
      speed: 4.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI,
      radius: 3.5 + Math.random() * 4.0,
      baseX: -6 + i * 3.5,
      baseY: birdY,
    });
  }

  // Lily pads
  const padsGroup = new THREE.Group();
  scene.add(padsGroup);
  const padGeometry = trackGeo(resources, new THREE.CylinderGeometry(0.18, 0.18, 0.01, 12));
  const padMaterial = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0xa8ddb8,
      roughness: 0.7,
      emissive: 0x1a4a38,
      emissiveIntensity: 0.15,
    })
  );
  const lotusMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0xf4b8c8,
      emissive: 0x6a2848,
      emissiveIntensity: 0.25,
      roughness: 0.65,
    })
  );
  const lotusGeo = trackGeo(resources, new THREE.CylinderGeometry(0.035, 0.045, 0.025, 8));
  const lotusCenterMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0xffe8a0,
      emissive: 0x8a6020,
      emissiveIntensity: 0.3,
    })
  );
  const lotusCenterGeo = trackGeo(resources, new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6));
  const lotusLeafGeo = trackGeo(resources, new THREE.CylinderGeometry(0.22, 0.22, 0.012, 14));
  const lotusLeafMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({ color: 0x4a9a68, roughness: 0.72, side: THREE.DoubleSide })
  );

  const padData: PadData[] = [];
  for (let i = 0; i < 28; i++) {
    const x = -4 + Math.random() * 8;
    const z = -6 - Math.random() * 6;
    const scale = 0.55 + Math.random() * 0.75;
    const mesh = new THREE.Mesh(
      Math.random() > 0.35 ? padGeometry : lotusLeafGeo,
      Math.random() > 0.35 ? padMaterial : lotusLeafMat
    );
    mesh.scale.set(scale, 1, scale);
    mesh.rotation.y = Math.random() * Math.PI;
    padsGroup.add(mesh);

    let lotusGroup: THREE.Group | undefined;
    if (i % 2 === 0) {
      lotusGroup = new THREE.Group();
      const bloom = new THREE.Mesh(lotusGeo, lotusMat);
      bloom.position.y = 0.02;
      lotusGroup.add(bloom);
      const center = new THREE.Mesh(lotusCenterGeo, lotusCenterMat);
      center.position.y = 0.035;
      lotusGroup.add(center);
      lotusGroup.scale.setScalar(scale);
      padsGroup.add(lotusGroup);
    }
    padData.push({ mesh, lotus: lotusGroup, x, z, phase: Math.random() * Math.PI * 2, scale });
  }

  // Fish — InstancedMesh
  const fishCount = 14;
  const fishGeo = trackGeo(resources, new THREE.SphereGeometry(0.05, 6, 4));
  fishGeo.scale(1.2, 0.45, 2.2);
  const fishMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0xffa040,
      emissive: 0x442200,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.82,
      roughness: 0.4,
    })
  );
  const fishInstanced = new THREE.InstancedMesh(fishGeo, fishMat, fishCount);
  const fishData: FishInstanceData[] = [];
  for (let i = 0; i < fishCount; i++) {
    const fx = -3 + Math.random() * 7;
    const fz = -7 - Math.random() * 5;
    dummy.position.set(fx, WATER_Y - 0.06, fz);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    fishInstanced.setMatrixAt(i, dummy.matrix);
    fishData.push({
      index: i,
      x: fx,
      z: fz,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.5,
      radius: 0.4 + Math.random() * 0.8,
    });
  }
  fishInstanced.instanceMatrix.needsUpdate = true;
  scene.add(fishInstanced);

  // Grass blades — InstancedMesh with wind data
  const grassCount = isMobile ? 200 : 500;
  const grassBladeGeo = trackGeo(resources, new THREE.PlaneGeometry(0.03, 0.2));
  grassBladeGeo.translate(0, 0.1, 0);
  const grassBladeMat = trackMat(
    resources,
    new THREE.MeshStandardMaterial({
      color: 0x5a9a4e,
      side: THREE.DoubleSide,
      roughness: 0.92,
    })
  );
  const grassInstanced = new THREE.InstancedMesh(grassBladeGeo, grassBladeMat, grassCount);
  const grassData: GrassInstanceData[] = [];
  for (let i = 0; i < grassCount; i++) {
    const gx = -10 + Math.random() * 22;
    const gz = -1.5 - Math.random() * 3.5;
    const slopeT = Math.max(0, Math.min(1, (-gz - 1.5) / 3.5));
    const gy = THREE.MathUtils.lerp(ROAD_Y - 0.02, WATER_Y + 0.12, slopeT * slopeT);
    const baseRotY = Math.random() * Math.PI;
    const baseRotZ = (Math.random() - 0.5) * 0.35;
    const scaleX = 0.7 + Math.random() * 0.5;
    const scaleY = 0.5 + Math.random() * 1.0;
    dummy.position.set(gx, gy, gz);
    dummy.rotation.set(0, baseRotY, baseRotZ);
    dummy.scale.set(scaleX, scaleY, 1);
    dummy.updateMatrix();
    grassInstanced.setMatrixAt(i, dummy.matrix);
    grassData.push({ index: i, baseRotY, baseRotZ, x: gx, y: gy, z: gz, scaleX, scaleY });
  }
  grassInstanced.instanceMatrix.needsUpdate = true;
  scene.add(grassInstanced);

  // Mist
  const mistTexture = trackTex(
    resources,
    (() => {
      const c = document.createElement("canvas");
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
        grad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(c);
    })()
  );

  const particleCount = isMobile ? 40 : 100;
  const particleGeo = trackGeo(resources, new THREE.BufferGeometry());
  const particlePositions = new Float32Array(particleCount * 3);
  const particleData: MistParticleData[] = [];
  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 20;
    const y = WATER_Y + 0.2 + Math.random() * 0.6;
    const z = -5.0 - Math.random() * 10.0;
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
    particleData.push({
      index: i,
      speedX: (Math.random() - 0.5) * 0.002,
      speedZ: (Math.random() - 0.5) * 0.001,
      limitX: 4 + Math.random() * 4,
      originX: x,
    });
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = trackMat(
    resources,
    new THREE.PointsMaterial({
      size: 2.8,
      map: mistTexture,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  ) as THREE.PointsMaterial;
  const mistPoints = new THREE.Points(particleGeo, particleMat);
  scene.add(mistPoints);

  // Fireflies
  const fireflyCount = isMobile ? 15 : 30;
  const fireflyGeo = trackGeo(resources, new THREE.BufferGeometry());
  const fireflyPositions = new Float32Array(fireflyCount * 3);
  const fireflyData: FireflyData[] = [];
  for (let i = 0; i < fireflyCount; i++) {
    const fx = (Math.random() - 0.5) * 12.0;
    const fy = WATER_Y + 0.15 + Math.random() * 0.5;
    const fz = -3.0 - Math.random() * 8.0;
    fireflyPositions[i * 3] = fx;
    fireflyPositions[i * 3 + 1] = fy;
    fireflyPositions[i * 3 + 2] = fz;
    fireflyData.push({ y: fy, phase: Math.random() * Math.PI * 2, speed: 0.6 + Math.random() * 0.6 });
  }
  fireflyGeo.setAttribute("position", new THREE.BufferAttribute(fireflyPositions, 3));
  const fireflyTexture = trackTex(
    resources,
    (() => {
      const c = document.createElement("canvas");
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, "rgba(255, 185, 91, 0.95)");
        grad.addColorStop(0.4, "rgba(255, 185, 91, 0.3)");
        grad.addColorStop(1, "rgba(255, 185, 91, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(c);
    })()
  );
  const fireflyMat = trackMat(
    resources,
    new THREE.PointsMaterial({
      size: 0.35,
      map: fireflyTexture,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  ) as THREE.PointsMaterial;
  const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
  scene.add(fireflies);

  const currentEnv = createEnvConfig();

  const refs: HeroSceneRefs = {
    fog,
    ambientLight,
    hemiLight,
    sunLight,
    fillLight,
    skyMesh,
    skyMat,
    sunOrb,
    sunOrbMat,
    sunGlowSprite,
    moonOrb,
    moonGlowSprite,
    cloudsData,
    cloudMat,
    waterMesh,
    waterUniforms,
    villaGroup,
    bulbSphere,
    warmLight,
    windowMat,
    interiorLight,
    palmsData,
    birdsData,
    birdBodyMat,
    birdWingMat,
    padData,
    reedsInstanced,
    reedsData,
    fishInstanced,
    fishData,
    grassInstanced,
    grassData,
    forestTrunks,
    forestConeCrowns,
    forestSphereCrowns,
    forestTreeMeta,
    mistPoints,
    particleGeo,
    particleMat,
    particleData,
    particleCount,
    fireflies,
    fireflyGeo,
    fireflyMat,
    fireflyData,
    fireflyCount,
    fgLeafMesh,
    fgLeafMat,
    currentEnv,
  };

  const dispose = () => {
    resources.geometries.forEach((g) => g.dispose());
    resources.materials.forEach((m) => m.dispose());
    resources.textures.forEach((t) => t.dispose());

    scene.remove(
      skyMesh,
      sunOrb,
      moonOrb,
      waterMesh,
      villaGroundMesh,
      roadMesh,
      curbNear,
      curbFar,
      grassStripMesh,
      lakeFieldMesh,
      landscapeGroup,
      bushesInstanced,
      reedsInstanced,
      rocksMesh,
      villaGroup,
      gardenPath,
      palmsGroup,
      padsGroup,
      fishInstanced,
      grassInstanced,
      mistPoints,
      fireflies
    );
    birdsData.forEach((b) => scene.remove(b.group));
    cloudsData.forEach((c) => scene.remove(c.group));

    scene.fog = null;
    scene.remove(ambientLight, hemiLight, sunLight, fillLight);
  };

  return { refs, dispose };
}
