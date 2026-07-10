/**
 * Centralized GSAP + ScrollTrigger + useGSAP registration.
 * Import from this file ONLY — never import gsap/ScrollTrigger directly
 * in components. This prevents re-registration on HMR and route transitions.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

export const EASE = {
  /** Smooth deceleration — elements settling into place */
  out: "power3.out",
  /** Smooth acceleration + deceleration */
  inOut: "power2.inOut",
  /** Buttery smooth — premium scroll-driven animations */
  premium: "power4.out",
  /** Elastic snap — playful micro-interactions */
  elastic: "elastic.out(1, 0.5)",
  /** Sharp entrance */
  expo: "expo.out",
} as const;

export const DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.9,
  reveal: 1.2,
} as const;

export const BREAKPOINTS = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP, ScrollToPlugin);

  gsap.config({
    nullTargetWarn: false,
  });

  // Default ScrollTrigger configuration for consistent performance
  ScrollTrigger.defaults({
    toggleActions: "play none none reverse",
  });

  // Register a reusable custom effect for staggered slide reveals
  gsap.registerEffect({
    name: "reveal",
    effect: (targets: any, config: any) => {
      return gsap.from(targets, {
        y: config.y,
        opacity: 0,
        duration: config.duration,
        ease: EASE.out,
        stagger: config.stagger,
      });
    },
    defaults: { y: 40, duration: 0.8, stagger: 0.1 },
    extendTimeline: true,
  });
}

/** Helper to safely configure scroll-driven timelines */
export function createScrollTimeline(
  trigger: string | Element,
  vars?: gsap.plugins.ScrollTriggerStaticVars
) {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top 80%",
      toggleActions: "play none none reverse",
      ...vars,
    },
  });
}

export { gsap, ScrollTrigger, ScrollToPlugin, useGSAP };
