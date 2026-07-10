"use client";

import { DirectionalTransition } from "@/components/motion/directional-transition";

/**
 * App-level view transitions for public routes.
 * Per-page DirectionalTransition wrappers were consolidated here so enter/exit
 * animations fire once per navigation (nested ViewTransitions are ignored).
 */
export default function PublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DirectionalTransition>{children}</DirectionalTransition>;
}
