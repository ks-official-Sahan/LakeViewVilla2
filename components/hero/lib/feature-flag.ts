export function isHeroR3FEnabled(): boolean {
  if (typeof window !== "undefined") {
    const override = window.localStorage.getItem("hero-r3f");
    if (override === "1") return true;
    if (override === "0") return false;
  }
  return process.env.NEXT_PUBLIC_HERO_R3F === "1" || process.env.NEXT_PUBLIC_HERO_R3F === "true";
}
