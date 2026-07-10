"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./HeroScrollSequence.module.css";
import { HERO_CONTENT, SITE_CONFIG } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";
import { trackContact } from "@/lib/analytics";

gsap.registerPlugin(ScrollTrigger);

type Props = { nextSectionId: string };

export function ScrollStory({ nextSectionId }: Props) {
  const HERO_IMAGE_URL = "/villa/optimized/villa_img_02.webp"; // Using the aerial view from LakeViewVilla as the parallax front
  const HERO_BG2_URL = "https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"; // using the Valorem hero video
  
  const outerWrapperRef = useRef<HTMLDivElement>(null);
  const innerStickyRef = useRef<HTMLDivElement>(null);
  const bgImageRef2 = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const centerLogoRef = useRef<HTMLDivElement>(null);
  const logoStrokeRef = useRef<HTMLDivElement>(null);
  const logoClipRef = useRef<HTMLDivElement>(null);
  const darkFogRef = useRef<HTMLDivElement>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const t = setTimeout(() => {
      setPrefersReducedMotion(mediaQuery.matches);
    }, 0);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => {
      clearTimeout(t);
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  const handleGallery = () => {
    const el = document.getElementById("gallery");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleWhatsApp = () => {
    const url = buildWhatsAppUrl(
      SITE_CONFIG.whatsappNumber,
      "Hi! I'm interested in booking Lake View Villa Tangalle. Could you please share availability and rates?"
    );
    trackContact("whatsapp", url, "Chat on WhatsApp");
    setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 80);
  };

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(heroContentRef.current, { opacity: 1, y: 0 });
        gsap.set(centerLogoRef.current, { opacity: 0 });
        return;
      }

      const centerLogo = centerLogoRef.current;
      if (!centerLogo) return;

      const buildAfterFonts = () => {
        requestAnimationFrame(() => {
          const navLogoText = document.querySelector<HTMLElement>("#nav-logo-text");
          const navRect = navLogoText?.getBoundingClientRect() || {
            left: 32,
            top: 32,
            width: 100,
            height: 30,
          };
          const logoRect = centerLogo.getBoundingClientRect();

          const dx =
            navRect.left +
            navRect.width / 2 -
            (logoRect.left + logoRect.width / 2);
          const dy =
            navRect.top +
            navRect.height / 2 -
            (logoRect.top + logoRect.height / 2);
          const scale = navRect.width / (logoRect.width || 1);

          gsap.set(centerLogo, {
            x: dx,
            y: dy,
            scale,
            opacity: 0,
            transformOrigin: "center center",
          });

          buildTimeline();
          ScrollTrigger.refresh();
        });
      };

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(buildAfterFonts).catch(buildAfterFonts);
      } else {
        buildAfterFonts();
      }

      const buildTimeline = () => {
        const tl = gsap.timeline({
          defaults: { force3D: true, ease: "none" },
          scrollTrigger: {
            trigger: outerWrapperRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            pin: innerStickyRef.current,
            pinSpacing: false,
          },
        });

        tl.to(
          heroContentRef.current,
          { opacity: 0, y: -50, ease: "power1.in", duration: 0.15 },
          0,
        );

        tl.to(bgImageRef.current, { y: "-15%", ease: "none", duration: 1.0 }, 0);
        tl.to(bgImageRef2.current, { y: "-15%", ease: "none", duration: 1.0 }, 0);
        tl.to(cloudRef.current, { y: "-35%", ease: "none", duration: 1.0 }, 0);

        tl.to(
          centerLogoRef.current,
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            duration: 0.25,
          },
          0.10,
        );

        tl.to(bgImageRef.current, { opacity: 0, ease: "power1.inOut", duration: 0.3 }, 0.40);
        tl.to(cloudRef.current, { opacity: 0, ease: "power1.inOut", duration: 0.3 }, 0.40);
        tl.to(logoStrokeRef.current, { opacity: 0, ease: "power1.inOut", duration: 0.3 }, 0.40);
        tl.to(logoClipRef.current, { opacity: 1, ease: "power1.inOut", duration: 0.3 }, 0.40);

        tl.to(
          centerLogoRef.current,
          { opacity: 0, scale: 1.1, ease: "power1.inOut", duration: 0.25 },
          0.75,
        );
        tl.to(darkFogRef.current, { opacity: 1, ease: "power1.inOut", duration: 0.25 }, 0.75);
      };

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    },
    { scope: outerWrapperRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <div
      ref={outerWrapperRef}
      className="relative h-[180dvh] md:h-[250dvh] min-h-[1400px] md:min-h-[2400px]"
    >
      <div ref={innerStickyRef} className="h-[100dvh] overflow-hidden bg-background w-full">
        <div
          className="absolute top-0 left-0 w-full h-32 md:h-48 z-10 pointer-events-none bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[1px]"
          aria-hidden="true"
        />

        <div
          ref={bgImageRef2}
          className="absolute will-change-transform"
          style={{
            top: "-25%",
            left: "-4%",
            right: "-4%",
            bottom: 0,
            width: "108%",
            height: "150%",
          }}
        >
          <div
            className="w-full h-full will-change-transform filter brightness-[0.4] md:brightness-[0.45] blur-[1px]"
            style={{
              animation: prefersReducedMotion ? "none" : "ken-burns 28s ease-out forwards",
            }}
          >
            <video
              src={HERO_BG2_URL}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        <div
          ref={bgImageRef}
          className="absolute will-change-transform"
          style={{
            top: "-25%",
            left: "-4%",
            right: "-4%",
            bottom: 0,
            width: "108%",
            height: "150%",
          }}
        >
          <div
            className="w-full h-full will-change-transform filter brightness-[0.7] md:brightness-[0.75]"
            style={{
              animation: prefersReducedMotion ? "none" : "ken-burns 24s ease-out forwards",
            }}
          >
            <Image
              src={HERO_IMAGE_URL}
              alt="Lake View Villa Tangalle"
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw, 108vw"
              style={{ objectFit: "cover", objectPosition: "center 40%" }}
            />
          </div>
        </div>

        <div
          ref={cloudRef}
          className="absolute z-20 will-change-transform"
          style={{
            bottom: "-5%",
            left: 0,
            right: 0,
            height: "60%",
            width: "100%",
          }}
        />

        <div
          ref={heroContentRef}
          className="absolute inset-0 z-30 flex items-center justify-center px-4"
        >
          <div className="text-center max-w-5xl mx-auto flex flex-col items-center gap-6 md:gap-8 drop-shadow-2xl mt-12">
            
            <h1
              className="font-display text-white font-extrabold tracking-tight leading-[1.05] max-w-5xl text-center"
              style={{
                fontSize: "clamp(2rem, 7.5vw, 5.5rem)",
                textShadow: "0 4px 40px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              <span className="sr-only">
                Lake View Villa Tangalle.
              </span>
              <span className="block text-shadow-deep">
                <span className="block">{HERO_CONTENT.titleParts[0]}</span>
                <span className="block">{HERO_CONTENT.titleParts[1]}</span>
              </span>
            </h1>

            <div className="flex flex-col gap-2 max-w-3xl">
              <p
                className="text-white/95 font-medium leading-relaxed tracking-normal"
                style={{
                  fontSize: "clamp(1rem, 2.2vw + 0.2rem, 1.5rem)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                }}
              >
                {HERO_CONTENT.tagline}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-6">
              <Button
                size="lg"
                className="group relative inline-flex items-center justify-between gap-6 pl-8 pr-2 py-2 h-14 rounded-full border border-white/40 hover:border-white/60 bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 shadow-lg scale-[1] active:scale-[0.97]"
                onClick={handleGallery}
              >
                <span className="text-sm md:text-base tracking-wide select-none">
                  View Gallery
                </span>
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-y-1">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </Button>

              <Button
                size="lg"
                className="group relative inline-flex items-center justify-between gap-6 pl-8 pr-2 py-2 h-14 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-all duration-300 shadow-2xl scale-[1] active:scale-[0.97]"
                onClick={handleWhatsApp}
              >
                <span className="text-sm md:text-base tracking-wide select-none">
                  {HERO_CONTENT.ctas[1]}
                </span>
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-cyan-600 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const endEl = document.getElementById(nextSectionId);
              if (endEl)
                endEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full group will-change-transform"
            aria-label="Scroll down to explore"
          >
            <span className="text-[9px] uppercase tracking-widest font-semibold text-white/40 group-hover:text-white/60 transition-colors select-none">
              Scroll to explore
            </span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </button>
        </div>

        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div
            ref={centerLogoRef}
            className="relative flex flex-col items-center will-change-transform"
          >
            <div ref={logoStrokeRef} className={styles.logoStroke}>
              <span className={styles.logoMain}>LAKEVIEW</span>
              <span className={styles.logoSub}>Villa</span>
            </div>
            <div
              ref={logoClipRef}
              className={styles.logoClip}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                backgroundImage: `url('${HERO_IMAGE_URL}')`,
                backgroundSize: "cover",
                backgroundPosition: "center 25%",
              }}
            >
              <span className={styles.logoMain}>LAKEVIEW</span>
              <span className={styles.logoSub}>Villa</span>
            </div>
          </div>
        </div>

        <div
          ref={darkFogRef}
          className="absolute inset-0 z-[35] pointer-events-none hero-fog"
          style={{
            opacity: 0,
          }}
        />
      </div>
    </div>
  );
}
