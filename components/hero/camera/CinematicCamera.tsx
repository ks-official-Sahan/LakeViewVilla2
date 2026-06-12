"use client";

import { useScrollCamera } from "../hooks/useScrollCamera";

/** Scroll-driven keyframed camera: villa interior → balcony → lake overlook. */
export function CinematicCamera() {
  useScrollCamera({ enableParallax: true });
  return null;
}
