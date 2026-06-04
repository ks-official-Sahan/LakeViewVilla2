"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap, EASE, DURATION } from "@/lib/gsap";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { FAQ_ITEMS } from "@/data/content";

export function FAQ({ cmsData }: { cmsData?: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const eyebrow = cmsData?.eyebrow || "Got Questions?";
  const descriptionText = cmsData?.description || "Everything you need to know about your stay at Lake View Villa.";

  const questionsList: { question: string; answer: string }[] = Array.isArray(cmsData?.items) && cmsData.items.length > 0
    ? cmsData.items.map((item: any) => ({
        question: item.question || item.q || "",
        answer: item.answer || item.a || "",
      }))
    : FAQ_ITEMS.map((item) => ({
        question: item.question,
        answer: item.answer,
      }));

  // Stagger reveal questions on scroll
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.premium,
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
        }
      );

      gsap.fromTo(
        itemRefs.current.filter(Boolean),
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.8, ease: EASE.out,
          stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: "top 82%", once: true },
        }
      );
    },
    { scope: sectionRef }
  );

  function toggle(index: number) {
    const isOpening = openIndex !== index;
    const prev = openIndex;
    setOpenIndex(isOpening ? index : null);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Smooth height collapse
    if (prev !== null && contentRefs.current[prev]) {
      gsap.to(contentRefs.current[prev], {
        height: 0, opacity: 0, duration: 0.35, ease: "power3.inOut",
      });
    }

    // Smooth height expand
    if (isOpening && contentRefs.current[index]) {
      const el = contentRefs.current[index]!;
      const autoHeight = el.scrollHeight;
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: autoHeight, opacity: 1, duration: 0.45, ease: "power4.out" }
      );
    }
  }

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-labelledby="faq-heading"
      className="relative overflow-hidden py-24 md:py-36 bg-[var(--color-background)] border-t border-[var(--color-border)]/50"
    >
      {/* Background glow washes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 35% at 75% 60%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 65%), radial-gradient(55% 35% at 25% 40%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 md:px-8">
        {/* Heading */}
        <div ref={headingRef} className="mb-20 text-center flex flex-col items-center">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
            <HelpCircle className="h-4 w-4" />
            <span>{eyebrow}</span>
          </p>
          <h2
            id="faq-heading"
            className="font-serif text-[clamp(2.5rem,5.5vw,3.75rem)] font-black leading-tight tracking-tight text-[var(--color-foreground)]"
          >
            {cmsData?.title ? (
              cmsData.title
            ) : (
              <>
                Frequently asked{" "}
                <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] bg-clip-text text-transparent italic font-medium">
                  questions
                </span>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-xl text-base text-[var(--color-muted)] leading-relaxed">
            {descriptionText}
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {questionsList.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                ref={(el) => { itemRefs.current[idx] = el; }}
                className={`overflow-hidden rounded-3xl border transition-all duration-500 ${
                  isOpen
                    ? "border-[var(--color-gold)]/40 bg-[var(--color-surface)] shadow-[0_12px_40px_rgba(201,165,90,0.06)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]/60 hover:border-[var(--color-gold)]/20"
                }`}
              >
                {/* Question Trigger */}
                <button
                  onClick={() => toggle(idx)}
                  className="flex w-full cursor-pointer items-center justify-between gap-5 px-6 py-5.5 text-left transition-colors focus-visible:outline-none"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <h3 className="font-serif text-base font-bold leading-snug text-[var(--color-foreground)] transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                    {item.question}
                  </h3>
                  <span
                    aria-hidden
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                      isOpen
                        ? "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-gold)] text-white shadow-md"
                        : "bg-[var(--color-border)] text-[var(--color-muted)]"
                    }`}
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>

                {/* Content Panel */}
                <div
                  ref={(el) => { contentRefs.current[idx] = el; }}
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  style={{
                    height: isOpen ? "auto" : 0,
                    overflow: "hidden",
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity 0.4s ease-out"
                  }}
                >
                  <div className="px-6 pb-6 pt-0">
                    <div className="h-px w-full bg-[var(--color-border)]/50 mb-5" />
                    <p className="text-sm leading-relaxed text-[var(--color-muted)] font-medium">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
