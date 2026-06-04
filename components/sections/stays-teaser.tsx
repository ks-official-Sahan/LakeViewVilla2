"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap, ScrollTrigger, EASE, DURATION } from "@/lib/gsap";
import { Star, Users, Phone, ArrowRight, ArrowUpRight } from "lucide-react";
import { BOOKING_FACTS, STAYS_INTRO, SITE_CONFIG } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";
import { trackContact } from "@/lib/analytics";
import { IconBrandAirbnb, IconBrandBooking } from "@tabler/icons-react";

export function StaysTeaser({ cmsData }: { cmsData?: { eyebrow?: string; title?: string; description?: string; ctaLabel?: string; items?: any[] } }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow || "Accommodation";
  const title = cmsData?.title || "Your perfect stay awaits";
  const descriptionText = cmsData?.description || STAYS_INTRO;
  const ctaLabel = cmsData?.ctaLabel || "Get Best Rate on WhatsApp";

  const roomsList = Array.isArray(cmsData?.items) && cmsData.items.length > 0
    ? cmsData.items
    : BOOKING_FACTS.rooms;

  const handleWhatsApp = () => {
    const msg = `Hi! I'd like to enquire about availability and rates for Lake View Villa Tangalle. Could you please share the best available rate?`;
    const url = buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, msg);
    trackContact("whatsapp", url, "Stays Teaser CTA");
    setTimeout(() => window.open(url, "_blank", "noopener"), 120);
  };

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      gsap.fromTo(headingRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.premium,
        scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
      });

      const cards = cardsRef.current?.querySelectorAll<HTMLElement>("[data-room]");
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.12,
            ease: EASE.premium,
            scrollTrigger: { trigger: cardsRef.current, start: "top 82%", once: true },
          }
        );
      }

      gsap.fromTo(ctaRef.current, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: EASE.out, delay: 0.1,
        scrollTrigger: { trigger: ctaRef.current, start: "top 88%", once: true },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="stays"
      aria-labelledby="stays-heading"
      className="relative overflow-hidden py-24 md:py-36 bg-[var(--color-background)] border-t border-[var(--color-border)]/50"
    >
      {/* Background radial washes */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(65% 45% at 20% 30%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 65%), radial-gradient(55% 35% at 80% 70%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 65%)"
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        {/* Title Block */}
        <div ref={headingRef} className="mb-20 text-center flex flex-col items-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
            {eyebrow}
          </p>
          <h2
            id="stays-heading"
            className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] font-black tracking-tight text-[var(--color-foreground)] leading-tight"
          >
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-[var(--color-muted)] leading-relaxed">
            {descriptionText}
          </p>

          {/* Rating Badge */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--color-border)]/50 bg-[var(--color-surface)] px-6 py-2.5 shadow-sm">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[var(--color-gold)] text-[var(--color-gold)]" />
              ))}
            </div>
            <span className="text-sm font-bold text-[var(--color-foreground)]">
              {BOOKING_FACTS.reviewMetrics?.average}
            </span>
            <div className="h-1 w-1 rounded-full bg-[var(--color-muted)]" />
            <span className="text-sm text-[var(--color-muted)]">
              {BOOKING_FACTS.reviewMetrics?.count} Verified Reviews
            </span>
          </div>
        </div>

        {/* Suite Cards Grid */}
        <div ref={cardsRef} className="mb-16 grid gap-8 md:grid-cols-2">
          {roomsList?.map((room: any, i: number) => (
            <article
              key={room.name}
              data-room
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-8 shadow-sm transition-all duration-500 hover:border-[var(--color-gold)]/40 hover:shadow-[0_16px_50px_rgba(201,165,90,0.08)] hover:-translate-y-1.5"
            >
              {/* Glow backdrop on hover */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Card Header details */}
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--color-foreground)] transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                    {room.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-muted)]">
                    <Users className="h-4 w-4 text-[var(--color-gold)]" />
                    <span className="font-medium">Sleeps {room.sleeps} Guests</span>
                  </div>
                </div>
                <span className="font-serif text-2xl font-black text-[var(--color-foreground)]/[0.05] group-hover:text-[var(--color-gold)]/[0.08] transition-colors duration-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Feature Listing */}
              <ul className="space-y-3.5 mb-8">
                {room.features?.slice(0, 5).map((f: any, fi: number) => (
                  <li key={fi} className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom arrow CTA link details */}
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] opacity-0 transform translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                <span>View Suite Details</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>

              {/* Gold bottom accent line */}
              <span aria-hidden
                className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] transition-transform duration-500 group-hover:scale-x-100"
              />
            </article>
          ))}
        </div>

        {/* CTA booking controls */}
        <div ref={ctaRef} className="mx-auto max-w-xl">
          {/* Primary WhatsApp Link */}
          <button
            onClick={handleWhatsApp}
            aria-label="Book best rate on WhatsApp"
            className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-5 font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-emerald-500/35 hover:scale-102"
          >
            <Phone className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            <span>{ctaLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary Airbnb/Booking.com links */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              onClick={() => window.open("https://www.airbnb.com/l/CfK96vPd", "_blank", "noopener")}
              aria-label="Book via Airbnb"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--color-border)]/50 bg-[var(--color-surface)] px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] shadow-sm transition-all duration-300 hover:border-[#FF5A5F]/40 hover:text-[#FF5A5F] hover:shadow-md hover:scale-102"
            >
              <IconBrandAirbnb className="h-4.5 w-4.5" />
              <span>Airbnb</span>
            </button>
            <button
              onClick={() => window.open("https://www.booking.com/Pulse-81UlHU", "_blank", "noopener")}
              aria-label="Book via Booking.com"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--color-border)]/50 bg-[var(--color-surface)] px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] shadow-sm transition-all duration-300 hover:border-[#003580]/40 hover:text-[#003580] hover:shadow-md dark:hover:text-[#38bdf8] hover:scale-102"
            >
              <IconBrandBooking className="h-4.5 w-4.5" />
              <span>Booking.com</span>
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-[var(--color-muted)] tracking-wide">
            Instant messaging directly connects you with the villa management team for immediate check-ins.
          </p>
        </div>
      </div>
    </section>
  );
}
