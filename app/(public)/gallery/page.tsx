import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { connection } from "next/server";
import { SectionReveal } from "@/components/motion/section-reveal";
import { PROPERTY } from "@/data/content";
// import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import { breadcrumbSchema } from "@/lib/seo";
import { serializeJsonLd } from "@/lib/utils";
import { getGalleryGridAssets } from "@/lib/media/queries";
import { getContentBlock } from "@/lib/cms/get-content-block";

const GalleryClient = dynamic(() => import("./gallery-client"), {
  loading: () => (
    <div
      className="min-h-[45vh] animate-pulse rounded-2xl bg-slate-800/30"
      aria-hidden
    />
  ),
});

export const metadata: Metadata = {
  title: "Tangalle Villa Photos — Gallery | Lake View Villa Tangalle",
  description: "View Tangalle villa photos of Lake View Villa Tangalle. Explore images of our serene lagoon views, comfortable A/C rooms, and beautiful natural surroundings.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Tangalle Villa Photos — Gallery | Lake View Villa Tangalle",
    description: "View Tangalle villa photos of Lake View Villa Tangalle. Explore images of our serene lagoon views, comfortable A/C rooms, and beautiful natural surroundings.",
    url: "https://lakeviewvillatangalle.com/gallery",
    type: "website",
    images: [
      {
        url: "/villa/optimized/drone_view_villa.webp",
        width: 1200,
        height: 630,
        alt: "Aerial view of the lagoon and villa at sunrise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tangalle Villa Photos — Gallery | Lake View Villa Tangalle",
    description: "View Tangalle villa photos of Lake View Villa Tangalle. Explore images of our serene lagoon views, comfortable A/C rooms, and beautiful natural surroundings.",
    images: ["/villa/optimized/drone_view_villa.webp"],
  },
};

function getGalleryImages() {
  const booking = PROPERTY;

  const fromBooking =
    (booking?.images_sample ?? []).map((src: string, i: number) => ({
      src: src.startsWith("/") ? src : `/${src}`,
      alt: `${booking?.name ?? "Lake View Villa"} — Image ${i + 1}`,
      w: 1200,
      h: 800,
    })) ?? [];

  const fallbacks = [
    {
      src: "/villa/optimized/drone_view_villa.webp",
      alt: "Aerial view of the lagoon and villa at sunrise",
      w: 1200,
      h: 800,
    },
    {
      src: "/villa/optimized/room_02_img_01.webp",
      alt: "Living area with modern furnishings",
      w: 1200,
      h: 800,
    },
    {
      src: "/villa/optimized/garden_img_01.webp",
      alt: "Garden path and greenery around the villa",
      w: 1200,
      h: 800,
    },
  ];

  // de-dupe on src and keep order stable
  const seen = new Set<string>();
  const images = [...fromBooking, ...fallbacks].filter((x) => {
    if (seen.has(x.src)) return false;
    seen.add(x.src);
    return true;
  });

  return images;
}

export default async function Page() {
  await connection();

  const heroBlock = await getContentBlock("gallery", "hero", {
    headline: "Villa Gallery",
    subheadline: "A curated reel of the lagoon, interiors, and surrounding nature.",
  });

  let dbImages: { src: string; alt: string; w: number; h: number }[] = [];
  try {
    const assets = await getGalleryGridAssets({ limit: 500 });
    const name = PROPERTY?.name ?? "Lake View Villa";
    dbImages = assets
      .filter((a) => a.type === "IMAGE")
      .map((a) => ({
        src: a.url,
        alt: (a.alt ?? a.title ?? `${name} — Gallery photo`).trim(),
        w: a.width ?? 1200,
        h: a.height ?? 800,
      }));
  } catch {
    dbImages = [];
  }

  const staticImages = getGalleryImages();
  const seen = new Set(dbImages.map((x) => x.src));
  const images = [...dbImages, ...staticImages.filter((x) => !seen.has(x.src))];

  return (
    <>
      {/* JSON-LD (Breadcrumbs) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            breadcrumbSchema([
              { name: "Home", url: "https://lakeviewvillatangalle.com/" },
              {
                name: "Gallery",
                url: "https://lakeviewvillatangalle.com/gallery",
              },
            ])
          ),
        }}
      />

      <div className="min-h-screen relative overflow-hidden bg-[var(--color-background)]">
        {/* Ambient background using design tokens */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(60% 40% at 20% 10%, rgba(14,165,233,0.08), transparent 70%), radial-gradient(50% 30% at 80% 20%, rgba(201,165,90,0.06), transparent 70%)"
          }}
        />
        <div className="relative z-10 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] bg-clip-text text-transparent">
                    {heroBlock.headline}
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
                  {heroBlock.subheadline}
                </p>
                <p className="text-sm text-[var(--color-muted)]/70 mt-2">
                  {images.length} photos
                </p>
              </div>
            </SectionReveal>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 pb-20">
          {/* Client-only masonry + lightbox */}
          <GalleryClient images={images} />
        </div>
      </div>
    </>
  );
}
