import SeoJsonLd from "@/components/SeoJsonLd";
import { ScrollStory } from "@/components/sections/ScrollStory";
import { Highlights } from "@/components/sections/highlights";
import { Footer } from "@/components/layout/footer";
import { BelowFold } from "@/components/layout/below-fold";
import { FAQ_ITEMS } from "@/data/content";

export default function HomePage() {
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
      <ScrollStory />

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
