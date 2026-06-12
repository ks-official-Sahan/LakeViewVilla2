"use client";

import { useScrollCamera } from "../hooks/useScrollCamera";

/** Scroll-driven spline camera with optional mouse parallax (t &lt; 0.4). */
export function CinematicCamera() {
  useScrollCamera({ enableParallax: true });
  return null;
}
