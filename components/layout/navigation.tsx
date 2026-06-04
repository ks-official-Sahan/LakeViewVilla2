"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Menu, X, Phone, Compass, Sun, Moon } from "lucide-react";
import ThemeSwitch from "../theme/theme-switch";
import { SITE_CONFIG } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/stays", label: "Stays" },
  { href: "/blog", label: "Blog" },
  { href: "/visit", label: "Visit" },
  { href: "/faq", label: "FAQ" },
];

export function Navigation() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // GSAP entrance on mount
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: "power4.out", delay: 0.2 }
    );
  }, []);

  // GSAP scroll behavior
  useGSAP(() => {
    if (!headerRef.current) return;

    const trigger = ScrollTrigger.create({
      start: "top -40px",
      onUpdate: (self) => {
        const isScrolledPast = self.scroll() > 40;
        setScrolled(isScrolledPast);

        if (isOpen) {
          gsap.to(headerRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
          return;
        }

        // Hide navigation on scroll down, show on scroll up
        gsap.to(headerRef.current, {
          y: self.direction === 1 && self.scroll() > 120 ? -120 : 0,
          duration: 0.4,
          ease: "power3.out",
        });
      },
    });

    return () => trigger.kill();
  }, [isOpen]);

  useEffect(() => setIsOpen(false), [pathname]);

  // Stagger reveal mobile navigation links
  useEffect(() => {
    if (!drawerRef.current) return;
    if (isOpen) {
      gsap.fromTo(
        drawerRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power4.out" }
      );
      
      const links = drawerRef.current.querySelectorAll("[data-mobile-nav-link]");
      gsap.fromTo(
        links,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [isOpen]);

  const isHero = !scrolled && !isOpen;
  const whatsappUrl = buildWhatsAppUrl(
    SITE_CONFIG.whatsappNumber,
    "Hi! I'd like to book Lake View Villa Tangalle."
  );

  return (
    <>
      <header
        ref={headerRef}
        role="banner"
        className="fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out py-3"
      >
        <div 
          className={`mx-auto flex h-[70px] max-w-6xl items-center justify-between px-6 transition-all duration-500 ease-out ${
            scrolled || isOpen
              ? "rounded-full border border-[var(--color-border)]/50 bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] md:max-w-5xl"
              : "border border-transparent bg-transparent shadow-none"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            transitionTypes={["spa-page"]}
            className="group flex items-center gap-3"
            aria-label="Lake View Villa — Home"
          >
            <div className="relative overflow-hidden rounded-full border border-[var(--color-gold)]/20 p-0.5 transition-transform duration-500 group-hover:rotate-12">
              <Image
                src="/logo.png"
                alt="Lake View Villa"
                width={36}
                height={36}
                className="h-[34px] w-[34px] rounded-full object-cover"
                priority
              />
            </div>
            <span
              className={`font-serif font-bold tracking-tight sm:block transition-colors duration-300 text-base ${
                isHero ? "text-white drop-shadow-md" : "text-[var(--color-foreground)]"
              }`}
            >
              Lake View <span className="italic text-[var(--color-gold)] font-medium">Villa</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Primary navigation"
            className={`hidden items-center gap-1 rounded-full border px-2 py-1.5 transition-all duration-500 md:flex ${
              isHero 
                ? "border-white/10 bg-white/5 backdrop-blur-md" 
                : "border-[var(--color-border)]/40 bg-[var(--color-background)]/50"
            }`}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  transitionTypes={["spa-page"]}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                    active
                      ? "text-[var(--color-gold)]"
                      : isHero
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-[var(--color-foreground)] hover:bg-[var(--color-primary)]/8 hover:text-[var(--color-primary)]"
                  }`}
                >
                  {label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-gold)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden items-center gap-4 md:flex">
            <div className={`rounded-full p-1 border transition-all duration-500 ${
              isHero ? "border-white/10 bg-white/5" : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}>
              <ThemeSwitch />
            </div>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Book via WhatsApp"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:shadow-[0_4px_20px_rgba(var(--color-gold-rgb),0.35)] hover:scale-102"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
              <span>Book Now</span>
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 md:hidden ${
              isHero 
                ? "border-white/10 bg-white/5 text-white hover:bg-white/15" 
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-primary)]/10"
            }`}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {isOpen && (
        <div
          ref={drawerRef}
          className="fixed inset-x-4 top-[96px] z-50 rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/90 p-6 shadow-2xl backdrop-blur-2xl md:hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-2"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  data-mobile-nav-link
                  transitionTypes={["spa-page"]}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-widest transition-all ${
                    active
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-foreground)] hover:bg-[var(--color-primary)]/8"
                  }`}
                >
                  <span>{label}</span>
                  <Compass className={`h-4 w-4 opacity-40 transition-transform duration-500 ${active ? "rotate-45 opacity-100 text-[var(--color-gold)]" : ""}`} />
                </Link>
              );
            })}
            
            <div className="h-px w-full bg-[var(--color-border)]/50 my-2" data-mobile-nav-link />
            
            <div className="flex items-center justify-between gap-4" data-mobile-nav-link>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
                <ThemeSwitch />
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[var(--color-primary)]/20"
              >
                <Phone className="h-4 w-4" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
