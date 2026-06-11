import { ViewTransition, type ReactNode } from "react";
import {
  NAV_BACK,
  NAV_FADE,
  NAV_FORWARD,
} from "@/lib/navigation/view-transitions";

type DirectionalTransitionProps = {
  children: ReactNode;
};

/** Page-level enter/exit keyed to Link `transitionTypes`. Place in page components, not layouts. */
export function DirectionalTransition({ children }: DirectionalTransitionProps) {
  return (
    <ViewTransition
      enter={{
        [NAV_FORWARD]: "nav-forward",
        [NAV_BACK]: "nav-back",
        [NAV_FADE]: "fade-in",
        default: "none",
      }}
      exit={{
        [NAV_FORWARD]: "nav-forward",
        [NAV_BACK]: "nav-back",
        [NAV_FADE]: "fade-out",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
