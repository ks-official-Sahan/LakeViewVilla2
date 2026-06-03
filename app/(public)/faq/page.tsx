import type { Metadata } from "next";
import SeoJsonLd from "@/components/SeoJsonLd";
import FAQClient from "./client";
import { FAQ_ITEMS } from "@/data/content";
import { getContentBlock } from "@/lib/cms/get-content-block";

export const metadata: Metadata = {
  title: "Tangalle Villa FAQ — Bookings & Directions | Lake View Villa",
  description: "Read our Tangalle villa FAQ. Find direct answers about booking Tangalle stays, Lake View Villa directions, A/C rooms, and local Sri Lankan attractions.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Tangalle Villa FAQ — Bookings & Directions | Lake View Villa",
    description: "Read our Tangalle villa FAQ. Find direct answers about booking Tangalle stays, Lake View Villa directions, A/C rooms, and local Sri Lankan attractions.",
    url: "https://lakeviewvillatangalle.com/faq",
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
    title: "Tangalle Villa FAQ — Bookings & Directions | Lake View Villa",
    description: "Read our Tangalle villa FAQ. Find direct answers about booking Tangalle stays, Lake View Villa directions, A/C rooms, and local Sri Lankan attractions.",
    images: ["/villa/optimized/drone_view_villa.webp"],
  },
};

export default async function Page() {
  const heroBlock = await getContentBlock<any>("faq", "hero", {
    headline: "Frequently Asked Questions",
    subheadline: "Find answers to common questions about Lake View Villa Tangalle",
  });
  const questionsBlock = await getContentBlock<any>("faq", "questions", [] as any[]);

  // Map to format required by SeoJsonLd
  const faqList = Array.isArray(questionsBlock)
    ? questionsBlock.map((item: any) => ({
        q: item.question || item.q,
        a: item.answer || item.a,
      }))
    : FAQ_ITEMS.map((item) => ({
        q: item.question,
        a: item.answer,
      }));

  return (
    <>
      <SeoJsonLd
        breadcrumb={[
          { name: "Home", url: "https://lakeviewvillatangalle.com/" },
          { name: "FAQ", url: "https://lakeviewvillatangalle.com/faq" },
        ]}
        faq={faqList}
      />
      <FAQClient cmsHero={heroBlock} cmsQuestions={questionsBlock} />
    </>
  );
}
