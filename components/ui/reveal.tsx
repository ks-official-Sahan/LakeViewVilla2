"use client";

import { useRef, type HTMLAttributes, type ReactNode } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap, EASE } from "@/lib/gsap";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealVariant = "fade-up" | "fade-in" | "scale" | "clip" | "none";

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
  className?: string;
}

export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.8,
  stagger = 0.08,
  start = "top 85%",
  once = true,
  className,
  ...props
}: RevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReduced || variant === "none" || !containerRef.current) return;

      const el = containerRef.current;

      const fromVars: gsap.TweenVars = { opacity: 0 };
      const toVars: gsap.TweenVars = {
        opacity: 1,
        duration,
        delay,
        ease: EASE.premium,
      };

      switch (variant) {
        case "fade-up":
          fromVars.y = 40;
          toVars.y = 0;
          break;
        case "scale":
          fromVars.scale = 0.94;
          toVars.scale = 1;
          break;
        case "clip":
          fromVars.clipPath = "inset(0 100% 0 0)";
          toVars.clipPath = "inset(0 0% 0 0)";
          break;
        case "fade-in":
        default:
          break;
      }

      gsap.fromTo(el, fromVars, {
        ...toVars,
        scrollTrigger: {
          trigger: el,
          start,
          once,
        },
      });
    },
    { scope: containerRef, dependencies: [variant, delay, duration, prefersReduced] }
  );

  return (
    <div ref={containerRef} className={cn("will-change-[transform,opacity]", className)} {...props}>
      {children}
    </div>
  );
}

interface StaggerRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: RevealVariant;
  staggerDelay?: number;
  start?: string;
  once?: boolean;
  className?: string;
}

export function StaggerReveal({
  children,
  variant = "fade-up",
  staggerDelay = 0.08,
  start = "top 80%",
  once = true,
  className,
  ...props
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReduced || variant === "none" || !containerRef.current) return;

      const items = containerRef.current.querySelectorAll<HTMLElement>("[data-reveal-item]");
      if (!items.length) return;

      const fromVars: gsap.TweenVars = { opacity: 0 };
      const toVars: gsap.TweenVars = {
        opacity: 1,
        duration: 0.8,
        stagger: staggerDelay,
        ease: EASE.premium,
      };

      switch (variant) {
        case "fade-up":
          fromVars.y = 40;
          toVars.y = 0;
          break;
        case "scale":
          fromVars.scale = 0.94;
          toVars.scale = 1;
          break;
        case "clip":
          fromVars.clipPath = "inset(0 100% 0 0)";
          toVars.clipPath = "inset(0 0% 0 0)";
          break;
        case "fade-in":
        default:
          break;
      }

      gsap.fromTo(items, fromVars, {
        ...toVars,
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          once,
        },
      });
    },
    { scope: containerRef, dependencies: [variant, staggerDelay, prefersReduced] }
  );

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
}
