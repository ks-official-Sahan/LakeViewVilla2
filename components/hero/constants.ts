import { Vector2 } from "three";

/** Road surface elevation (world Y). */
export const ROAD_Y = -0.85;

/** Lake water surface elevation (world Y). */
export const WATER_Y = -1.28;

/** Villa garden ground elevation (world Y). */
export const GROUND_Y = -0.88;

/** Southern shore fog band reference (world Z). */
export const SHORE_WORLD_Z = -4.8;

/** Lake center in XZ plane. */
export const LAKE_CENTER = new Vector2(-0.5, -8);

/** Approximate lake radius for shore masking. */
export const LAKE_RADIUS = 10.5;

/** Lake field strip rotation — ~85° CCW from road (satellite ground truth). */
export const LAKE_FIELD_ROTATION_Y = (85 * Math.PI) / 180;

/** Default perspective camera FOV. */
export const CAMERA_FOV = 62;

/** Camera near / far clip planes. */
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 120;

/** Scroll section height multiplier for cinematic camera path. */
export const HERO_SCROLL_VH = 500;

/** Mobile breakpoint (matches legacy HeroCanvas). */
export const MOBILE_BREAKPOINT = 768;
