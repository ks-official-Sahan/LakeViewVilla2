import * as THREE from "three";
import { hash01 } from "../flora/hash01";
import type { VillaBuildContext } from "./villaContext";

export function buildVillaInterior(villaGroup: THREE.Group, ctx: VillaBuildContext): THREE.Group {
  const { trackGeo, trackMat, trackTex, textures } = ctx;

  const concreteMat = trackMat(
    new THREE.MeshStandardMaterial({ map: textures.concrete, roughness: 0.72, metalness: 0.12 })
  );
  const leafTexture = trackTex(textures.palmLeaf);
  const leafMaterial = trackMat(
    new THREE.MeshStandardMaterial({
      map: leafTexture,
      color: 0x5aaa78,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      roughness: 0.75,
    })
  );
  const leafGeo = trackGeo(new THREE.PlaneGeometry(0.7, 1.8));
  leafGeo.translate(0, 0.9, 0);

  const interiorGroup = new THREE.Group();
  villaGroup.add(interiorGroup);

  const fabricMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xdfdcd6, roughness: 0.85 }));
  const woodTrimMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x4a3c31, roughness: 0.6 }));

  const addBox = (w: number, h: number, d: number, mat: THREE.Material, px: number, py: number, pz: number) => {
    const geo = trackGeo(new THREE.BoxGeometry(w, h, d));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    interiorGroup.add(mesh);
    return mesh;
  };

  addBox(2.0, 0.2, 0.75, fabricMat, -0.3, 0.15, 1.1);
  addBox(2.0, 0.5, 0.18, fabricMat, -0.3, 0.45, 1.48);
  addBox(0.18, 0.45, 0.75, fabricMat, -1.3, 0.28, 1.1);
  addBox(0.18, 0.45, 0.75, fabricMat, 0.7, 0.28, 1.1);

  const glassTableMat = trackMat(
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

  const legGeo = trackGeo(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6));
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

  const cordGeo = trackGeo(new THREE.CylinderGeometry(0.006, 0.006, 0.65, 6));
  const cordMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x111111 }));
  const bulbGeoInt = trackGeo(new THREE.SphereGeometry(0.05, 8, 8));
  const bulbMatInt = trackMat(new THREE.MeshBasicMaterial({ color: 0xffe0a0 }));

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

  const potGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.1, 0.28, 8));
  const pot = new THREE.Mesh(potGeo, concreteMat);
  pot.position.set(1.4, 0.19, 1.9);
  interiorGroup.add(pot);

  const plantStemGeo = trackGeo(new THREE.CylinderGeometry(0.008, 0.015, 0.7, 6));
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
    leaf.rotation.x = 0.6 + hash01(l + 11) * 0.3;
    plantLeaves.add(leaf);
  }
  interiorGroup.add(plantLeaves);

  addBox(0.55, 0.12, 0.55, fabricMat, 1.1, 0.14, 0.35);
  addBox(0.55, 0.45, 0.1, fabricMat, 1.1, 0.38, 0.58);

  const rugMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x8a7a68, roughness: 0.95 }));
  addBox(2.4, 0.02, 1.6, rugMat, -0.2, 0.08, 0.75);

  const sconceMat = trackMat(
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

  return interiorGroup;
}
