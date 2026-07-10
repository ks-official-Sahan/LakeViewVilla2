import * as THREE from "three";
import type { VillaBuildContext } from "./villaContext";

export interface VillaExteriorResult {
  windowMat: THREE.MeshStandardMaterial;
}

export function buildVillaExterior(
  villaGroup: THREE.Group,
  ctx: VillaBuildContext
): VillaExteriorResult {
  const { trackGeo, trackMat, trackTex, textures } = ctx;

  const concreteTexture = trackTex(textures.concrete);
  const concreteMat = trackMat(
    new THREE.MeshStandardMaterial({ map: concreteTexture, roughness: 0.72, metalness: 0.12 })
  );
  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf2ebe0, roughness: 0.82 })
  );
  const roofMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x4a5c62, roughness: 0.75 })
  );
  const windowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x8ec2d0,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.65,
    })
  ) as THREE.MeshStandardMaterial;
  const windowFrameMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x6a5d54,
      roughness: 0.35,
      metalness: 0.45,
      transparent: true,
      opacity: 0.85,
    })
  );

  const addBox = (w: number, h: number, d: number, mat: THREE.Material, px: number, py: number, pz: number) => {
    const geo = trackGeo(new THREE.BoxGeometry(w, h, d));
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

  const mullionGeo = trackGeo(new THREE.BoxGeometry(0.018, 1.5, 0.012));
  for (let m = 0; m < 4; m++) {
    const mullion = new THREE.Mesh(mullionGeo, windowFrameMat);
    mullion.position.set(-1.8 + m * 1.2, 0.85, -2.54);
    villaGroup.add(mullion);
  }

  addBox(4.2, 0.18, 5.6, roofMat, 0, 1.72, 0);

  const balconyMat = trackMat(
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
    new THREE.MeshStandardMaterial({ color: 0x3a4a4e, roughness: 0.3, metalness: 0.8 })
  );
  addBox(3.9, 0.4, 0.03, railMat, 0, 0.38, -3.32);

  const postGeo = trackGeo(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6));
  for (let p = 0; p < 8; p++) {
    const post = new THREE.Mesh(postGeo, railMat);
    post.position.set(-1.7 + p * 0.49, 0.36, -3.32);
    villaGroup.add(post);
  }

  const windowGeo = trackGeo(new THREE.PlaneGeometry(0.75, 0.6));
  const winFrameGeo = trackGeo(new THREE.BoxGeometry(0.82, 0.67, 0.012));
  for (let wn = 0; wn < 2; wn++) {
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(-0.6 + wn * 1.2, -0.35, -2.48);
    villaGroup.add(win);
    const frame = new THREE.Mesh(winFrameGeo, windowFrameMat);
    frame.position.set(-0.6 + wn * 1.2, -0.35, -2.475);
    villaGroup.add(frame);
  }

  const doorGeo = trackGeo(new THREE.PlaneGeometry(0.6, 1.1));
  const doorMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x3d2e22, roughness: 0.7 }));
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0.6, -0.6, -2.48);
  villaGroup.add(door);

  const pillarGeo = trackGeo(new THREE.CylinderGeometry(0.04, 0.06, 1.6, 8));
  const pillarMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.6 }));
  [-1.6, -0.5, 0.5, 1.6].forEach((px) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, -0.4, -2.95);
    villaGroup.add(pillar);
  });

  const porchRoofMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x4a5c62,
      roughness: 0.75,
      transparent: true,
      opacity: 0.55,
    })
  );
  addBox(3.6, 0.03, 0.55, porchRoofMat, 0, 0.58, -2.88);

  const chimneyMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x6a5a50, roughness: 0.85 }));
  addBox(0.35, 0.8, 0.35, chimneyMat, 1.3, 2.1, 1.2);

  return { windowMat };
}
