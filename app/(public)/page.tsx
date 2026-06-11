import SeoJsonLd from "@/components/SeoJsonLd";
import { ScrollStory } from "@/components/sections/ScrollStory";
import { Highlights } from "@/components/sections/highlights";
import { Footer } from "@/components/layout/footer";
import { BelowFold } from "@/components/layout/below-fold";
import { DirectionalTransition } from "@/components/motion/directional-transition";
import { FAQ_ITEMS } from "@/data/content";
import { getContentBlock } from "@/lib/cms/get-content-block";

export default async function HomePage() {
  const heroBlock = await getContentBlock("home", "hero", {
    headline: "Lake View Villa",
    subheadline: "Where every morning belongs to the lagoon."
  });

  const highlightsBlock = await getContentBlock("home", "highlights", null as any);
  const experiencesBlock = await getContentBlock("home", "experiences", null as any);
  const staysTeaserBlock = await getContentBlock("home", "stays-teaser", null as any);
  const galleryTeaserBlock = await getContentBlock("home", "gallery-teaser", null as any);
  const facilitiesBlock = await getContentBlock("home", "facilities", null as any);
  const valuesBlock = await getContentBlock("home", "values", null as any);
  const faqBlock = await getContentBlock("home", "faq", null as any);

  const homepageFaq = FAQ_ITEMS.map((item) => ({
    q: item.question,
    a: item.answer,
  }));

  return (
    <>
      <SeoJsonLd
        breadcrumb={[{ name: "Home", url: "https://lakeviewvillatangalle.com" }]}
        faq={homepageFaq}
      />
      <DirectionalTransition>
      {/* Phase 1–3: WebGL hero + magazine reveal + booking CTA */}
      <ScrollStory cmsHero={heroBlock} />

      {/* Amenity highlights grid */}
      <section id="highlights" aria-label="Villa highlights">
        <Highlights cmsData={highlightsBlock} />
      </section>

      {/* Below-fold sections: experiences, gallery teaser, stays, map, values, FAQ */}
      <BelowFold
        experiencesBlock={experiencesBlock}
        galleryTeaserBlock={galleryTeaserBlock}
        facilitiesBlock={facilitiesBlock}
        staysTeaserBlock={staysTeaserBlock}
        valuesBlock={valuesBlock}
        faqBlock={faqBlock}
      />
      <Footer />
      </DirectionalTransition>
    </>
  );
}
