"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { Menu, X, Phone, Compass } from "lucide-react";
import ThemeSwitch from "../theme/theme-switch";
import { SITE_CONFIG } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/stays", label: "Stays" },
  { href: "/visit", label: "Visit" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export function Navigation() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  // ── Smart scroll hide/show ───────────────────────────────────────────────
  useGSAP(() => {
    if (!headerRef.current) return;

    const showHeader = () => {
      if (!isHidden.current) return;
      isHidden.current = false;
      gsap.to(headerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const hideHeader = () => {
      if (isHidden.current) return;
      isHidden.current = true;
      gsap.to(headerRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Scrolled past 40px threshold
      setScrolled(scrollY > 40);

      if (isOpen) {
        showHeader();
        return;
      }

      if (scrollY > 120) {
        if (scrollY > lastScrollY.current + 8) {
          // scroll down -> hide
          hideHeader();
        } else if (scrollY < lastScrollY.current - 15) {
          // scroll up -> show
          showHeader();
        }
      } else {
        showHeader();
      }

      lastScrollY.current = scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  // Close drawer on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Mobile drawer stagger animations
  useEffect(() => {
    if (!drawerRef.current || !isOpen) return;

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
  }, [isOpen]);

  const whatsappUrl = buildWhatsAppUrl(
    SITE_CONFIG.whatsappNumber,
    "Hi! I'd like to book Lake View Villa Tangalle."
  );

  return (
    <>
      <header
        ref={headerRef}
        role="banner"
        className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-all duration-300"
      >
        {/* Floating pill navigation shell */}
        <div
          className={[
            "w-full max-w-5xl h-14 rounded-full flex items-center justify-between px-6 transition-all duration-500 ease-out border",
            scrolled || isOpen
              ? "bg-background/85 dark:bg-[var(--glass-2-bg)] border-foreground/10 dark:border-white/[0.08] text-foreground dark:text-white backdrop-blur-2xl shadow-[0_12px_40px_rgba(11,32,39,0.18)]"
              : "bg-black/55 border-white/[0.12] text-white backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
          ].join(" ")}
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 shrink-0"
            aria-label="Lake View Villa — Home"
          >
            <div className="relative overflow-hidden rounded-full border border-[var(--color-gold)]/30 p-0.5 transition-transform duration-500 group-hover:rotate-12 bg-black/20">
              <Image
                src="/logo.png"
                alt="Lake View Villa"
                width={30}
                height={30}
                className="h-[28px] w-[28px] rounded-full object-cover"
                priority
              />
            </div>
            <span className="hidden sm:flex items-baseline gap-1 font-[var(--font-display)] font-bold text-sm tracking-wide">
              Lake View{" "}
              <span className="italic text-[var(--color-gold)] font-[var(--font-serif)] font-normal">Villa</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            aria-label="Primary navigation"
            className={[
              "hidden items-center gap-1.5 rounded-full border px-2 py-1 md:flex transition-colors duration-500",
              scrolled || isOpen
                ? "border-foreground/10 dark:border-white/[0.06] bg-foreground/[0.02] dark:bg-white/[0.02]"
                : "border-white/10 bg-white/[0.04]",
            ].join(" ")}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative rounded-full px-4 py-1.5 text-[10px] font-[var(--font-sans)] font-bold uppercase tracking-[0.14em] transition-all duration-300",
                    active
                      ? scrolled || isOpen
                        ? "text-[var(--color-gold)] bg-foreground/[0.06] dark:bg-white/[0.06]"
                        : "text-[var(--color-gold)] bg-white/10"
                      : scrolled || isOpen
                      ? "text-foreground/70 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-foreground/[0.06] dark:hover:bg-white/[0.06]"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute bottom-0.5 left-1/2 h-[2px] w-2.5 -translate-x-1/2 rounded-full bg-[var(--color-gold)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Side CTAs */}
          <div className="hidden items-center gap-3.5 md:flex">
            <div
              className={[
                "rounded-full border p-0.5 transition-colors duration-500",
                scrolled || isOpen
                  ? "border-foreground/10 dark:border-white/[0.06] bg-foreground/[0.02] dark:bg-white/[0.02]"
                  : "border-white/10 bg-white/[0.04]",
              ].join(" ")}
            >
              <ThemeSwitch />
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Book via WhatsApp"
              className="group relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-full bg-[var(--color-gold)] px-4.5 text-[10px] font-[var(--font-sans)] font-bold uppercase tracking-[0.12em] text-[var(--color-charcoal)] shadow-[0_4px_18px_rgba(201,165,90,0.25)] border border-[var(--color-gold)] transition-all duration-300 hover:bg-white hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
              <span>Book Stay</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer md:hidden",
              scrolled || isOpen
                ? "border-foreground/10 dark:border-white/[0.08] bg-foreground/[0.04] dark:bg-white/[0.04] text-foreground dark:text-white"
                : "border-white/15 bg-white/10 text-white",
            ].join(" ")}
          >
            {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <>
          {/* Dark backdrop */}
          <div
            className="fixed inset-0 z-[48] bg-black/40 backdrop-blur-md md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container pill-align */}
          <div
            ref={drawerRef}
            className="fixed inset-x-4 top-[5.2rem] z-50 rounded-3xl border border-foreground/10 dark:border-white/[0.08] bg-card/95 dark:bg-[#0a0f12]/95 p-5 shadow-[0_24px_60px_rgba(11,32,39,0.35)] backdrop-blur-3xl md:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
              {NAV_LINKS.map(({ href, label }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    data-mobile-nav-link
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-bold uppercase tracking-[0.12em] transition-all",
                      active
                        ? "bg-[var(--color-gold)]/[0.12] text-[var(--color-gold)] border border-[var(--color-gold)]/20"
                        : "text-foreground/80 dark:text-white/80 border border-transparent hover:bg-foreground/5 dark:hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <span>{label}</span>
                    <Compass
                      className={[
                        "h-4 w-4 opacity-30 transition-all duration-500",
                        active ? "rotate-45 opacity-100 text-[var(--color-gold)]" : "",
                      ].join(" ")}
                    />
                  </Link>
                );
              })}

              <div className="h-px w-full bg-foreground/10 dark:bg-white/[0.06] my-2" data-mobile-nav-link />

              <div className="flex items-center gap-3 pt-1" data-mobile-nav-link>
                <div className="rounded-full border border-foreground/10 dark:border-white/[0.06] bg-foreground/[0.03] dark:bg-white/[0.03] p-0.5">
                  <ThemeSwitch />
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-gold)] py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-charcoal)] shadow-[0_6px_20px_rgba(201,165,90,0.3)]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>WhatsApp Booking</span>
                </a>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
