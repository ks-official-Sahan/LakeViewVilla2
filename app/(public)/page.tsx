import SeoJsonLd from "@/components/SeoJsonLd";
import { ScrollStory } from "@/components/sections/ScrollStory";
import { Highlights } from "@/components/sections/highlights";
import { Footer } from "@/components/layout/footer";
import { BelowFold } from "@/components/layout/below-fold";
import { FAQ_ITEMS } from "@/data/content";
import { getContentBlock } from "@/lib/cms/get-content-block";

export default async function HomePage() {
  const heroBlock = await getContentBlock("home", "hero", {
    headline: "Lake View Villa",
    subheadline: "Where every morning belongs to the lagoon."
  });

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
      {/* Phase 1–3: WebGL hero + magazine reveal + booking CTA */}
      <ScrollStory cmsHero={heroBlock} />

      {/* Amenity highlights grid */}
      <section id="highlights" aria-label="Villa highlights">
        <Highlights />
      </section>

      {/* Below-fold sections: experiences, gallery teaser, stays, map, values, FAQ */}
      <BelowFold />
      <Footer />
    </>
  );
}
