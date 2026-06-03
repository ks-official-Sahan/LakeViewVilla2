// app/stays/page.tsx (server component)
import type { Metadata } from "next";
import SeoJsonLd from "@/components/SeoJsonLd";
import StaysPage from "./client";
import { RATES, OFFERS, BOOKING_FACTS } from "@/data/content";
import { getContentBlock } from "@/lib/cms/get-content-block";
import { getMediaAssetsByLocation } from "@/lib/media/queries";

export const metadata: Metadata = {
  title: "Tangalle Accommodation — Stays & Rates | Lake View Villa",
  description: "Book Tangalle accommodation at Lake View Villa. Check rates and reserve your private room in Tangalle. Perfect for a serene lagoon getaway in Sri Lanka.",
  keywords: [
    "Tangalle accommodation",
    "Tangalle rental",
    "private room Tangalle",
    "best places to stay in Tangalle",
    "Tangalle villa",
    "Tangalle lagoon stay",
    "Sri Lanka villa",
    "private villa",
    "best rate WhatsApp",
  ],
  alternates: { canonical: "/stays" },
  openGraph: {
    title: "Tangalle Accommodation — Stays & Rates | Lake View Villa",
    description: "Book Tangalle accommodation at Lake View Villa. Check rates and reserve your private room in Tangalle. Perfect for a serene lagoon getaway in Sri Lanka.",
    url: "https://lakeviewvillatangalle.com/stays",
    type: "website",
    images: [
      {
        url: "/villa/optimized/drone_view_villa.webp",
        width: 1200,
        height: 630,
        alt: "Lake View Villa Tangalle — lagoon at sunrise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tangalle Accommodation — Stays & Rates | Lake View Villa",
    description: "Book Tangalle accommodation at Lake View Villa. Check rates and reserve your private room in Tangalle.",
    images: ["/villa/optimized/drone_view_villa.webp"],
  },
};

export default async function Page() {
  let room1Images: string[] = [];
  let room2Images: string[] = [];

  try {
    const r1Assets = await getMediaAssetsByLocation("stays", "room-1");
    const r2Assets = await getMediaAssetsByLocation("stays", "room-2");
    room1Images = r1Assets.map(a => a.url);
    room2Images = r2Assets.map(a => a.url);
  } catch (error) {
    console.error("Failed to load stays images:", error);
  }

  const heroBlock = await getContentBlock("stays", "hero", {
    headline: "Stays & Rates",
    subheadline: "Experience tranquility on a serene lagoon—best rates via direct WhatsApp.",
  });
  const roomsBlock = await getContentBlock("stays", "rooms", BOOKING_FACTS.rooms);
  const pricingBlock = await getContentBlock("stays", "pricing", RATES as any);
  const amenitiesBlock = await getContentBlock("stays", "amenities", BOOKING_FACTS.amenities);

  return (
    <>
      <SeoJsonLd
        breadcrumb={[
          { name: "Home", url: "https://lakeviewvillatangalle.com/" },
          { name: "Stays", url: "https://lakeviewvillatangalle.com/stays" },
        ]}
        offers={[
          {
            name: `Lake View Villa — ${RATES[0]?.season ?? "Stay"}`,
            description: `${RATES[0]?.period ?? ""}: ${RATES[0]?.nightly ?? ""}. ${RATES[0]?.notes ?? ""}`.trim(),
            url: "https://lakeviewvillatangalle.com/stays",
          },
          ...OFFERS.map((o) => ({
            name: o.title,
            description: o.description,
            url: "https://lakeviewvillatangalle.com/stays",
          })),
        ]}
      />
      <StaysPage
        cmsHero={heroBlock}
        cmsRooms={roomsBlock}
        cmsPricing={pricingBlock}
        cmsAmenities={amenitiesBlock}
        room1Images={room1Images}
        room2Images={room2Images}
      />
    </>
  );
}
