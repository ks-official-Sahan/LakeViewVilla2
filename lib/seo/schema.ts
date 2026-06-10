/**
 * Centralized schema.org generators for Lake View Villa.
 * Single source of truth for all JSON-LD structured data.
 *
 * @example
 * import { lodgingBusinessSchema, reviewSchema, breadcrumbSchema } from "@/lib/seo/schema";
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lakeviewvillatangalle.com";
const VILLA_NAME = "Lake View Villa Tangalle";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "+94701164056";

// ─── Organization ──────────────────────────────────────────────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: VILLA_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 400,
      height: 120,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: WHATSAPP,
      contactType: "reservations",
      availableLanguage: ["English", "Sinhala"],
      areaServed: "LK",
    },
    sameAs: [
      "https://www.instagram.com/lakeviewvillatangalle",
      "https://www.facebook.com/lakeviewvillatangalle",
      "https://www.airbnb.com/l/CfK96vPd",
      "https://www.booking.com/Pulse-81UlHU",
      "https://www.tripadvisor.com/Hotel_Review-g304142-d24052834-Reviews-Lake_View_Villa_tangalle-Tangalle_Southern_Province.html",
    ],
  };
}

// ─── Website ────────────────────────────────────────────────────────────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: VILLA_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── Lodging Business ──────────────────────────────────────────────────────

export function lodgingBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "VacationRental"],
    "@id": `${SITE_URL}/#lodging`,
    name: VILLA_NAME,
    url: SITE_URL,
    description:
      "Private luxury villa on a serene lagoon in Tangalle, Sri Lanka. 2 en-suite bedrooms, modern amenities, exclusive stays.",
    image: [
      `${SITE_URL}/villa/optimized/villa_img_02.webp`,
      `${SITE_URL}/villa/optimized/drone_view_villa.webp`,
    ],
    telephone: WHATSAPP,
    priceRange: "$$",
    checkinTime: "14:00",
    checkoutTime: "11:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: "19/6 Julgahawalagoda, Kadurupokuna South",
      addressLocality: "Tangalle",
      addressRegion: "Southern Province",
      postalCode: "82200",
      addressCountry: "LK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 6.0173643,
      longitude: 80.7811559,
    },
    hasMap: "https://maps.app.goo.gl/wRLkZBxMSvfhd2jZA",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
      { "@type": "LocationFeatureSpecification", name: "Private garden", value: true },
      { "@type": "LocationFeatureSpecification", name: "Lagoon view", value: true },
      { "@type": "LocationFeatureSpecification", name: "Full kitchen", value: true },
      { "@type": "LocationFeatureSpecification", name: "Free parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Beach access", value: true },
    ],
    numberOfRooms: 2,
    maximumAttendeeCapacity: 6,
    petsAllowed: false,
  };
}

// ─── Review ────────────────────────────────────────────────────────────────

interface ReviewAuthor {
  name: string;
  url?: string;
}

interface ReviewOptions {
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  reviewBody: string;
  author: ReviewAuthor;
  datePublished: string;
  title?: string;
}

export function reviewSchema(opts: ReviewOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "LodgingBusiness",
      "@id": `${SITE_URL}/#lodging`,
      name: VILLA_NAME,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: opts.ratingValue,
      bestRating: opts.bestRating ?? 5,
      worstRating: opts.worstRating ?? 1,
    },
    name: opts.title ?? `Review of ${VILLA_NAME}`,
    reviewBody: opts.reviewBody,
    author: {
      "@type": "Person",
      name: opts.author.name,
      ...(opts.author.url ? { url: opts.author.url } : {}),
    },
    datePublished: opts.datePublished,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Generate an AggregateRating schema from overall score and count */
export function aggregateRatingSchema(ratingValue: number, reviewCount: number, bestRating = 5) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "LodgingBusiness",
      "@id": `${SITE_URL}/#lodging`,
      name: VILLA_NAME,
    },
    ratingValue,
    bestRating,
    worstRating: 1,
    reviewCount,
  };
}

// ─── Article / Blog Post ──────────────────────────────────────────────────

interface ArticleSchemaOptions {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
  keywords?: string[];
}

export function articleSchema(opts: ArticleSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${opts.slug}#article`,
    headline: opts.title,
    description: opts.description,
    url: `${SITE_URL}/blog/${opts.slug}`,
    image: opts.imageUrl ? { "@type": "ImageObject", url: opts.imageUrl } : undefined,
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt ?? opts.publishedAt,
    author: { "@type": "Person", name: opts.authorName ?? "Lake View Villa" },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${opts.slug}` },
    ...(opts.keywords?.length ? { keywords: opts.keywords } : {}),
  };
}

// ─── Breadcrumb ────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

// ─── FAQ Page ──────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

export function faqSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

// ─── HowTo ─────────────────────────────────────────────────────────────────

interface HowToStep {
  name: string;
  text: string;
}

export function howToSchema(name: string, steps: HowToStep[], description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    ...(description ? { description } : {}),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

// ─── Image Object ──────────────────────────────────────────────────────────

interface ImageObjectOptions {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

export function imageObjectSchema(opts: ImageObjectOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    url: opts.url,
    description: opts.alt,
    width: opts.width,
    height: opts.height,
    caption: opts.caption,
    creator: { "@id": `${SITE_URL}/#organization` },
  };
}

// ─── Offer / Product ───────────────────────────────────────────────────────

interface OfferItem {
  name: string;
  price: string;
  description: string;
  priceCurrency?: string;
}

export function offerSchema(offers: OfferItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: offers.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: o.name,
        description: o.description,
        offers: {
          "@type": "Offer",
          price: o.price,
          priceCurrency: o.priceCurrency ?? "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
}

// ─── Video Object ──────────────────────────────────────────────────────────

export function videoObjectSchema(videoUrl: string, thumbnailUrl: string, uploadDate = "2024-01-15") {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Lake View Villa Tangalle - Virtual Tour",
    description: "Experience the serene beauty of Lake View Villa Tangalle",
    thumbnailUrl,
    contentUrl: videoUrl,
    uploadDate,
  };
}

// ─── Site Graph (all schemas combined) ─────────────────────────────────────

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(),
      organizationSchema(),
      lodgingBusinessSchema(),
    ],
  };
}
