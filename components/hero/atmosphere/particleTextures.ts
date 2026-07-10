import * as THREE from "three";

export function createMistSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createFireflySpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(255, 185, 91, 0.95)");
    grad.addColorStop(0.4, "rgba(255, 185, 91, 0.3)");
    grad.addColorStop(1, "rgba(255, 185, 91, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
  }
  return new THREE.CanvasTexture(canvas);
}
