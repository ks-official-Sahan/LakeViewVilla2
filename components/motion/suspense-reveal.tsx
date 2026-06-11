import { ViewTransition, type ReactNode } from "react";

type SuspenseRevealProps = {
  children: ReactNode;
};

/** Wrap async page content that pairs with a route `loading.tsx` skeleton. */
export function SuspenseReveal({ children }: SuspenseRevealProps) {
  return (
    <ViewTransition enter="slide-up" default="none">
      {children}
    </ViewTransition>
  );
}

type SuspenseFallbackProps = {
  children: ReactNode;
};

/** Wrap route `loading.tsx` skeletons for slide-down exit. */
export function SuspenseFallback({ children }: SuspenseFallbackProps) {
  return <ViewTransition exit="slide-down">{children}</ViewTransition>;
}
