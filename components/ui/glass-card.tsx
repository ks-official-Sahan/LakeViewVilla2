"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "relative overflow-hidden transition-all duration-500",
  {
    variants: {
      tier: {
        1: "bg-[var(--glass-1-bg)] backdrop-blur-[var(--glass-1-blur)] border border-[var(--glass-1-border)] shadow-[var(--glass-shadow)]",
        2: "bg-[var(--glass-2-bg)] backdrop-blur-[var(--glass-2-blur)] border border-[var(--glass-2-border)]",
        3: "bg-[var(--glass-3-bg)] backdrop-blur-[var(--glass-3-blur)] border border-[var(--glass-3-border)] rounded-full",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]",
        glow: "hover:border-[var(--color-gold)]/40 hover:shadow-[0_12px_40px_rgba(201,165,90,0.08)]",
        scale: "hover:scale-[1.02]",
      },
      rounded: {
        none: "",
        md: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      tier: 1,
      hover: "none",
      rounded: "lg",
    },
  }
);

export interface GlassCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children: ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, tier, hover, rounded, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ tier, hover, rounded }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
