"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Menu, X, Phone, Compass } from "lucide-react";
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

/**
 * LakeViewVilla Navigation — Liquid Glass Pill
 *
 * Always-readable: dark glass + light text at all times.
 * No more white-on-light contrast failures.
 * - Frosted dark pill over hero (transparent-feel but legible)
 * - Solid dark glass on scroll
 * - Text/icons: always white on dark glass (WCAG AAA)
 *
 * Design: Aman/Six Senses — invisible utility, never fights the page.
 */
export function Navigation() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const lastScrollY = useRef(0);
  const isHidden = useRef(false);
  const isScrolledRef = useRef(false);

  // ── Entrance animation (mount-only) ──────────────────────────────────────
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: "power4.out", delay: 0.15 }
    );
  }, []);

  // ── Smart scroll hide/show ───────────────────────────────────────────────
  useGSAP(() => {
    if (!headerRef.current) return;

    const showHeader = () => {
      if (!isHidden.current) return;
      isHidden.current = false;
      gsap.to(headerRef.current, {
        y: 0,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const hideHeader = () => {
      if (isHidden.current) return;
      isHidden.current = true;
      gsap.to(headerRef.current, {
        y: -100,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Update scrolled state (20px threshold)
      const pastThreshold = scrollY > 20;
      if (pastThreshold !== isScrolledRef.current) {
        isScrolledRef.current = pastThreshold;
        setScrolled(pastThreshold);
      }

      if (isOpen) {
        showHeader();
        return;
      }

      // Hide/show threshold logic with scroll direction tracking and noise tolerance
      if (scrollY > 100) {
        if (scrollY > lastScrollY.current + 5) {
          // Scrolling down -> hide
          hideHeader();
        } else if (scrollY < lastScrollY.current - 12) {
          // Scrolling up -> show
          showHeader();
        }
      } else {
        // Near top -> always show
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

  useEffect(() => setIsOpen(false), [pathname]);

  // ── Mobile drawer stagger reveal ──────────────────────────────────────────
  useEffect(() => {
    if (!drawerRef.current || !isOpen) return;

    gsap.fromTo(
      drawerRef.current,
      { opacity: 0, y: -16, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power4.out" }
    );

    const links = drawerRef.current.querySelectorAll("[data-mobile-nav-link]");
    gsap.fromTo(
      links,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: "power3.out", delay: 0.08 }
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
        className="fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out"
      >
        {/* Glass pill — dynamic theme support */}
        <div
          className={[
            "mx-auto flex h-[var(--nav-h,4rem)] items-center justify-between px-4 sm:px-6 transition-all duration-500 ease-out",
            scrolled || isOpen
              ? "rounded-full border border-foreground/10 dark:border-white/[0.08] bg-background/80 dark:bg-[#0a0c0e]/[0.75] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.35)] md:max-w-5xl"
              : "rounded-full border border-foreground/5 dark:border-white/[0.06] bg-background/40 dark:bg-[#0a0c0e]/[0.45] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] md:max-w-6xl",
          ].join(" ")}
        >
          {/* Logo — dynamic text color */}
          <Link
            href="/"
            className="group relative flex items-center gap-2.5 shrink-0"
            aria-label="Lake View Villa — Home"
          >
            <div className="relative overflow-hidden rounded-full border border-[var(--color-gold)]/25 p-0.5 transition-transform duration-500 group-hover:rotate-12">
              <Image
                src="/logo.png"
                alt="Lake View Villa"
                width={34}
                height={34}
                className="h-[32px] w-[32px] rounded-full object-cover"
                priority
              />
            </div>
            <span className="hidden sm:flex items-baseline gap-1 font-[var(--font-serif)] font-bold text-base text-foreground dark:text-white group-hover:text-[var(--color-gold)] transition-colors duration-300">
              Lake View{" "}
              <span className="italic text-[var(--color-gold)] font-medium">Villa</span>
            </span>
          </Link>

          {/* Desktop navigation — dynamic styling */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-0.5 rounded-full border border-foreground/10 dark:border-white/[0.06] bg-foreground/[0.03] dark:bg-white/[0.03] px-1.5 py-1 md:flex"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-300",
                    active
                      ? "text-[var(--color-gold)] bg-foreground/[0.08] dark:bg-white/[0.08]"
                      : "text-foreground/75 dark:text-white/65 hover:text-foreground dark:hover:text-white hover:bg-foreground/[0.08] dark:hover:bg-white/[0.08]",
                  ].join(" ")}
                >
                  {label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute bottom-0.5 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-[var(--color-gold)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-foreground/10 dark:border-white/[0.06] bg-foreground/[0.03] dark:bg-white/[0.03] p-1">
              <ThemeSwitch />
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Book via WhatsApp"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-gold)] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-charcoal)] shadow-[0_4px_20px_rgba(201,165,90,0.2)] transition-all duration-300 hover:bg-[var(--color-gold-light)] hover:shadow-[0_6px_28px_rgba(201,165,90,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
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
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-foreground/10 dark:border-white/[0.08] bg-foreground/[0.04] dark:bg-white/[0.04] text-foreground dark:text-white transition-all duration-300 hover:bg-foreground/[0.08] dark:hover:bg-white/[0.12] md:hidden"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[49] bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel — solid dark, always legible */}
          <div
            ref={drawerRef}
            className="fixed inset-x-4 top-[4.5rem] z-50 rounded-2xl border border-foreground/10 dark:border-white/[0.08] bg-card/95 dark:bg-[#0a0c0e]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl md:hidden"
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
                      "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] transition-all",
                      active
                        ? "bg-[var(--color-gold)]/[0.12] text-[var(--color-gold)]"
                        : "text-foreground/80 dark:text-white/80 hover:bg-foreground/5 dark:hover:bg-white/[0.06] hover:text-foreground dark:hover:text-white",
                    ].join(" ")}
                  >
                    <span>{label}</span>
                    <Compass
                      className={[
                        "h-3.5 w-3.5 opacity-30 transition-all duration-500",
                        active ? "rotate-45 opacity-100 text-[var(--color-gold)]" : "",
                      ].join(" ")}
                    />
                  </Link>
                );
              })}

              <div className="h-px w-full bg-foreground/10 dark:bg-white/[0.06] my-1.5" data-mobile-nav-link />

              <div className="flex items-center gap-3" data-mobile-nav-link>
                <div className="rounded-xl border border-foreground/10 dark:border-white/[0.06] bg-foreground/[0.03] dark:bg-white/[0.03] p-1.5">
                  <ThemeSwitch />
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-gold)] py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-charcoal)] shadow-[0_4px_20px_rgba(201,165,90,0.2)]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
