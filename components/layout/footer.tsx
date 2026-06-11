"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap";
import { PROPERTY, SITE_CONFIG } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";
import { MapPin, Phone, Mail, ArrowUpRight, ExternalLink } from "lucide-react";

const NAV_COLS = [
  {
    heading: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/gallery", label: "Gallery" },
      { href: "/stays", label: "Stays" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { href: "/visit", label: "Visit Us" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const year = new Date().getFullYear();

  const whatsappUrl = buildWhatsAppUrl(
    SITE_CONFIG.whatsappNumber,
    "Hi! I'd like to check availability and rates at Lake View Villa Tangalle."
  );

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const cols = footerRef.current?.querySelectorAll<HTMLElement>("[data-footer-col]");
      if (!cols) return;
      gsap.fromTo(
        cols,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 92%",
            once: true,
          },
        }
      );
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      role="contentinfo"
      aria-labelledby="footer-heading"
      className="relative isolate overflow-hidden bg-[var(--color-teal-dark)] text-white/80 border-t border-white/5"
    >
      {/* Luxury Lagoon background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 12% 0%, rgba(26,92,94,0.18) 0%, transparent 60%), radial-gradient(50% 40% at 88% 20%, rgba(201,165,90,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Top gold hairline gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/40 to-transparent" />

      <div className="lv-container relative">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24">
          
          {/* Brand/About Block */}
          <div data-footer-col className="md:col-span-5 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label="Lake View Villa home"
            >
              <div className="relative overflow-hidden rounded-xl border border-white/10 p-0.5 transition-transform duration-300 group-hover:scale-105 bg-black/10">
                <Image
                  src="/logo.png"
                  alt="Lake View Villa Tangalle logo"
                  width={38}
                  height={38}
                  className="rounded-lg object-cover"
                />
              </div>
              <h2
                id="footer-heading"
                className="font-[var(--font-display)] text-lg font-bold tracking-wider text-white"
              >
                LAKE VIEW VILLA
              </h2>
            </Link>

            <p className="mt-5 max-w-sm font-[var(--font-sans)] text-xs leading-relaxed text-white/55">
              A private luxury villa nested beside the tranquil lagoon in Tangalle, Sri Lanka — where tropical nature merges seamlessly with premium design.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3 font-[var(--font-sans)]">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Book via WhatsApp"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-charcoal)] transition-all duration-300"
              >
                <Phone className="h-3.5 w-3.5" />
                WhatsApp Book
                <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
              </a>

              {SITE_CONFIG.googleMapsUrl && (
                <a
                  href={SITE_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in Google Maps"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Maps
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Contact details */}
          <div data-footer-col className="md:col-span-3 lg:col-span-4 md:pl-4">
            <h3 className="mb-5 text-[10px] font-[var(--font-sans)] font-bold uppercase tracking-[0.2em] text-white/40">
              Address & Contact
            </h3>
            <address className="not-italic space-y-4 font-[var(--font-sans)] text-xs text-white/60">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]/80" />
                <span className="leading-relaxed">
                  <span itemProp="streetAddress">19/6 Julgahawalagoda</span>,{" "}
                  <span itemProp="addressLocality">Kadurupokuna South</span>,{" "}
                  <span itemProp="addressCountry">Tangalle, Sri Lanka</span>
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[var(--color-gold)]/80" />
                <a
                  href={`tel:${SITE_CONFIG.whatsappNumber?.replace(/\s+/g, "") ?? "+94701164056"}`}
                  className="transition-colors hover:text-white leading-none"
                >
                  {SITE_CONFIG.whatsappNumberText ?? "+94 70 116 4056"}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[var(--color-gold)]/80" />
                <a
                  href={`mailto:${PROPERTY.email}`}
                  className="transition-colors hover:text-white leading-none"
                >
                  {PROPERTY.email}
                </a>
              </p>
            </address>
          </div>

          {/* Navigation Links Grid */}
          {NAV_COLS.map((col) => (
            <nav
              key={col.heading}
              data-footer-col
              aria-label={`${col.heading} navigation`}
              className="md:col-span-2 lg:col-span-2"
            >
              <h3 className="mb-5 text-[10px] font-[var(--font-sans)] font-bold uppercase tracking-[0.2em] text-white/40">
                {col.heading}
              </h3>
              <ul className="space-y-3 font-[var(--font-sans)] text-xs">
                {col.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-white/60 transition-colors hover:text-[var(--color-gold)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-8 font-[var(--font-sans)] text-[10px] tracking-wide text-white/35 md:flex-row">
          <p>
            <Link href="/" className="transition-colors hover:text-white/60">
              Sahan Sachintha
            </Link>{" "}
            &copy; {year} Lake View Villa Tangalle. All rights reserved.
          </p>
          <p className="opacity-70">
            Designed for premium speed, accessibility & serene luxury.
          </p>
        </div>
      </div>
    </footer>
  );
}
