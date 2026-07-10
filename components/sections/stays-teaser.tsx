"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap";
import { Star, Users, Phone, ArrowUpRight, BedDouble } from "lucide-react";
import { SITE_CONFIG } from "@/data/site";
import { buildWhatsAppUrl } from "@/lib/utils";
import { trackContact } from "@/lib/analytics";
import { IconBrandAirbnb, IconBrandBooking } from "@tabler/icons-react";

const ROOMS_DATA = [
  {
    name: "Master Lagoon Suite",
    sleeps: 2,
    bed: "Super King Size",
    image: "/villa/optimized/room_01_img_01.webp",
    alt: "Master Lagoon Suite bedroom with canopy bed net",
    features: [
      "Panoramic views of Tangalle Lagoon",
      "Air-Conditioning & ceiling fan",
      "Luxury canopy net draping",
      "Spacious private hot-water bathroom",
      "Direct balcony access",
    ],
    price: "$95 / Night",
  },
  {
    name: "Garden Terrace Suite",
    sleeps: 2,
    bed: "Super King Size",
    image: "/villa/optimized/room_02_img_01.webp",
    alt: "Garden Terrace Suite bedroom with four-poster bed",
    features: [
      "Serene private garden views",
      "Air-Conditioning & cooling fan",
      "Handcrafted four-poster frame",
      "Private hot-water bathroom",
      "Direct veranda seating area",
    ],
    price: "$85 / Night",
  },
];

export function StaysTeaser({
  cmsData,
}: {
  cmsData?: { eyebrow?: string; title?: string; description?: string; ctaLabel?: string };
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow || "Accommodation";
  const title = cmsData?.title || "Your perfect stay awaits.";
  const descriptionText =
    cmsData?.description ||
    "Two premium designed master suites offering absolute comfort, lagoon breezes, and private gardens.";
  const ctaLabel = cmsData?.ctaLabel || "Get Best Rate on WhatsApp";

  const handleWhatsApp = (roomName?: string) => {
    const msg = roomName 
      ? `Hi! I'd like to check availability and rates for the ${roomName} at Lake View Villa Tangalle.`
      : `Hi! I'd like to check availability and rates at Lake View Villa Tangalle.`;
    const url = buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, msg);
    trackContact("whatsapp", url, `Stays Teaser ${roomName || "General"}`);
    setTimeout(() => window.open(url, "_blank", "noopener"), 100);
  };

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
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      const cards = cardsRef.current?.querySelectorAll("[data-room-card]");
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: "cubic-bezier(0.16, 1, 0.3, 1)",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "cubic-bezier(0.16, 1, 0.3, 1)",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 88%",
              once: true,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="stays"
      aria-labelledby="stays-heading"
      className="relative overflow-hidden py-24 md:py-32 bg-background border-t border-border/40"
    >
      {/* Background soft glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(65% 45% at 20% 30%, var(--color-gold-muted) 0%, transparent 65%), radial-gradient(55% 35% at 80% 70%, var(--color-gold-muted) 0%, transparent 65%)",
          opacity: 0.04
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-8">
        {/* Header Title & Ratings */}
        <div ref={headingRef} className="mb-20 text-center flex flex-col items-center">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block">
            {eyebrow}
          </span>
          <h2
            id="stays-heading"
            className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.08]"
          >
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-foreground/70 dark:text-foreground/80 text-wrap-balance">
            {descriptionText}
          </p>

          {/* Luxury rating badge - customized to fit sharp theme */}
          <div className="mt-8 inline-flex items-center gap-3.5 border border-border/60 bg-card px-5 py-2.5 shadow-sm">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-xs font-sans font-bold text-foreground">
              5.0 Avg Rating
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-accent/30" />
            <span className="text-xs font-sans font-medium text-foreground/60">
              Verified Lagoon Lodging
            </span>
          </div>
        </div>

        {/* Side-by-side Suite Cards with Double Bezel */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          {ROOMS_DATA.map((room) => (
            <article
              key={room.name}
              data-room-card
              className="group relative p-[1px] rounded-sm bg-gradient-to-b from-foreground/10 to-transparent dark:from-white/5 dark:to-transparent transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_24px_60px_rgba(11,32,39,0.08)]"
            >
              {/* Inner bezel core - sharp luxury geometry (rounded-sm) */}
              <div className="relative w-full h-full rounded-[3px] overflow-hidden bg-card border border-foreground/5 dark:border-white/5 flex flex-col justify-between">
                
                {/* Widescreen room preview */}
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <Image
                    src={room.image}
                    alt={room.alt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 45vw"
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />

                  {/* Absolute Badge tags - flat minimal layout */}
                  <span className="absolute left-6 top-6 inline-flex items-center justify-center bg-background/90 px-3.5 py-1.5 text-[9px] font-sans font-bold uppercase tracking-widest text-foreground border border-border/40 shadow-sm">
                    {room.price}
                  </span>
                  
                  <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 justify-center bg-background/90 px-3.5 py-1.5 text-[9px] font-sans font-bold uppercase tracking-widest text-foreground border border-border/40 shadow-sm">
                    <Users className="size-3 text-accent" /> Max {room.sleeps}
                  </span>
                </div>

                {/* Card details */}
                <div className="p-8 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-accent mb-2 tracking-tight">
                      {room.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs font-sans text-foreground/50 mb-6">
                      <BedDouble className="size-4 text-accent" />
                      <span>{room.bed}</span>
                    </div>

                    <ul className="space-y-3 font-sans text-xs text-foreground/75 dark:text-foreground/80">
                      {room.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 shrink-0 bg-accent mt-1.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Book this room card link CTA */}
                  <div className="mt-8 flex items-center justify-between border-t border-foreground/5 dark:border-white/5 pt-6">
                    <button
                      onClick={() => handleWhatsApp(room.name)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-accent hover:text-foreground dark:hover:text-white transition-colors group/link"
                    >
                      <span>Inquire Suite</span>
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom line hover effect */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-tidal via-sage to-gold transition-transform duration-500 group-hover:scale-x-100"
                />
              </div>
            </article>
          ))}
        </div>

        {/* Global Direct Bookings Panel (Aman Luxury styling) */}
        <div ref={ctaRef} className="mx-auto max-w-xl text-center">
          
          {/* Main WhatsApp reservation btn */}
          <button
            onClick={() => handleWhatsApp()}
            aria-label="Reserve via WhatsApp best rates"
            className="group relative inline-flex w-full items-center justify-between border border-accent bg-accent/5 px-8 py-5 text-xs font-bold uppercase tracking-widest text-accent transition-all duration-500 hover:bg-accent hover:text-background hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Phone className="size-4" /> {ctaLabel}
            </span>
            <ArrowUpRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* Secondary Third-Party Booking Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <button
              onClick={() => window.open("https://www.airbnb.com/l/CfK96vPd", "_blank", "noopener")}
              aria-label="Book on Airbnb"
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-sm border border-border/60 bg-card px-6 text-[10px] font-bold uppercase tracking-wider text-foreground/85 hover:border-accent hover:text-accent transition-all duration-300"
            >
              <IconBrandAirbnb className="h-4 w-4 text-[#FF5A5F]" />
              <span>Airbnb</span>
            </button>
            <button
              onClick={() => window.open("https://www.booking.com/Pulse-81UlHU", "_blank", "noopener")}
              aria-label="Book on Booking.com"
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-sm border border-border/60 bg-card px-6 text-[10px] font-bold uppercase tracking-wider text-foreground/85 hover:border-accent hover:text-accent transition-all duration-300"
            >
              <IconBrandBooking className="h-4 w-4 text-[#003580] dark:text-[#38bdf8]" />
              <span>Booking.com</span>
            </button>
          </div>

          <p className="mt-6 text-[10px] text-foreground/45 tracking-wide leading-relaxed">
            Booking directly with us guarantees early check-in, late check-out options, and priority support.
          </p>
        </div>
      </div>
    </section>
  );
}

