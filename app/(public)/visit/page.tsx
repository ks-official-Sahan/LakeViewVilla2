import type { Metadata } from "next";
import SeoJsonLd from "@/components/SeoJsonLd";
import VisitPage from "./client";
import { DIRECTIONS } from "@/data/content";
import { getContentBlock } from "@/lib/cms/get-content-block";

export const metadata: Metadata = {
  title: "Things to Do in Tangalle — Visit & Location | Lake View Villa",
  description: "Discover things to do in Tangalle. Find easy directions to Lake View Villa Tangalle, explore Sri Lanka's south coast, and contact us for your stay.",
  alternates: { canonical: "/visit" },
  openGraph: {
    title: "Things to Do in Tangalle — Visit & Location | Lake View Villa",
    description: "Discover things to do in Tangalle. Find easy directions to Lake View Villa Tangalle, explore Sri Lanka's south coast, and contact us for your stay.",
    url: "https://lakeviewvillatangalle.com/visit",
    type: "website",
    images: [
      {
        url: "/villa/optimized/drone_view_villa.webp",
        width: 1200,
        height: 630,
        alt: "Lake View Villa Tangalle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Things to Do in Tangalle — Visit & Location | Lake View Villa",
    description: "Discover things to do in Tangalle. Find easy directions to Lake View Villa Tangalle, explore Sri Lanka's south coast, and contact us for your stay.",
    images: ["/villa/optimized/drone_view_villa.webp"],
  },
};

export default async function Page() {
  const heroBlock = await getContentBlock("visit", "hero", {
    headline: "Visit Us",
    subheadline: "Plan your journey to Lake View Villa Tangalle with precise directions and fast contact options.",
  });
  const mapBlock = await getContentBlock("visit", "map", {
    headline: "Location & Map",
    subheadline: "",
  });
  const directionsBlock = await getContentBlock("visit", "directions", {
    headline: "How to Get Here",
    subheadline: "~35 minutes from Matara • ~3 hours from Colombo Airport",
  });
  const nearbyBlock = await getContentBlock("visit", "nearby", {
    headline: "Nearby Attractions",
    subheadline: "",
  });

  const stepsList = Array.isArray(directionsBlock?.steps) && directionsBlock.steps.length > 0
    ? directionsBlock.steps
    : DIRECTIONS;

  return (
    <>
      <SeoJsonLd
        breadcrumb={[
          { name: "Home", url: "https://lakeviewvillatangalle.com/" },
          { name: "Visit", url: "https://lakeviewvillatangalle.com/visit" },
        ]}
        howTo={{
          name: "Driving directions to Lake View Villa Tangalle",
          description:
            directionsBlock?.subheadline || "Overview of reaching the villa by road from Tangalle. Confirm the exact pin via WhatsApp.",
          steps: stepsList.map((text: string, i: number) => ({
            name: `Step ${i + 1}`,
            text,
          })),
        }}
      />
      <VisitPage
        cmsHero={heroBlock}
        cmsMap={mapBlock}
        cmsDirections={directionsBlock}
        cmsNearby={nearbyBlock}
      />
    </>
  );
}
