/**
 * R3F hero is the production default (Phase 7).
 *
 * Opt out:
 * - `localStorage.setItem("hero-r3f", "0")` → legacy HeroCanvas
 * - `NEXT_PUBLIC_HERO_LEGACY=1` → legacy HeroCanvas at build time
 *
 * Force R3F on: `localStorage.setItem("hero-r3f", "1")`
 */
export function isHeroR3FEnabled(): boolean {
  if (typeof window !== "undefined") {
    const override = window.localStorage.getItem("hero-r3f");
    if (override === "1") return true;
    if (override === "0") return false;
  }

  if (
    process.env.NEXT_PUBLIC_HERO_LEGACY === "1" ||
    process.env.NEXT_PUBLIC_HERO_LEGACY === "true"
  ) {
    return false;
  }

  return true;
}

export function isHeroLegacyEnabled(): boolean {
  return !isHeroR3FEnabled();
}
