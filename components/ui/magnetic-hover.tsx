"use client";

import { useRef, type HTMLAttributes, type ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MagneticHoverProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function MagneticHover({
  children,
  strength = 0.3,
  className,
  ...props
}: MagneticHoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0px, 0px)";
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-transform duration-300 ease-[var(--ease-editorial)] will-change-transform",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
}
