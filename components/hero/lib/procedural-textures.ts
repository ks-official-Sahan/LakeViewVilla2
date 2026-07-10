import * as THREE from "three";

export interface ProceduralTextureSet {
  wood: THREE.Texture;
  concrete: THREE.Texture;
  palmLeaf: THREE.Texture;
  road: THREE.Texture;
  bark: THREE.Texture;
  sunGlow: THREE.Texture;
  moonGlow: THREE.Texture;
}

const textureCache = new Map<string, ProceduralTextureSet>();

export function createWoodTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#3d2e22";
  ctx.fillRect(0, 0, 512, 512);

  const plankWidth = 64;
  for (let x = 0; x < 512; x += plankWidth) {
    ctx.strokeStyle = "#2a1f16";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
    ctx.lineWidth = 1.2;
    for (let j = 0; j < 8; j++) {
      const gx = x + 5 + Math.random() * (plankWidth - 10);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.quadraticCurveTo(gx + (Math.random() - 0.5) * 20, 256, gx, 512);
      ctx.stroke();
    }

    if (Math.random() > 0.7) {
      const kx = x + plankWidth / 2;
      const ky = Math.random() * 512;
      ctx.fillStyle = "rgba(30, 18, 10, 0.5)";
      ctx.beginPath();
      ctx.ellipse(kx, ky, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${0.04 + Math.random() * 0.08})`;
    if (Math.random() > 0.5) {
      ctx.fillRect(x, 0, plankWidth, 512);
    }
  }

  return new THREE.CanvasTexture(canvas);
}

export function createConcreteTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#5a6e72";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 1.5;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(x, y, size, size);
  }

  ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(256, 128);
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 256);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

export function createPalmLeafTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, 128, 256);

  ctx.strokeStyle = "#1a5c3a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 250);
  ctx.quadraticCurveTo(64, 128, 48, 10);
  ctx.stroke();

  ctx.strokeStyle = "#2a7a4a";
  ctx.lineWidth = 1.8;
  const leafletsCount = 38;
  for (let i = 0; i < leafletsCount; i++) {
    const t = i / leafletsCount;
    const py = 250 - t * 235;
    const px = 64 - t * t * 16;
    const length = Math.sin(t * Math.PI) * 48;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px - length * 0.7, py + 12, px - length, py + 26);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + length * 0.7, py + 12, px + length, py + 26);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createRoadTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#4a4642";
  ctx.fillRect(0, 0, 256, 512);

  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 512;
    const s = Math.random() * 1.8;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.04)";
    ctx.fillRect(x, y, s, s);
  }

  ctx.strokeStyle = "rgba(200, 190, 160, 0.12)";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 30]);
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 512);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(90, 85, 75, 0.15)";
  ctx.fillRect(0, 0, 12, 512);
  ctx.fillRect(244, 0, 12, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createBarkTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#3a2a1e";
  ctx.fillRect(0, 0, 128, 256);

  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  for (let i = 0; i < 20; i++) {
    ctx.lineWidth = 1 + Math.random() * 2;
    const x = Math.random() * 128;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 15, 128, x + (Math.random() - 0.5) * 10, 256);
    ctx.stroke();
  }

  for (let y = 0; y < 256; y += 8 + Math.random() * 12) {
    ctx.strokeStyle = `rgba(${50 + Math.random() * 30}, ${35 + Math.random() * 20}, ${20 + Math.random() * 15}, 0.3)`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createSunGlowTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255, 245, 200, 0.9)");
  grad.addColorStop(0.15, "rgba(255, 225, 150, 0.5)");
  grad.addColorStop(0.4, "rgba(255, 200, 100, 0.15)");
  grad.addColorStop(0.7, "rgba(255, 180, 80, 0.04)");
  grad.addColorStop(1, "rgba(255, 160, 60, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

export function createMoonGlowTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(200, 210, 230, 0.6)");
  grad.addColorStop(0.3, "rgba(180, 200, 220, 0.2)");
  grad.addColorStop(0.6, "rgba(150, 180, 210, 0.05)");
  grad.addColorStop(1, "rgba(130, 160, 200, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

export function getProceduralTextures(isMobile: boolean): ProceduralTextureSet {
  const key = isMobile ? "mobile" : "desktop";
  const cached = textureCache.get(key);
  if (cached) return cached;

  const set: ProceduralTextureSet = {
    wood: createWoodTexture(),
    concrete: createConcreteTexture(),
    palmLeaf: createPalmLeafTexture(),
    road: createRoadTexture(),
    bark: createBarkTexture(),
    sunGlow: createSunGlowTexture(),
    moonGlow: createMoonGlowTexture(),
  };

  textureCache.set(key, set);
  return set;
}
