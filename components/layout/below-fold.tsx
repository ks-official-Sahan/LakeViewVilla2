"use client";

import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

// Minimalist, premium pulse skeleton for CLS mitigation
function SectionSkeleton({ className = "h-96" }: { className?: string }) {
  return (
    <div className="lv-container py-12">
      <Skeleton className={className} />
    </div>
  );
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
    <div className="w-full relative">
      {/* 1. Experiences Cinema Reel (Interest) */}
      <Suspense fallback={<SectionSkeleton className="h-[80vh] md:h-[90vh]" />}>
        <ExperiencesReel cmsData={experiencesBlock} />
      </Suspense>

      {/* 2. Photo Gallery Teaser (Desire) */}
      <Suspense fallback={<SectionSkeleton className="h-[75vh]" />}>
        <GalleryTeaser cmsData={galleryTeaserBlock} />
      </Suspense>

      {/* 3. Luxury Comforts & Facilities (Desire) */}
      <Suspense fallback={<SectionSkeleton className="h-[60vh]" />}>
        <FacilitiesSection cmsData={facilitiesBlock} />
      </Suspense>

      {/* 4. Stay Options Preview (Desire/Action) */}
      <Suspense fallback={<SectionSkeleton className="h-[80vh]" />}>
        <StaysTeaser cmsData={staysTeaserBlock} />
      </Suspense>

      {/* 5. Map & Navigation Guide (Action) */}
      <Suspense fallback={<SectionSkeleton className="h-[55vh]" />}>
        <MapDirections />
      </Suspense>

      {/* 6. Hospitality Values & Social Proof (Trust) */}
      <Suspense fallback={<SectionSkeleton className="h-[50vh]" />}>
        <ValuesSection cmsData={valuesBlock} />
      </Suspense>

      {/* 7. Frequently Asked Questions (Friction Elimination) */}
      <Suspense fallback={<SectionSkeleton className="h-[45vh]" />}>
        <FAQ cmsData={faqBlock} />
      </Suspense>
    </div>
  );
}
