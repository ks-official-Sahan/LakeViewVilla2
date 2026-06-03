"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SectionReveal } from "@/components/motion/section-reveal";
import { FAQ_ITEMS } from "@/data/content";

interface FAQClientProps {
  cmsHero?: { headline?: string; subheadline?: string };
  cmsQuestions?: { question?: string; q?: string; answer?: string; a?: string }[];
}

export default function FAQPage({ cmsHero, cmsQuestions }: FAQClientProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const headline = cmsHero?.headline || "Frequently Asked Questions";
  const subheadline = cmsHero?.subheadline || "Find answers to common questions about Lake View Villa Tangalle";
  
  const questionsList = Array.isArray(cmsQuestions) && cmsQuestions.length > 0
    ? cmsQuestions.map((item: any) => ({
        question: item.question || item.q || "",
        answer: item.answer || item.a || "",
      }))
    : FAQ_ITEMS.map((item) => ({
        question: item.question,
        answer: item.answer,
      }));

  return (
    <>
      <div className="min-h-screen bg-[var(--color-background)]">
        {/* Header */}
        <div className="relative z-10 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] bg-clip-text text-transparent">
                    {headline}
                  </span>
                </h1>
                <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
                  {subheadline}
                </p>
              </div>
            </SectionReveal>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <SectionReveal>
              <div className="space-y-4">
                {questionsList.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-[var(--color-background)]/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:ring-inset"
                      aria-expanded={openItems.includes(index)}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <div className="flex items-center gap-4">
                        <HelpCircle
                          className="text-[var(--color-primary)] flex-shrink-0"
                          size={24}
                        />
                        <h3 className="text-lg font-semibold text-[var(--color-foreground)] pr-4">
                          {item.question}
                        </h3>
                      </div>
                      <motion.div
                        animate={{
                          rotate: openItems.includes(index) ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="text-[var(--color-muted)]" size={24} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openItems.includes(index) && (
                        <motion.div
                          id={`faq-answer-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-6 pt-2">
                            <div className="pl-10">
                              <p className="text-[var(--color-muted)] leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </SectionReveal>

            {/* Contact CTA */}
            <SectionReveal>
              <div className="mt-12 text-center">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-md">
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">
                    Still have questions?
                  </h2>
                  <p className="text-[var(--color-muted)] mb-6">
                    We're here to help! Contact us directly for personalized
                    assistance.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a
                      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP?.replace(
                        "+",
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold shadow-lg hover:opacity-90 transition-all duration-300"
                    >
                      <HelpCircle size={20} />
                      Ask on WhatsApp
                    </motion.a>
                    <motion.a
                      href="/visit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] font-semibold hover:bg-[var(--color-surface)] transition-all duration-300"
                    >
                      Contact Form
                    </motion.a>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </div>
    </>
  );
}
