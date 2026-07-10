/**
 * Centralized LOD budgets — aligned with legacy HeroCanvas mobile/desktop splits.
 * Import `getHeroLod(isMobile)` instead of scattering magic numbers.
 */
export interface HeroLodBudget {
  forestTrees: number;
  grassBlades: number;
  waterSegments: number;
  mistParticles: number;
  fireflies: number;
  fish: number;
  cloudClusters: number;
}

const MOBILE_LOD: HeroLodBudget = {
  forestTrees: 30,
  grassBlades: 250,
  waterSegments: 120,
  mistParticles: 40,
  fireflies: 15,
  fish: 14,
  cloudClusters: 5,
};

const DESKTOP_LOD: HeroLodBudget = {
  forestTrees: 55,
  grassBlades: 700,
  waterSegments: 200,
  mistParticles: 100,
  fireflies: 30,
  fish: 14,
  cloudClusters: 10,
};

export function getHeroLod(isMobile: boolean): HeroLodBudget {
  return isMobile ? MOBILE_LOD : DESKTOP_LOD;
}
