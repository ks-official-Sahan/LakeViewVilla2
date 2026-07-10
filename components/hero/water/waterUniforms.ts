import * as THREE from "three";
import { LAKE_CENTER, LAKE_RADIUS, SHORE_WORLD_Z } from "../constants";

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
  uIsNight: { value: number };
  uWindX: { value: number };
}

export function createWaterUniforms(isMobile: boolean): WaterUniforms {
  return {
    uTime: { value: 0 },
    uWaveSpeed: { value: 0.2 },
    uWaveAmplitude: { value: 0.045 },
    uWaterColor: { value: new THREE.Color(0x35a8ac) },
    uWaterSpecularColor: { value: new THREE.Color(0xffffff) },
    uSkyTop: { value: new THREE.Color(0x2e9b9e) },
    uSkyBottom: { value: new THREE.Color(0xfff5e8) },
    uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
    uSunIntensity: { value: 1.0 },
    uScrollProgress: { value: 0.0 },
    uShoreWorldZ: { value: SHORE_WORLD_Z },
    uLakeCenter: { value: LAKE_CENTER.clone() },
    uLakeRadius: { value: LAKE_RADIUS },
    uLanternViewPosition: { value: new THREE.Vector3() },
    uLanternPlanePos: { value: new THREE.Vector2() },
    uLanternColor: { value: new THREE.Color(0xffb04d) },
    uLanternIntensity: { value: 0.0 },
    uMobile: { value: isMobile ? 1.0 : 0.0 },
    uIsNight: { value: 0.0 },
    uWindX: { value: 1.0 },
  };
}
