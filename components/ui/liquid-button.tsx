"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const liquidButtonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold uppercase tracking-widest transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        gold: "bg-[var(--color-gold)] text-[var(--color-charcoal)] border border-[var(--color-gold)] hover:bg-white hover:border-white hover:shadow-[0_12px_30px_rgba(255,255,255,0.25)]",
        outline: "bg-transparent text-white border border-white/30 hover:border-white/60 hover:bg-white/10",
        ghost: "bg-transparent text-[var(--color-foreground)] border border-transparent hover:text-[var(--color-gold)]",
        dark: "bg-[var(--color-charcoal)] text-white border border-white/10 hover:bg-[var(--color-charcoal)]/80 hover:border-[var(--color-gold)]/40",
      },
      size: {
        sm: "h-9 px-4 text-[0.65rem] rounded-lg",
        md: "h-11 px-6 text-xs rounded-xl",
        lg: "h-14 px-10 text-xs rounded-full",
        xl: "h-16 px-12 text-sm rounded-full",
      },
      shimmer: {
        true: "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-100%] after:skew-x-[-18deg] hover:after:animate-[shimmerSweep_0.65s_ease_forwards] after:pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "lg",
      shimmer: true,
    },
  }
);

export interface LiquidButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  children: ReactNode;
}

const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, shimmer, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(liquidButtonVariants({ variant, size, shimmer }), className)}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";

export { LiquidButton, liquidButtonVariants };
