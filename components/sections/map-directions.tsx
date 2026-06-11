"use client";

import { useRef } from "react";
import { Compass, Navigation, Phone, ArrowUpRight } from "lucide-react";
import { SITE_CONFIG, DIRECTIONS } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";
import { trackContact, trackMapOpen } from "@/lib/analytics";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";
import { gsap, useGSAP } from "@/lib/gsap";

export function MapDirections() {
  const sectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const handleGetDirections = () => {
    const url = SITE_CONFIG.googleMapsUrl;
    trackMapOpen(url, "Get directions");
    setTimeout(() => window.open(url, "_blank", "noopener"), 120);
  };

  const handleCallForLocation = () => {
    const message =
      "Hi! I need the exact pin location for Lake View Villa Tangalle. Could you please share the precise location?";
    const url = buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, message);
    trackContact("whatsapp", url, "Chat on WhatsApp");
    setTimeout(() => window.open(url, "_blank", "noopener"), 120);
  };

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      // Map canvas fade & zoom reveal
      gsap.fromTo(
        mapContainerRef.current,
        { opacity: 0, scale: 0.98, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          ease: "cubic-bezier(0.16, 1, 0.3, 1)",
          scrollTrigger: {
            trigger: mapContainerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      // Staggered steps entrance
      const steps = stepsContainerRef.current?.querySelectorAll("[data-step-card]");
      if (steps?.length) {
        gsap.fromTo(
          steps,
          { opacity: 0, y: 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: "cubic-bezier(0.16, 1, 0.3, 1)",
            scrollTrigger: {
              trigger: stepsContainerRef.current,
              start: "top 85%",
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
      id="location"
      className="relative border-t border-border/40 bg-background py-24 md:py-32 overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 80% 50%, var(--color-gold-muted) 0%, transparent 60%)",
          opacity: 0.03
        }}
      />

      <div className="lv-container relative">
        {/* Header Block */}
        <div className="mb-20 text-center flex flex-col items-center">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block flex items-center gap-2">
            <Compass className="h-4 w-4" /> Location
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.05]">
            Find your way to paradise.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm text-foreground/75 dark:text-foreground/85 leading-relaxed">
            Located on a serene lagoon in Tangalle — easy to reach and perfectly positioned for exploring Sri Lanka's beautiful south coast.
          </p>
        </div>

        {/* 100% Stacked Asymmetric Layout */}
        <div className="flex flex-col gap-16">
          
          {/* Large Wide Map Canvas with Sharp Geometry */}
          <div 
            ref={mapContainerRef}
            className="relative w-full aspect-[16/8] md:aspect-[21/9] min-h-[350px] overflow-hidden rounded-sm border border-border/60 shadow-[0_24px_50px_rgba(11,32,39,0.08)] bg-card"
          >
            <Map
              viewport={{ center: [80.7811559, 6.0173643], zoom: 15 }}
              className="w-full h-full"
            >
              <MapMarker longitude={80.7811559} latitude={6.0173643}>
                <MarkerContent className="!w-6 !h-6 overflow-visible">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <div className="w-6 h-6 bg-accent border-2 border-background shadow-lg relative z-10 animate-pulse" />
                    <div className="absolute w-6 h-6 bg-accent/40 animate-ping" />

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col items-center gap-1.5 bg-card border border-border rounded-sm px-4 py-3 shadow-2xl pointer-events-auto w-max z-50">
                      <span className="text-xs font-display font-bold text-foreground tracking-wide whitespace-nowrap">
                        Lake View Villa
                      </span>
                      <a
                        href={SITE_CONFIG.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-accent hover:opacity-80 transition-opacity font-bold"
                      >
                        Open in Google Maps
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </MarkerContent>
              </MapMarker>
              <MapControls position="bottom-right" />
            </Map>
          </div>

          {/* Staggered Steps Timeline underneath map */}
          <div className="flex flex-col gap-10">
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/60 pb-4">
              Arriving at Lake View Villa
            </h3>
            
            <div 
              ref={stepsContainerRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {DIRECTIONS.map((direction, index) => {
                // Stagger vertical offsets on desktop
                const verticalStaggerClass = 
                  index % 2 === 1 
                    ? "lg:translate-y-6" 
                    : "lg:-translate-y-2";

                return (
                  <article
                    key={index}
                    data-step-card
                    className={[
                      "group relative p-[1px] rounded-sm bg-gradient-to-b from-foreground/10 to-transparent dark:from-white/5 dark:to-transparent hover:shadow-[0_15px_35px_rgba(11,32,39,0.06)] hover:scale-[1.01] transition-all duration-350",
                      verticalStaggerClass
                    ].join(" ")}
                  >
                    {/* Inner core card */}
                    <div className="relative w-full h-full rounded-[3px] bg-card p-6 md:p-8 border border-foreground/5 dark:border-white/5 flex flex-col justify-between min-h-[180px]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent font-display text-sm font-black text-background shadow-md">
                        {index + 1}
                      </span>
                      <p className="mt-6 font-sans text-sm leading-relaxed text-foreground/75 dark:text-foreground/85">
                        {direction}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Action CTAs & Transfer Notice Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mt-6">
            {/* CTA Buttons */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGetDirections}
                className="group relative inline-flex w-full items-center justify-between border border-accent bg-accent/5 px-8 py-5 text-xs font-bold uppercase tracking-widest text-accent transition-all duration-500 hover:bg-accent hover:text-background hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Navigation className="h-4 w-4" /> Open in Google Maps
                </span>
                <ArrowUpRight className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={handleCallForLocation}
                className="group relative inline-flex w-full items-center justify-between border border-border bg-card px-8 py-5 text-xs font-bold uppercase tracking-widest text-foreground/80 transition-all duration-500 hover:border-accent hover:text-accent hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> WhatsApp for Precise Pin
                </span>
                <ArrowUpRight className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Info notice block */}
            <div className="p-6 bg-card border border-border/60 rounded-sm shadow-sm">
              <h4 className="font-display text-sm font-bold text-foreground mb-2">
                Lagoon Access & Transfer
              </h4>
              <p className="font-sans text-xs leading-relaxed text-foreground/60 dark:text-foreground/75">
                We are glad to arrange custom luxury sedan or airport shuttle transfers directly to the property doors. Reach out to coordinate timings.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

