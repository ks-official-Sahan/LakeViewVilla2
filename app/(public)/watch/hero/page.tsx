// app/watch/hero/page.tsx
import React from "react";
import Script from "next/script";
import Link from "next/link";
import { navBack, navFade } from "@/lib/navigation/view-transitions";

export const metadata = {
  title: "Lake View Villa — Hero Video",
  description:
    "Watch the Lake View Villa Tangalle hero video. Aerial and on-site footage of the villa and lagoon.",
  alternates: { canonical: "https://lakeviewvillatangalle.com/watch/hero" },
};

const SITE = "https://lakeviewvillatangalle.com";

// Custom inline SVG icons
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

export default function WatchHeroPage() {
  const videoUrl = `${SITE}/hero/hero.webm`;
  const poster = `${SITE}/hero/hero-poster.webp`;
  const thumbnail = `${SITE}/hero/hero-poster.webp`; // used in JSON-LD
  const uploadDate = "2025-09-01T00:00:00Z";
  const durationISO = "PT0M28S";
  const name = "Lake View Villa Tangalle — Hero Reel";
  const description =
    "A short hero reel showcasing Lake View Villa Tangalle — aerial lagoon views, villa exterior, and guest moments.";

  const videoObject = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl: [thumbnail],
    uploadDate,
    duration: durationISO,
    contentUrl: videoUrl,
    embedUrl: `${SITE}/watch/hero`,
    publication: { "@type": "PublicationEvent", startDate: uploadDate },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Watch Hero",
        item: SITE + "/watch/hero",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] py-24 md:py-32">
      {/* Background ambient radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px] -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,165,90,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-5xl px-4 md:px-8">
        {/* Eyebrow & Title */}
        <div className="text-center mb-10 space-y-3">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-gold)]">
            <PlayIcon className="h-3.5 w-3.5 fill-current" /> Cinematic Reel
          </p>
          <h1 className="font-[var(--font-display)] text-3xl md:text-5xl font-black tracking-tight text-[var(--color-foreground)]">
            {name}
          </h1>
          <p className="mx-auto max-w-2xl text-sm md:text-base text-[var(--color-muted)] font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Cinematic Video Frame */}
        <div className="relative border border-[var(--color-border)] bg-[var(--color-surface)] p-2 rounded-sm shadow-md overflow-hidden group">
          {/* Subtle gold line accents on the frame */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a55a]/40 to-transparent" />
          
          <video
            controls
            preload="metadata"
            poster={poster}
            className="w-full h-auto aspect-[16/9] object-cover rounded-sm border border-[var(--color-border)]/50"
            aria-label="Lake View Villa hero video"
          >
            <source src={videoUrl} type="video/webm" />
            Your browser does not support the video tag.{" "}
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
              Open the video file
            </a>
          </video>
        </div>

        {/* CTA section */}
        <div className="mt-12 text-center p-6 border border-[var(--color-border)]/60 bg-[var(--color-surface)]/30 backdrop-blur-md rounded-sm">
          <p className="text-sm text-[var(--color-muted)]">
            Explore booking options, availability, and guest reviews.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              transitionTypes={[...navBack]}
              className="inline-flex items-center px-6 py-2.5 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity"
            >
              Return to Homepage
            </Link>
            <Link
              href="/stays"
              transitionTypes={[...navFade]}
              className="inline-flex items-center px-6 py-2.5 border border-[var(--color-border)] text-[var(--color-foreground)] text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--color-surface)] transition-all"
            >
              View Stays & Rates
            </Link>
          </div>
        </div>
      </div>

      {/* JSON-LD for VideoObject + Breadcrumb */}
      <Script
        id="videoobject-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(videoObject)}
      </Script>
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(breadcrumb)}
      </Script>
    </main>
  );
}
