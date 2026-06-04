"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { SectionReveal } from "@/components/motion/section-reveal";

type Img = { src: string; alt: string; w: number; h: number };

function inferCategory(alt: string, src: string): string {
  const s = `${alt} ${src}`.toLowerCase();
  if (/bedroom|bed|suite|interior|living|bathroom|kitchen|room/.test(s)) {
    return "Interiors";
  }
  if (/pool|garden|lagoon|drone|aerial|exterior|facade|outdoor|deck/.test(s)) {
    return "Grounds";
  }
  if (/beach|ocean|sea|sand|coast|wave/.test(s)) {
    return "Coastal";
  }
  if (/food|dining|chef|meal|breakfast/.test(s)) {
    return "Dining";
  }
  if (/sunset|sunrise|sky|golden/.test(s)) {
    return "Moments";
  }
  return "Gallery";
}

export default function GalleryClient({ images }: { images: Img[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const enriched = useMemo(
    () =>
      images.map((im) => ({
        ...im,
        category: inferCategory(im.alt ?? "", im.src),
      })),
    [images],
  );

  const categories = useMemo(() => {
    const unique = [...new Set(enriched.map((i) => i.category))].sort(
      (a, b) => a.localeCompare(b),
    );
    return ["All", ...unique];
  }, [enriched]);

  const filtered =
    activeCategory === "All"
      ? enriched
      : enriched.filter((i) => i.category === activeCategory);

  // Keyboard controls & body scroll lock
  useEffect(() => {
    if (selected == null) return;

    const onKey = (e: KeyboardEvent) => {
      const len = filtered.length;
      if (len === 0) return;
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowLeft")
        setSelected((p) =>
          p == null ? null : p > 0 ? p - 1 : len - 1
        );
      if (e.key === "ArrowRight")
        setSelected((p) =>
          p == null ? null : p < len - 1 ? p + 1 : 0
        );
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected, filtered.length]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDragging(false);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const s = dragStart.current;
    if (!s) return;
    const dx = Math.abs(e.clientX - s.x);
    const dy = Math.abs(e.clientY - s.y);
    if (dx + dy > 8) setDragging(true);
  };
  const onMouseUp = (index: number) => {
    if (!dragging) setSelected(index);
    dragStart.current = null;
    setDragging(false);
  };

  return (
    <>
      {/* Category segmented pills */}
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setSelected(null);
              }}
              className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] text-white shadow-md shadow-[var(--color-primary)]/10 scale-102"
                  : "border border-[var(--color-border)]/50 bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)]"
              }`}
            >
              <span>{cat}</span>
              <span className="ml-1.5 opacity-60 font-semibold font-mono">
                ({cat !== "All" ? enriched.filter((x) => x.category === cat).length : enriched.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Masonry Layout */}
      <div
        className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        {filtered.map((image, i) => (
          <motion.div
            key={image.src + i}
            className="break-inside-avoid group cursor-pointer"
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.3 }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => onMouseUp(i)}
          >
            <SectionReveal>
              <div
                className="relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/50 shadow-md transition-all duration-500 hover:border-[var(--color-gold)]/30"
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt || "Lake View Villa photo"}
                  width={image.w}
                  height={image.h}
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-103"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Visual Image Info overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute bottom-4 left-5 right-5 text-white z-10 opacity-0 transform translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-0.5">
                    {image.category}
                  </p>
                  <p className="text-xs text-white/90 font-medium tracking-wide">
                    {image.alt}
                  </p>
                </div>
              </div>
            </SectionReveal>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selected !== null && filtered[selected] != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6"
            onClick={() => setSelected(null)}
          >
            <div className="relative max-w-6xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
              
              {/* Close Button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-14 right-0 text-white/60 hover:text-[var(--color-gold)] transition-colors z-10 cursor-pointer"
                aria-label="Close"
              >
                <X size={32} />
              </button>

              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const len = filtered.length;
                  setSelected((p) =>
                    p == null ? null : p > 0 ? p - 1 : len - 1
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[var(--color-gold)] transition-colors z-10 cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft size={44} />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const len = filtered.length;
                  setSelected((p) =>
                    p == null ? null : p < len - 1 ? p + 1 : 0
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[var(--color-gold)] transition-colors z-10 cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight size={44} />
              </button>

              {/* Image Frame */}
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black"
              >
                <Image
                  src={filtered[selected].src}
                  alt={filtered[selected].alt}
                  width={filtered[selected].w}
                  height={filtered[selected].h}
                  className="max-h-[80vh] w-auto max-w-full object-contain"
                  priority
                />
              </motion.div>

              {/* Label details bar */}
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md">
                <span>{selected + 1} / {filtered.length}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span className="text-white/80 font-medium tracking-wide normal-case">{filtered[selected].alt}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
