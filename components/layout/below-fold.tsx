"use client";

import { lazy, Suspense } from "react";

const ExperiencesReel = lazy(() => import("@/components/sections/experiences-reel").then(m => ({ default: m.ExperiencesReel })));
const GalleryTeaser = lazy(() => import("@/components/sections/gallery-teaser").then(m => ({ default: m.GalleryTeaser })));
const FacilitiesSection = lazy(() => import("@/components/sections/facilities"));
const StaysTeaser = lazy(() => import("@/components/sections/stays-teaser").then(m => ({ default: m.StaysTeaser })));
const MapDirections = lazy(() => import("@/components/sections/map-directions").then(m => ({ default: m.MapDirections })));
const ValuesSection = lazy(() => import("@/components/sections/values").then(m => ({ default: m.ValuesSection })));
const FAQ = lazy(() => import("@/components/sections/faq").then(m => ({ default: m.FAQ })));

interface BelowFoldProps {
  experiencesBlock?: any;
  galleryTeaserBlock?: any;
  facilitiesBlock?: any;
  staysTeaserBlock?: any;
  valuesBlock?: any;
  faqBlock?: any;
}

export function BelowFold({
  experiencesBlock,
  galleryTeaserBlock,
  facilitiesBlock,
  staysTeaserBlock,
  valuesBlock,
  faqBlock,
}: BelowFoldProps) {
  return (
    <Suspense fallback={null}>
      <ExperiencesReel cmsData={experiencesBlock} />
      <GalleryTeaser cmsData={galleryTeaserBlock} />
      <FacilitiesSection cmsData={facilitiesBlock} />
      <StaysTeaser cmsData={staysTeaserBlock} />
      <MapDirections />
      <ValuesSection cmsData={valuesBlock} />
      <FAQ cmsData={faqBlock} />
    </Suspense>
  );
}
