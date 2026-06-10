/**
 * Reusable GSAP animation presets for LakeViewVilla.
 * Import from this file to keep animation configs DRY and consistent.
 */
import { gsap, ScrollTrigger, EASE, DURATION } from "@/lib/gsap";

export interface ScrollRevealConfig {
  trigger?: gsap.DOMTarget;
  start?: string;
  once?: boolean;
  delay?: number;
}

/**
 * Fade in + slide up — most common reveal pattern.
 * Used by: highlights, facilities, values, stays-teaser sections
 */
export function fadeInUp(
  target: gsap.DOMTarget,
  config: ScrollRevealConfig = {}
) {
  const { trigger, start = "top 85%", once = true, delay = 0 } = config;

  return gsap.fromTo(
    target,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: DURATION.reveal,
      delay,
      ease: EASE.premium,
      scrollTrigger: {
        trigger: trigger || target,
        start,
        once,
      },
    }
  );
}

/**
 * Staggered fade-in-up for lists/grids.
 * Used by: highlights grid, facilities carousel, stats row
 */
export function staggerFadeInUp(
  targets: gsap.DOMTarget,
  config: ScrollRevealConfig & { stagger?: number } = {}
) {
  const { trigger, start = "top 80%", once = true, delay = 0, stagger = 0.08 } = config;

  return gsap.fromTo(
    targets,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: DURATION.normal,
      delay,
      stagger,
      ease: EASE.premium,
      scrollTrigger: {
        trigger: trigger || targets,
        start,
        once,
      },
    }
  );
}

/**
 * Scale-in reveal — for cards and media items.
 * Used by: gallery items, media grid, room cards
 */
export function scaleIn(
  target: gsap.DOMTarget,
  config: ScrollRevealConfig = {}
) {
  const { trigger, start = "top 82%", once = true, delay = 0 } = config;

  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.94 },
    {
      opacity: 1,
      scale: 1,
      duration: DURATION.slow,
      delay,
      ease: EASE.premium,
      scrollTrigger: {
        trigger: trigger || target,
        start,
        once,
      },
    }
  );
}

/**
 * Clip-path reveal — for hero text and editorial images.
 * Used by: ScrollStory hero text, story section image
 */
export function clipReveal(
  target: gsap.DOMTarget,
  config: ScrollRevealConfig & { direction?: "left" | "top" } = {}
) {
  const { trigger, start = "top 85%", once = true, delay = 0, direction = "left" } = config;

  const fromClip = direction === "left"
    ? "inset(0 100% 0 0)"
    : "inset(100% 0 0 0)";
  const toClip = "inset(0 0% 0 0)";

  return gsap.fromTo(
    target,
    { clipPath: fromClip, opacity: 0 },
    {
      clipPath: toClip,
      opacity: 1,
      duration: DURATION.slow,
      delay,
      ease: EASE.premium,
      scrollTrigger: {
        trigger: trigger || target,
        start,
        once,
      },
    }
  );
}

/**
 * Parallax background — for large background images.
 * Used by: hero backgrounds, story section parallax text
 */
export function parallaxBg(
  target: gsap.DOMTarget,
  config: { trigger?: gsap.DOMTarget; start?: string; end?: string; yPercent?: number } = {}
) {
  const { trigger, start = "top bottom", end = "bottom top", yPercent = -20 } = config;

  return gsap.to(target, {
    yPercent,
    ease: "none",
    scrollTrigger: {
      trigger: trigger || target,
      start,
      end,
      scrub: 1,
    },
  });
}

/**
 * Text entrance — word-by-word or line-by-line reveal.
 * Used by: hero headings, section titles
 */
export function textEntrance(
  target: gsap.DOMTarget,
  config: ScrollRevealConfig & { stagger?: number; yFrom?: number } = {}
) {
  const { trigger, start = "top 85%", once = true, delay = 0, stagger = 0.06, yFrom = 15 } = config;

  return gsap.fromTo(
    target,
    { opacity: 0, y: yFrom },
    {
      opacity: 1,
      y: 0,
      duration: DURATION.normal,
      delay,
      stagger,
      ease: EASE.premium,
      scrollTrigger: {
        trigger: trigger || target,
        start,
        once,
      },
    }
  );
}

/**
 * Counter animation — for stats numbers.
 * Used by: stats strip (4.9★, 100%, 2 min, 24/7)
 */
export function counter(
  target: gsap.DOMTarget,
  config: { duration?: number; ease?: string; scrollTrigger?: ScrollTrigger.Vars } = {}
) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el || !(el instanceof HTMLElement)) return;

  const text = el.textContent ?? "0";
  const endValue = parseFloat(text);
  if (isNaN(endValue)) return;

  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endValue,
    duration: config.duration || 2,
    ease: config.ease || "power2.out",
    onUpdate: () => {
      el.textContent = String(Math.round(obj.val * 10) / 10);
    },
    scrollTrigger: config.scrollTrigger,
  });
}

export { gsap, ScrollTrigger, EASE, DURATION };
