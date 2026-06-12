import * as THREE from "three";
import { WATER_Y } from "../constants";
import {
  computeBirdVisibility,
  computeGoldenHourBoost,
  computeIsNight,
  computeNightSmooth,
  computeWindX,
  interpolateEnv,
} from "../environment/envKeyframes";
import { getWaveHeightAt } from "../water/waveHeight";
import type { HeroSceneRefs } from "./buildHeroScene";

export interface TickHeroSceneParams {
  elapsed: number;
  scroll: number;
  timeOfDay: number;
  camera: THREE.Camera;
  isMobile: boolean;
}

const tempViewPos = new THREE.Vector3();
const tempWorldPos = new THREE.Vector3();
const boostedWater = new THREE.Color();
const sunDir = new THREE.Vector3();
const moonDir = new THREE.Vector3();
const cloudDayColor = new THREE.Color(0xffffff);
const cloudNightColor = new THREE.Color(0x1a2030);
const cloudSunsetColor = new THREE.Color();
const sunColorDay = new THREE.Color(0xfff5d0);
const sunColorSunset = new THREE.Color(0xe8904e);
const grassDummy = new THREE.Object3D();
const fishDummy = new THREE.Object3D();
const reedDummy = new THREE.Object3D();

export function tickHeroScene(refs: HeroSceneRefs, params: TickHeroSceneParams): void {
  const { elapsed, scroll, timeOfDay, camera } = params;

  interpolateEnv(timeOfDay, refs.currentEnv);
  const env = refs.currentEnv;

  refs.ambientLight.color.copy(env.ambient);
  refs.ambientLight.intensity = env.ambientIntensity * 1.2;

  refs.sunLight.color.copy(env.sun);
  refs.sunLight.intensity = env.sunIntensity;
  refs.sunLight.position.copy(env.sunPos);

  refs.fog.color.copy(env.fogColor);
  refs.fog.density = env.fogDensity * 0.25 * (1.0 - scroll * 0.4);
  refs.hemiLight.intensity = 0.45 + env.ambientIntensity * 0.35;
  refs.hemiLight.color.set(0x9ee8ec);
  refs.hemiLight.groundColor.copy(env.water).multiplyScalar(0.85);
  refs.fillLight.intensity = env.ambientIntensity * 0.15;

  const nightVal = computeNightSmooth(timeOfDay);
  refs.windowMat.emissive.setHex(0xffaa44);
  refs.windowMat.emissiveIntensity = nightVal * 0.6;
  refs.interiorLight.intensity = 0.25 + nightVal * 1.55;

  const goldenHour = computeGoldenHourBoost(timeOfDay);
  const isNightVal = computeIsNight(timeOfDay);
  const windX = computeWindX(timeOfDay);

  refs.skyMat.uniforms.uColorTop.value.copy(env.skyTop);
  refs.skyMat.uniforms.uColorBottom.value.copy(env.skyBottom);
  refs.skyMat.uniforms.uSunDirection.value.copy(env.sunPos).normalize();
  refs.skyMat.uniforms.uSunColor.value.copy(env.sun).multiplyScalar(env.sunIntensity);
  refs.skyMat.uniforms.uTime.value = elapsed;
  refs.skyMat.uniforms.uGoldenHourBoost.value = goldenHour;
  refs.skyMat.uniforms.uIsNight.value = isNightVal;
  refs.skyMat.uniforms.uSunSize.value = isNightVal > 0.5 ? 0.028 : 0.035;
  refs.skyMat.uniforms.uWindX.value = windX;
  refs.skyMesh.position.copy(camera.position);

  sunDir.copy(env.sunPos).normalize();
  refs.sunOrb.position.copy(sunDir).multiplyScalar(42);
  refs.sunOrb.visible = nightVal < 0.7;
  refs.sunOrbMat.color.lerpColors(sunColorDay, sunColorSunset, goldenHour);
  const sunGlowMat = refs.sunGlowSprite.material as THREE.SpriteMaterial;
  sunGlowMat.opacity = (1.0 - nightVal) * 0.8;
  refs.sunGlowSprite.scale.setScalar(8 + goldenHour * 6);

  moonDir.copy(sunDir).negate();
  moonDir.y = Math.abs(moonDir.y) * 0.85 + 0.12;
  moonDir.normalize();
  refs.moonOrb.position.copy(moonDir).multiplyScalar(40);
  refs.moonOrb.visible = nightVal > 0.3;
  const moonGlowMat = refs.moonGlowSprite.material as THREE.SpriteMaterial;
  moonGlowMat.opacity = nightVal * 0.6;

  refs.cloudsData.forEach((cd) => {
    cd.group.position.x = cd.baseX + elapsed * cd.speed * windX * 20;
    if (cd.group.position.x > 30) cd.group.position.x = -30;
    if (cd.group.position.x < -30) cd.group.position.x = 30;
  });

  cloudSunsetColor.copy(env.sun).multiplyScalar(0.8);
  if (nightVal > 0.5) {
    refs.cloudMat.color.copy(cloudNightColor);
    refs.cloudMat.opacity = 0.15;
  } else if (goldenHour > 0.3) {
    refs.cloudMat.color.lerpColors(cloudDayColor, cloudSunsetColor, goldenHour);
    refs.cloudMat.opacity = 0.7;
  } else {
    refs.cloudMat.color.copy(cloudDayColor);
    refs.cloudMat.opacity = 0.55;
  }

  tempViewPos.copy(refs.bulbSphere.position);
  tempViewPos.applyMatrix4(refs.villaGroup.matrixWorld);
  tempViewPos.applyMatrix4(camera.matrixWorldInverse);

  tempWorldPos.copy(refs.bulbSphere.position);
  tempWorldPos.applyMatrix4(refs.villaGroup.matrixWorld);
  refs.waterUniforms.uLanternPlanePos.value.set(tempWorldPos.x, -tempWorldPos.z);

  refs.waterUniforms.uTime.value = elapsed;
  refs.waterUniforms.uWaveSpeed.value = env.waveSpeed;
  refs.waterUniforms.uWaveAmplitude.value = env.waveAmplitude * 0.85;
  const isNight = isNightVal > 0.5;
  boostedWater.copy(env.water).multiplyScalar(isNight ? 1.2 : 1.35);
  refs.waterUniforms.uWaterColor.value.copy(boostedWater);
  refs.waterUniforms.uWaterSpecularColor.value.copy(env.waterSpecular);
  refs.waterUniforms.uSkyTop.value.copy(env.skyTop);
  refs.waterUniforms.uSkyBottom.value.copy(env.skyBottom);
  refs.waterUniforms.uSunDirection.value.copy(env.sunPos).normalize();
  refs.waterUniforms.uSunIntensity.value = env.sunIntensity;
  refs.waterUniforms.uScrollProgress.value = scroll;
  refs.waterUniforms.uLanternViewPosition.value.copy(tempViewPos);
  refs.waterUniforms.uLanternIntensity.value = env.lanternIntensity;
  refs.warmLight.intensity = env.lanternIntensity * 2.2;

  refs.palmsData.forEach((palm) => {
    palm.group.rotation.z = palm.baseRotationZ + Math.sin(elapsed * 0.75 + palm.index) * 0.025;
    palm.group.rotation.x = Math.cos(elapsed * 0.6 + palm.index) * 0.012;
  });

  const birdVis = computeBirdVisibility(timeOfDay);
  refs.birdsData.forEach((bird, idx) => {
    const flap = Math.sin(elapsed * bird.speed + bird.phase) * 0.65;
    bird.wingL.rotation.y = flap;
    bird.wingR.rotation.y = -flap;

    const angle = elapsed * 0.06 + idx * 1.8;
    bird.group.position.x = bird.baseX + Math.sin(angle) * bird.radius * 0.35;
    bird.group.position.z = -7 + Math.cos(angle) * 2.0;
    bird.group.position.y = bird.baseY + Math.sin(elapsed * 0.3 + idx) * 0.3;
    bird.group.visible = birdVis > 0.15;
    bird.group.rotation.y = Math.atan2(
      Math.cos(angle) * bird.radius * 0.35,
      -Math.sin(angle) * 2.0
    );
    refs.birdBodyMat.opacity = 0.75 + birdVis * 0.25;
    refs.birdWingMat.opacity = 0.7 + birdVis * 0.3;
  });

  refs.padData.forEach((pad) => {
    const height = getWaveHeightAt(pad.x, pad.z, elapsed, env.waveSpeed, env.waveAmplitude);
    const waterY = WATER_Y + height + 0.005;
    pad.mesh.position.set(pad.x, waterY, pad.z);
    pad.mesh.rotation.z = Math.sin(elapsed * env.waveSpeed + pad.phase) * 0.04;
    pad.mesh.rotation.x = Math.cos(elapsed * env.waveSpeed + pad.phase) * 0.02;
    if (pad.lotus) {
      pad.lotus.position.set(pad.x, waterY + 0.01, pad.z);
      pad.lotus.rotation.y = pad.mesh.rotation.y;
    }
  });

  refs.reedsData.forEach((reed) => {
    const sway = reed.baseRotZ + Math.sin(elapsed * 1.1 + reed.phase) * 0.1;
    reedDummy.position.set(reed.x, reed.y, reed.z);
    reedDummy.rotation.set(0, reed.baseRotY, sway);
    reedDummy.scale.set(1, 1, 1);
    reedDummy.updateMatrix();
    refs.reedsInstanced.setMatrixAt(reed.index, reedDummy.matrix);
  });
  refs.reedsInstanced.instanceMatrix.needsUpdate = true;

  refs.fishData.forEach((fish) => {
    const swim = elapsed * fish.speed + fish.phase;
    const fx = fish.x + Math.sin(swim) * fish.radius + windX * elapsed * 0.01;
    const fz = fish.z + Math.cos(swim * 0.8) * fish.radius * 0.6;
    const fy =
      WATER_Y +
      getWaveHeightAt(fx, fz, elapsed, env.waveSpeed, env.waveAmplitude) -
      0.06;
    const rotY = Math.atan2(
      Math.cos(swim * 0.8) * fish.radius * 0.6,
      Math.cos(swim) * fish.radius
    );
    fishDummy.position.set(fx, fy, fz);
    fishDummy.rotation.set(0, rotY, 0);
    fishDummy.scale.set(1, 1, 1);
    fishDummy.updateMatrix();
    refs.fishInstanced.setMatrixAt(fish.index, fishDummy.matrix);
    refs.fishInstanced.visible = !isNight || env.lanternIntensity > 0.5;
  });
  refs.fishInstanced.instanceMatrix.needsUpdate = true;

  refs.grassData.forEach((blade) => {
    const windSway = Math.sin(elapsed * 1.4 + blade.x * 0.5 + blade.z * 0.3) * 0.12 * windX;
    grassDummy.position.set(blade.x, blade.y, blade.z);
    grassDummy.rotation.set(0, blade.baseRotY, blade.baseRotZ + windSway);
    grassDummy.scale.set(blade.scaleX, blade.scaleY, 1);
    grassDummy.updateMatrix();
    refs.grassInstanced.setMatrixAt(blade.index, grassDummy.matrix);
  });
  refs.grassInstanced.instanceMatrix.needsUpdate = true;

  const positions = refs.particleGeo.attributes.position.array as Float32Array;
  for (let i = 0; i < refs.particleCount; i++) {
    const data = refs.particleData[i];
    positions[i * 3] += data.speedX;
    positions[i * 3 + 2] += data.speedZ;
    if (Math.abs(positions[i * 3] - data.originX) > data.limitX) {
      positions[i * 3] = data.originX;
    }
  }
  refs.particleGeo.attributes.position.needsUpdate = true;
  refs.particleMat.color.copy(env.fogColor);
  refs.particleMat.opacity = 0.1 * (1.0 - scroll);

  const ffPositions = refs.fireflyGeo.attributes.position.array as Float32Array;
  for (let i = 0; i < refs.fireflyCount; i++) {
    const data = refs.fireflyData[i];
    ffPositions[i * 3 + 1] = data.y + Math.sin(elapsed * data.speed + data.phase) * 0.18;
    ffPositions[i * 3] += Math.sin(elapsed * 0.3 + i) * 0.0025;
    ffPositions[i * 3 + 2] += Math.cos(elapsed * 0.2 + i) * 0.002;
  }
  refs.fireflyGeo.attributes.position.needsUpdate = true;
  refs.fireflyMat.opacity =
    (env.lanternIntensity * 0.35 + isNightVal * 0.45) * (1.0 - scroll);

  refs.fgLeafMat.opacity = Math.max(0, 0.25 - scroll * 0.3);
}
