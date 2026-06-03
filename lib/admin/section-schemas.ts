/**
 * Typed field definitions for selected CMS sections.
 * Keys are `${pageSlug}/${sectionSlug}`. Sections without an entry use raw JSON in the editor.
 */

export type SectionField =
  | { key: string; type: "text"; label: string; maxLength?: number }
  | { key: string; type: "textarea"; label: string; maxLength?: number }
  | { key: string; type: "url"; label: string }
  | { key: string; type: "image"; label: string };

export type SectionSchema = {
  label: string;
  fields: SectionField[];
};

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  "home/hero": {
    label: "Home — Hero",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Subheadline", maxLength: 280 },
      { key: "ctaLabel", type: "text", label: "CTA label", maxLength: 48 },
      { key: "ctaHref", type: "url", label: "CTA URL" },
      { key: "bgImage", type: "image", label: "Hero Background Image" },
    ],
  },
  "home/highlights": {
    label: "Home — Highlights",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow", maxLength: 100 },
      { key: "title", type: "text", label: "Title", maxLength: 120 },
      { key: "description", type: "textarea", label: "Description", maxLength: 400 },
    ],
  },
  "home/experiences": {
    label: "Home — Experiences Reel",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow", maxLength: 100 },
      { key: "title", type: "text", label: "Title", maxLength: 120 },
      { key: "description", type: "textarea", label: "Description", maxLength: 400 },
    ],
  },
  "home/facilities": {
    label: "Home — Facilities Gallery",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow", maxLength: 100 },
      { key: "title", type: "text", label: "Title", maxLength: 120 },
      { key: "description", type: "textarea", label: "Description", maxLength: 400 },
    ],
  },
  "home/stays-teaser": {
    label: "Home — Stays Teaser",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow", maxLength: 100 },
      { key: "title", type: "text", label: "Title", maxLength: 120 },
      { key: "description", type: "textarea", label: "Description", maxLength: 400 },
    ],
  },
  "home/gallery-teaser": {
    label: "Home — Gallery Teaser",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow", maxLength: 100 },
      { key: "title", type: "text", label: "Title", maxLength: 120 },
      { key: "description", type: "textarea", label: "Description", maxLength: 400 },
    ],
  },
  "home/values": {
    label: "Home — Core Values",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow", maxLength: 100 },
      { key: "title", type: "text", label: "Title", maxLength: 120 },
      { key: "sublines", type: "textarea", label: "Sublines/Info", maxLength: 400 },
    ],
  },
  "home/faq": {
    label: "Home — FAQ Preview",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow", maxLength: 100 },
      { key: "title", type: "text", label: "Title", maxLength: 120 },
      { key: "description", type: "textarea", label: "Description", maxLength: 400 },
    ],
  },
  "stays/hero": {
    label: "Stays — Hero",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Subheadline", maxLength: 280 },
    ],
  },
  "stays/rooms": {
    label: "Stays — Rooms Info",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Subheadline", maxLength: 280 },
    ],
  },
  "stays/pricing": {
    label: "Stays — Rates Table Info",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Subheadline", maxLength: 280 },
    ],
  },
  "stays/amenities": {
    label: "Stays — Amenities List Info",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Subheadline", maxLength: 280 },
    ],
  },
  "gallery/hero": {
    label: "Gallery — Hero",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Subheadline", maxLength: 200 },
    ],
  },
  "gallery/grid": {
    label: "Gallery — Grid Settings",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Description", maxLength: 280 },
    ],
  },
  "visit/hero": {
    label: "Visit — Hero",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Subheadline", maxLength: 280 },
    ],
  },
  "visit/map": {
    label: "Visit — Map Location Text",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Description", maxLength: 280 },
    ],
  },
  "visit/directions": {
    label: "Visit — Directions Info",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Description", maxLength: 280 },
    ],
  },
  "visit/nearby": {
    label: "Visit — Nearby Places Info",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Description", maxLength: 280 },
    ],
  },
  "faq/hero": {
    label: "FAQ — Hero",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Intro", maxLength: 400 },
    ],
  },
  "faq/questions": {
    label: "FAQ — Questions Data",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Subheading", maxLength: 280 },
    ],
  },
  "blog/hero": {
    label: "Blog — Hero Text",
    fields: [
      { key: "headline", type: "text", label: "Headline", maxLength: 120 },
      { key: "subheadline", type: "textarea", label: "Intro", maxLength: 400 },
    ],
  },
};

export function sectionSchemaKey(pageSlug: string, sectionSlug: string): string {
  return `${pageSlug}/${sectionSlug}`;
}
