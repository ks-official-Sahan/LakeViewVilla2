"use client";

import { useRef, useState, useMemo } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap";
import { Plus, Minus, Search, HelpCircle, BookOpen, Coffee, MapPin, Compass } from "lucide-react";
import { FAQ_ITEMS } from "@/data/content";

type FAQItem = {
  question: string;
  answer: string;
  category: "general" | "suites" | "dining" | "location";
};

// Map original FAQ items to categories
const CATEGORIZED_FAQS: FAQItem[] = [
  {
    question: "Where is Lake View Villa Tangalle located?",
    answer: "Lake View Villa Tangalle is located on a serene lagoon in Tangalle, Sri Lanka. It provides panoramic lake views and easy access to beautiful local attractions such as Goyambokka Beach.",
    category: "location"
  },
  {
    question: "How do I book a stay at Lake View Villa Tangalle?",
    answer: "You can book a stay at Lake View Villa Tangalle by messaging us on WhatsApp for the best available rate and instant confirmation, or you can book directly through our Booking.com or Airbnb listings.",
    category: "general"
  },
  {
    question: "Is there air conditioning at the villa?",
    answer: "Yes, all bedrooms at Lake View Villa Tangalle are equipped with air conditioning to ensure your comfort during your stay in Sri Lanka.",
    category: "suites"
  },
  {
    question: "Are meals included, and is there a chef available?",
    answer: "While meals are not automatically included, Lake View Villa Tangalle offers a personalized chef service on request. Our chef can prepare delicious local Sri Lankan and international cuisine.",
    category: "dining"
  },
  {
    question: "Do you provide airport transfers to Tangalle?",
    answer: "Yes, Lake View Villa Tangalle offers convenient airport pickup services. Please contact us prior to your arrival to arrange your transfer directly to the villa.",
    category: "location"
  },
  {
    question: "What about Wi-Fi speed at the villa?",
    answer: "Lake View Villa Tangalle provides fast and reliable Wi-Fi with speeds of approximately 50+ Mbps throughout the property, making it ideal for remote workers and digital nomads.",
    category: "suites"
  },
  {
    question: "What are the best things to do near Lake View Villa Tangalle?",
    answer: "Guests at Lake View Villa Tangalle can easily visit Rekawa turtle beach, explore the Mulkirigala rock temple, take a Yala safari day trip, or see the Hummanaya blowhole.",
    category: "location"
  },
  {
    question: "Is Lake View Villa Tangalle a private villa?",
    answer: "Yes, Lake View Villa Tangalle is a private vacation rental. Guests enjoy exclusive access to the villa, ensuring a peaceful and serene lagoon stay without the crowds of large hotels.",
    category: "general"
  },
  {
    question: "Is Lake View Villa Tangalle family-friendly?",
    answer: "Absolutely. Lake View Villa Tangalle is family-friendly, offering spacious rooms, beautiful gardens, and safe surroundings for a memorable family vacation in Sri Lanka.",
    category: "general"
  },
  {
    question: "How far is the beach from Lake View Villa Tangalle?",
    answer: "Lake View Villa Tangalle is just minutes away from pristine sandy beaches, offering guests the perfect balance of a tranquil lagoon retreat and easy beach access.",
    category: "location"
  }
];

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "general", label: "General & Booking", icon: BookOpen },
  { id: "suites", label: "Suites & Amenities", icon: Compass },
  { id: "dining", label: "Dining & Services", icon: Coffee },
  { id: "location", label: "Location & Travel", icon: MapPin },
] as const;

export function FAQ({ cmsData }: { cmsData?: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const accordionContainerRef = useRef<HTMLDivElement>(null);
  
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const eyebrow = cmsData?.eyebrow || "Got Questions?";
  const descriptionText = cmsData?.description || "Everything you need to know about your stay at Lake View Villa.";

  // Normalize and filter questions list
  const filteredQuestions = useMemo(() => {
    let items: FAQItem[] = CATEGORIZED_FAQS;
    if (activeCategory !== "all") {
      items = items.filter(it => it.category === activeCategory);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        it => it.question.toLowerCase().includes(q) || it.answer.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, searchQuery]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "cubic-bezier(0.16, 1, 0.3, 1)",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
        }
      );
    },
    { scope: sectionRef }
  );

  const toggle = (index: number) => {
    const isOpening = openIndex !== index;
    const prev = openIndex;
    setOpenIndex(isOpening ? index : null);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Smooth height collapse using GSAP
    if (prev !== null && contentRefs.current[prev]) {
      gsap.to(contentRefs.current[prev], {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
    }

    // Smooth height expand using GSAP
    if (isOpening && contentRefs.current[index]) {
      const el = contentRefs.current[index]!;
      // Temporarily set height auto to measure scroll height
      el.style.height = "auto";
      const autoHeight = el.scrollHeight;
      el.style.height = "0px";

      gsap.to(el, {
        height: autoHeight,
        opacity: 1,
        duration: 0.45,
        ease: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-labelledby="faq-heading"
      className="relative overflow-hidden py-24 md:py-32 bg-background border-t border-border/40"
    >
      {/* Background glow washes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 35% at 75% 60%, var(--color-gold-muted) 0%, transparent 65%), radial-gradient(55% 35% at 25% 40%, var(--color-gold-muted) 0%, transparent 65%)",
          opacity: 0.04
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-8">
        
        {/* Header Block */}
        <div ref={headingRef} className="mb-16 text-center flex flex-col items-center">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block">
            {eyebrow}
          </span>
          <h2
            id="faq-heading"
            className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.08]"
          >
            Frequently Asked Questions.
          </h2>
          <p className="mt-6 max-w-xl text-sm text-foreground/70 dark:text-foreground/80 leading-relaxed">
            {descriptionText}
          </p>
        </div>

        {/* Custom Glass Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative">
          <div className="relative flex items-center bg-card border border-border/60 rounded-sm overflow-hidden shadow-sm">
            <Search className="absolute left-4 h-4 w-4 text-foreground/45 pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null); // Collapse active accordion on search
              }}
              className="w-full pl-12 pr-4 py-4 text-sm bg-transparent text-foreground placeholder:text-foreground/45 border-none focus:outline-none focus:ring-0 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Side-by-Side Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Topic selector (Left Master, Spans 4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-accent border-b border-border/60 pb-3 mb-2">
              Browse Topics
            </h3>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-none pb-2 lg:pb-0">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenIndex(null); // Collapse active accordion
                    }}
                    className={[
                      "flex items-center gap-3.5 px-4 py-3 rounded-sm text-left text-xs font-display font-bold uppercase tracking-wider border whitespace-nowrap transition-all duration-300 cursor-pointer",
                      isActive
                        ? "bg-accent border-accent text-background shadow-md"
                        : "bg-card border-border/60 text-foreground/75 hover:border-accent/30 hover:text-accent"
                    ].join(" ")}
                  >
                    <CatIcon className="h-4.5 w-4.5 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion Panels (Right Detail, Spans 8 columns) */}
          <div ref={accordionContainerRef} className="lg:col-span-8 flex flex-col gap-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    ref={(el) => { itemRefs.current[idx] = el; }}
                    className={[
                      "overflow-hidden rounded-sm border transition-all duration-500 bg-card",
                      isOpen
                        ? "border-accent/40 shadow-[0_15px_40px_rgba(11,32,39,0.06)]"
                        : "border-border/60 hover:border-accent/20"
                    ].join(" ")}
                  >
                    {/* Question Trigger */}
                    <button
                      onClick={() => toggle(idx)}
                      className="flex w-full cursor-pointer items-center justify-between gap-5 px-6 py-5.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      id={`faq-question-${idx}`}
                    >
                      <h4 className="font-display text-base font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-accent tracking-tight">
                        {item.question}
                      </h4>
                      <span
                        aria-hidden="true"
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-all duration-500",
                          isOpen
                            ? "border-accent/30 bg-accent/5 text-accent shadow-sm"
                            : "border-border/60 text-foreground/45"
                        ].join(" ")}
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
                      className="h-0 opacity-0 overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div className="h-px w-full bg-border/40 mb-5" />
                        <p className="font-sans text-sm leading-relaxed text-foreground/75 dark:text-foreground/80">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-card border border-border/60 rounded-sm shadow-sm flex flex-col items-center gap-3">
                <p className="font-display font-bold text-foreground/60 text-sm">No results match your criteria.</p>
                <button 
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                  }}
                  className="text-xs font-sans font-bold uppercase tracking-widest text-accent hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

