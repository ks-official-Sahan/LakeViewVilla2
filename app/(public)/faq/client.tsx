"use client";

import { useMemo, useState, startTransition, ViewTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionReveal } from "@/components/motion/section-reveal";
import { FAQ_ITEMS, SITE_CONFIG } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";

interface FAQClientProps {
  cmsHero?: { headline?: string; subheadline?: string };
  cmsQuestions?: { question?: string; q?: string; answer?: string; a?: string }[];
}

/* ---------- dynamic categorizer ---------- */
function inferCategory(question: string): string {
  const q = question.toLowerCase();
  if (/where|location|beach|attraction|far|goyambokka|attractions/i.test(q)) {
    return "Location & Area";
  }
  if (/book|price|rate|whatsapp|private|airport|transfer|wi-fi|wifi|family|nomad/i.test(q)) {
    return "Booking & Services";
  }
  if (/conditioning|ac|meals|chef|dining|cuisine|food|kitchen/i.test(q)) {
    return "Amenities & Dining";
  }
  return "General";
}

/* ---------- custom inline SVGs ---------- */
const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-accent shrink-0" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-foreground/50 transition-transform duration-300" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-foreground/40" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
  </svg>
);

export default function FAQPage({ cmsHero, cmsQuestions }: FAQClientProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (index: number) => {
    startTransition(() => {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    });
  };

  const headline = cmsHero?.headline || "Frequently Asked Questions";
  const subheadline = cmsHero?.subheadline || "Find answers to common questions about Lake View Villa Tangalle";
  
  const questionsList = useMemo(() => {
    return Array.isArray(cmsQuestions) && cmsQuestions.length > 0
      ? cmsQuestions.map((item: any) => ({
          question: item.question || item.q || "",
          answer: item.answer || item.a || "",
        }))
      : FAQ_ITEMS.map((item) => ({
          question: item.question,
          answer: item.answer,
        }));
  }, [cmsQuestions]);

  const enriched = useMemo(() => {
    return questionsList.map((item) => ({
      ...item,
      category: inferCategory(item.question),
    }));
  }, [questionsList]);

  const categories = useMemo(() => {
    const unique = [...new Set(enriched.map((i) => i.category))].sort(
      (a, b) => a.localeCompare(b)
    );
    return ["All", ...unique];
  }, [enriched]);

  const filtered = useMemo(() => {
    return enriched.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [enriched, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen relative overflow-hidden text-foreground bg-background">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 40% at 20% 10%, var(--color-primary) 0%, transparent 70%), radial-gradient(50% 30% at 80% 20%, var(--color-gold-muted) 0%, transparent 70%)",
          opacity: 0.04
        }}
      />

      {/* Header */}
      <div className="relative z-10 pt-36 pb-12">
        <div className="container mx-auto px-6 text-center flex flex-col items-center">
          <SectionReveal>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block">
              Information Desk
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              {headline}
            </h1>
            <p className="text-sm md:text-base text-foreground/70 dark:text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              {subheadline}
            </p>
          </SectionReveal>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="relative z-10 container mx-auto px-6 mb-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between border-b border-border/40 pb-8">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const count = cat === "All" ? enriched.length : enriched.filter((x) => x.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenItems([]);
                  }}
                  className={[
                    "px-4.5 py-2 text-[10px] font-display font-bold uppercase tracking-wider transition-all duration-300 rounded-sm border cursor-pointer",
                    isActive
                      ? "bg-accent border-accent text-background shadow-md"
                      : "border-border/60 bg-card text-foreground/70 hover:border-accent/30 hover:text-accent"
                  ].join(" ")}
                >
                  <span>{cat}</span>
                  <span className="ml-1.5 opacity-60 font-mono text-[9px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenItems([]);
              }}
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2 bg-card border border-border/60 text-xs text-foreground placeholder:text-foreground/35 rounded-sm focus:outline-none focus:border-accent transition-colors shadow-sm"
            />
          </div>

        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="relative z-10 container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <SectionReveal>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, index) => {
                  const isOpen = openItems.includes(index);
                  return (
                    <motion.div
                      key={item.question}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-sm border border-border/60 bg-card overflow-hidden shadow-sm hover:border-accent/15 transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-foreground/[0.01] transition-colors focus:outline-none"
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${index}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <HelpIcon />
                          <h3 className="text-xs md:text-sm font-display font-bold uppercase tracking-wider text-foreground pr-4">
                            {item.question}
                          </h3>
                        </div>
                        <div className={isOpen ? "rotate-180" : ""}>
                          <ChevronDownIcon />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <ViewTransition enter="slide-up" exit="slide-down">
                          <motion.div
                            id={`faq-answer-${index}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-1 border-t border-border/40 bg-foreground/[0.005]">
                              <div className="pl-9">
                                <p className="text-xs md:text-sm text-foreground/75 dark:text-foreground/80 leading-relaxed max-w-3xl">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                          </ViewTransition>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border border-border/60 p-12 text-center rounded-sm"
                >
                  <p className="text-sm text-foreground/50 font-sans">
                    No matching questions found. Try search keywords like "airport", "wifi", or "beach".
                  </p>
                </motion.div>
              )}
            </div>
          </SectionReveal>

          {/* Contact CTA */}
          <SectionReveal>
            <div className="mt-16 text-center">
              <div className="rounded-sm border border-border/60 bg-card p-8 md:p-10 shadow-lg max-w-2xl mx-auto">
                <h2 className="font-display text-xl font-bold text-foreground mb-3 tracking-tight">
                  Still have questions?
                </h2>
                <p className="text-xs text-foreground/60 mb-6 leading-relaxed">
                  We're here to help! Message us directly on WhatsApp or complete our inquiry form for assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, "Hi! I have some questions about my stay at Lake View Villa Tangalle.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-sm border border-accent bg-accent/5 text-xs font-bold uppercase tracking-widest text-accent transition-all duration-300 hover:bg-accent hover:text-background shadow-sm cursor-pointer"
                  >
                    <HelpIcon />
                    Ask on WhatsApp
                  </a>
                  <a
                    href="/visit"
                    className="inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-sm border border-border/60 bg-card text-xs font-bold uppercase tracking-widest text-foreground transition-all duration-300 hover:bg-foreground/[0.02] shadow-sm cursor-pointer"
                  >
                    Contact Form
                  </a>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}
