"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Phone, Compass, ArrowRight } from "lucide-react";
import { SITE_CONFIG, DIRECTIONS } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SectionReveal } from "@/components/motion/section-reveal";
import { trackContact, trackMapOpen } from "@/lib/analytics";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";

export function MapDirections() {
  const mapsEmbedSrc = SITE_CONFIG.googleMapsUrl;

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

  return (
    <SectionReveal>
      <section
        id="location"
        className="relative border-t border-[var(--color-border)]/50 bg-[var(--color-background)] py-24 md:py-36 overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 80% 50%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 60%)"
          }}
        />

        <div className="container mx-auto max-w-6xl px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20 text-center flex flex-col items-center"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
              <Compass className="h-4 w-4" />
              <span>Location</span>
            </p>
            <h2 className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] font-black tracking-tight text-[var(--color-foreground)] leading-tight">
              Find your way to paradise
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-[var(--color-muted)] leading-relaxed">
              Located on a serene lagoon in Tangalle — easy to reach and perfectly positioned for exploring Sri Lanka's beautiful south coast.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Map Canvas Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div
                className="relative mx-auto aspect-square max-w-lg overflow-hidden rounded-[2.5rem] shadow-[0_24px_60px_rgba(201,165,90,0.08)] border border-[var(--color-border)]/50 md:max-w-none md:rounded-full h-full min-h-[300px]"
              >
                <Map
                  viewport={{ center: [80.7811559, 6.0173643], zoom: 15 }}
                  className="w-full h-full"
                >
                  <MapMarker longitude={80.7811559} latitude={6.0173643}>
                    <MarkerContent className="!w-5 !h-5 overflow-visible">
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-[var(--color-gold)] border-2 border-white shadow-lg relative z-10 animate-pulse" />
                        <div className="absolute w-5 h-5 rounded-full bg-[var(--color-gold)]/50 animate-ping" />

                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex flex-col items-center gap-1.5 bg-[var(--color-surface)]/95 border border-[var(--color-border)] rounded-2xl px-4 py-3 shadow-2xl pointer-events-auto w-max z-50">
                          <span className="text-[12px] font-semibold text-[var(--color-foreground)] tracking-wide whitespace-nowrap">
                            Lake View Villa
                          </span>
                          <a
                            href={SITE_CONFIG.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[var(--color-gold)] hover:opacity-80 transition-opacity"
                          >
                            Open in Google Maps
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          </a>
                        </div>
                      </div>
                    </MarkerContent>
                  </MapMarker>
                  <MapControls position="bottom-right" />
                </Map>
              </div>
            </motion.div>

            {/* Directions Listing */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: 0.1 }}
              className="flex flex-col justify-between"
            >
              <div>
                <h3 className="mb-8 font-serif text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
                  Arriving at Lake View Villa
                </h3>
                <div className="space-y-6">
                  {DIRECTIONS.map((direction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      className="flex items-start gap-4 p-4 rounded-2xl border border-[var(--color-border)]/30 bg-[var(--color-surface)]/50 transition-colors hover:border-[var(--color-border)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-gold)] font-serif text-sm font-black text-white shadow-md">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-[var(--color-muted)]">{direction}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={handleGetDirections}
                  className="w-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] py-6 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-transform duration-300 hover:scale-102 cursor-pointer"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  <span>Open in Google Maps</span>
                </Button>

                <Button
                  onClick={handleCallForLocation}
                  variant="outline"
                  className="w-full rounded-full border-[var(--color-primary)]/40 py-6 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)] transition-all duration-300 hover:scale-102 cursor-pointer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  <span>WhatsApp for Pin</span>
                </Button>
              </div>

              <div className="mt-8 rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-6 shadow-sm">
                <h4 className="font-serif text-base font-bold text-[var(--color-foreground)] mb-2">
                  Lagoon Access & Transfer
                </h4>
                <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                  We are glad to arrange custom luxury sedan or airport shuttle transfers directly to the property doors. Reach out to coordinate timings.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
