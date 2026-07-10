/** Transition types passed to `<Link transitionTypes={…}>` (Next.js 16+). */
export const NAV_FORWARD = "nav-forward" as const;
export const NAV_BACK = "nav-back" as const;
export const NAV_FADE = "nav-fade" as const;

export type NavTransitionType =
  | typeof NAV_FORWARD
  | typeof NAV_BACK
  | typeof NAV_FADE;

export const navForward = [NAV_FORWARD] as const;
export const navBack = [NAV_BACK] as const;
export const navFade = [NAV_FADE] as const;
