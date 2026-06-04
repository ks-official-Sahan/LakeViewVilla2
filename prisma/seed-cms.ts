/**
 * prisma/seed-cms.ts
 *
 * Seeds every CMS ContentBlock used across all public pages.
 * Maps 1:1 with every getContentBlock() call in the app so that
 * pages read from the DB and never fall back to static data.
 *
 * Run with:
 *   npx tsx prisma/seed-cms.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Content Block Definitions ────────────────────────────────────────────────
// Each entry maps exactly to a getContentBlock(pageSlug, sectionSlug, fallback) call.

const CMS_BLOCKS: Array<{ pageSlug: string; sectionSlug: string; data: unknown }> = [
  // ════════════════════════════════════════════════════════
  // HOME PAGE  (app/(public)/page.tsx)
  // ════════════════════════════════════════════════════════
  {
    pageSlug: "home",
    sectionSlug: "hero",
    data: {
      headline: "Lake View Villa",
      subheadline: "Where every morning belongs to the lagoon.",
    },
  },
  {
    pageSlug: "home",
    sectionSlug: "highlights",
    data: {
      eyebrow: "What Awaits You",
      title: "Everything You Need for a Perfect Stay",
      items: [
        { icon: "waves",    label: "Panoramic lake view",   description: "Wake up to breathtaking lagoon panoramas from every room." },
        { icon: "wind",     label: "A/C bedrooms",          description: "Both super king bedrooms are fully air-conditioned." },
        { icon: "wifi",     label: "Fast Wi-Fi (~50+ Mbps)", description: "Reliable high-speed internet throughout the property." },
        { icon: "utensils", label: "Chef on request",       description: "Enjoy freshly prepared local and international cuisine." },
        { icon: "car",      label: "Airport pickups",       description: "Comfortable transfers from BIA directly to your door." },
        { icon: "car",      label: "Free parking",          description: "Secure, private on-site parking at no extra cost." },
      ],
    },
  },
  {
    pageSlug: "home",
    sectionSlug: "experiences",
    data: {
      eyebrow: "Nearby Experiences",
      title: "Explore Tangalle & Beyond",
      subtitle: "Step outside and discover the wonders of Sri Lanka's southern coast — all easily reached from Lake View Villa.",
      items: [
        { label: "Rekawa turtle beach",      icon: "🐢", description: "Watch sea turtles nest on one of Sri Lanka's most pristine beaches." },
        { label: "Mulkirigala rock temple",   icon: "🏯", description: "Ancient cave temple carved into dramatic rock outcrops." },
        { label: "Yala safari day trip",      icon: "🐆", description: "Spot leopards, elephants, and exotic birds in Yala National Park." },
        { label: "Hummanaya blowhole",        icon: "💦", description: "One of Asia's largest blowholes — a spectacular natural show." },
      ],
    },
  },
  {
    pageSlug: "home",
    sectionSlug: "stays-teaser",
    data: {
      eyebrow: "Accommodation",
      title: "Two Private Rooms, One Extraordinary Villa",
      subtitle: "Message on WhatsApp for the best available rate and instant confirmation.",
      cta: { label: "View Stays & Rates", href: "/stays" },
      rooms: [
        {
          name: "Villa Room 1",
          sleeps: 2,
          bed: "1 King Bed",
          features: ["Private bathroom", "Air conditioning", "Full kitchen access", "Lake view"],
          image: "/villa/optimized/room_01_img_01.webp",
        },
        {
          name: "Villa Room 2",
          sleeps: 2,
          bed: "1 King Bed",
          features: ["Private bathroom", "Air conditioning", "Full kitchen access", "Garden view"],
          image: "/villa/optimized/room_02_img_01.webp",
        },
      ],
    },
  },
  {
    pageSlug: "home",
    sectionSlug: "gallery-teaser",
    data: {
      eyebrow: "Gallery",
      title: "A Glimpse of Paradise",
      subtitle: "Every corner of Lake View Villa is designed to inspire.",
      cta: { label: "View Full Gallery", href: "/gallery" },
      images: [
        { src: "/villa/optimized/villa_img_02.webp",               alt: "Villa exterior at dusk" },
        { src: "/villa/optimized/drone_view_villa.webp",           alt: "Aerial drone view of the villa" },
        { src: "/villa/optimized/lake_img_01.webp",                alt: "Serene lagoon view" },
        { src: "/villa/optimized/garden_img_01.webp",              alt: "Lush private garden" },
        { src: "/villa/optimized/with_guests_04_dinning.webp",     alt: "Guests dining al fresco" },
        { src: "/villa/optimized/room_01_img_01.webp",             alt: "Bedroom 1 with king bed" },
      ],
    },
  },
  {
    pageSlug: "home",
    sectionSlug: "facilities",
    data: {
      eyebrow: "Facilities",
      title: "Everything Included",
      subtitle: "Lake View Villa comes fully equipped for an exceptional stay.",
      items: [
        {
          id: "bedroom-1",
          badge: "🛏",
          title: "Bedroom 1",
          description: "A spacious super king bedroom with air-conditioning and a cooling fan, designed for restful sleep. Bright, airy, and elegantly furnished for your comfort.",
          image: "/villa/optimized/room_01_img_01.webp",
          alt: "Super king Bedroom 1 with canopy net",
        },
        {
          id: "bedroom-2",
          badge: "🛏",
          title: "Bedroom 2",
          description: "Another super king bedroom offering the same comfort, complete with modern amenities, fresh linens, and a calming atmosphere — perfect for families or friends.",
          image: "/villa/optimized/room_02_img_01.webp",
          alt: "Super king Bedroom 2 with four-poster bed",
        },
        {
          id: "kitchen",
          badge: "🍳",
          title: "Kitchen",
          description: "A fully equipped modern kitchen with a stove, fridge, washing machine, and all essentials — cook home-style meals or fresh local dishes with ease.",
          image: "/villa/optimized/kitchen_img_02.webp",
          alt: "Modern kitchen essentials",
        },
        {
          id: "outdoor",
          badge: "🌿",
          title: "Outdoor",
          description: "Relax on the wide veranda overlooking the private garden and tranquil lake. Sunrise views, bird watching, and peaceful greenery await.",
          image: "/villa/optimized/villa_img_01.webp",
          alt: "Wide veranda and private garden",
        },
        {
          id: "bathroom-1",
          badge: "🚿",
          title: "Bathroom 1",
          description: "Spacious and well-designed with a refreshing hot-water shower — perfect after a day at the beach or exploring Tangalle.",
          image: "/villa/optimized/room_01_img_04_bathroom.webp",
          alt: "Bathroom with hot water shower",
        },
        {
          id: "bathroom-2",
          badge: "🚿",
          title: "Bathroom 2",
          description: "Equally comfortable and modern, ensuring every guest has easy access to private facilities.",
          image: "/villa/optimized/room_02_img_04_bathroom.webp",
          alt: "Second bathroom",
        },
        {
          id: "cot",
          badge: "🛏",
          title: "Cot",
          description: "A baby cot is available for families traveling with little ones — a child-friendly getaway made easy.",
          image: "/villa/optimized/room_01_img_03_cot.webp",
          alt: "Baby cot in master bedroom",
        },
        {
          id: "balcony",
          badge: "🌅",
          title: "Balcony",
          description: "Step onto the balcony for serene lake views, morning sunshine, and soothing sounds of nature — perfect for coffee, reading, or quiet reflection.",
          image: "/villa/optimized/villa_outside_01.webp",
          alt: "Balcony with lake view at sunrise",
        },
      ],
    },
  },
  {
    pageSlug: "home",
    sectionSlug: "values",
    data: {
      eyebrow: "Our Values",
      title: "The Value We Provide to You..",
      sublines: ["Closest Beach: Goyambokka Beach (less than 1 km)"],
      items: [
        {
          id: "transport",
          title: "Easy & Comfortable Transport",
          body: "Make your journey stress-free with our reliable transport options at Lake View Villa Tangalle. Whether you prefer the charm of a local tuk-tuk, the convenience of a private car, or the comfort of our air-conditioned KDH van that seats up to seven passengers, exploring Tangalle and its stunning surroundings has never been easier. Enjoy seamless travel experiences and focus on creating unforgettable memories.",
          icon: "car",
        },
        {
          id: "beach",
          title: "Peaceful Stay Near the Beach",
          body: "Tucked away in a serene location surrounded by lush greenery, Lake View Villa Tangalle is just 550 meters from the seaside — a leisurely 5–10 minute walk. Here, you can immerse yourself in the soothing sounds of nature, the fresh ocean breeze, and the calming ambiance of a private retreat, offering the perfect balance of peace and coastal charm.",
          icon: "waves",
        },
        {
          id: "kitchen",
          title: "Fully Equipped Modern Kitchen",
          body: "Feel at home in our modern, fully equipped kitchen at Lake View Villa Tangalle. Complete with a stove, fridge, and washing machine, it's ideal for guests who love the comfort of home-cooked meals or wish to try their hand at preparing fresh local seafood. Whether you're a culinary enthusiast or simply looking for convenience, our kitchen has everything you need.",
          icon: "utensils",
        },
        {
          id: "ac",
          title: "Spacious Bedrooms with A/C",
          body: "Experience true relaxation in our spacious villa featuring two super king bedrooms, each fitted with air conditioning and ceiling fans for your comfort. The bright, airy design of Lake View Villa Tangalle ensures a restful night's sleep and a refreshing atmosphere throughout your stay — the perfect setting for unforgettable moments.",
          icon: "wind",
        },
        {
          id: "garden",
          title: "Relaxing Garden & Veranda",
          body: "Step outside to discover your own private oasis at Lake View Villa Tangalle. The spacious veranda and dining areas open to a lush garden filled with fruit trees, offering the perfect blend of natural beauty and comfort. Wake up to the golden glow of the morning sun reflecting over the peaceful lake, and enjoy the magical experience of bird watching as colorful local species flutter around the garden.",
          icon: "trees",
        },
        {
          id: "shower",
          title: "Refreshing Hot Water Shower",
          body: "After a day of sun, sand, and exploration, indulge in the comfort of our spacious bathroom featuring a rejuvenating hot water shower. At Lake View Villa Tangalle, every detail has been designed to refresh your body and mind, ensuring your stay is as relaxing and comfortable as possible.",
          icon: "shower",
        },
      ],
    },
  },
  {
    pageSlug: "home",
    sectionSlug: "faq",
    data: [
      { question: "Where is Lake View Villa Tangalle located?", answer: "Lake View Villa Tangalle is located on a serene lagoon in Tangalle, Sri Lanka. It provides panoramic lake views and easy access to beautiful local attractions such as Goyambokka Beach." },
      { question: "How do I book a stay at Lake View Villa Tangalle?", answer: "You can book a stay at Lake View Villa Tangalle by messaging us on WhatsApp for the best available rate and instant confirmation, or you can book directly through our Booking.com or Airbnb listings." },
      { question: "Is there air conditioning at the villa?", answer: "Yes, all bedrooms at Lake View Villa Tangalle are equipped with air conditioning to ensure your comfort during your stay in Sri Lanka." },
      { question: "Are meals included, and is there a chef available?", answer: "While meals are not automatically included, Lake View Villa Tangalle offers a personalized chef service on request. Our chef can prepare delicious local Sri Lankan and international cuisine." },
      { question: "Do you provide airport transfers to Tangalle?", answer: "Yes, Lake View Villa Tangalle offers convenient airport pickup services. Please contact us prior to your arrival to arrange your transfer directly to the villa." },
      { question: "What about Wi-Fi speed at the villa?", answer: "Lake View Villa Tangalle provides fast and reliable Wi-Fi with speeds of approximately 50+ Mbps throughout the property, making it ideal for remote workers and digital nomads." },
      { question: "What are the best things to do near Lake View Villa Tangalle?", answer: "Guests at Lake View Villa Tangalle can easily visit Rekawa turtle beach, explore the Mulkirigala rock temple, take a Yala safari day trip, or see the Hummanaya blowhole." },
      { question: "Is Lake View Villa Tangalle a private villa?", answer: "Yes, Lake View Villa Tangalle is a private vacation rental. Guests enjoy exclusive access to the villa, ensuring a peaceful and serene lagoon stay without the crowds of large hotels." },
      { question: "Is Lake View Villa Tangalle family-friendly?", answer: "Absolutely. Lake View Villa Tangalle is family-friendly, offering spacious rooms, beautiful gardens, and safe surroundings for a memorable family vacation in Sri Lanka." },
      { question: "How far is the beach from Lake View Villa Tangalle?", answer: "Lake View Villa Tangalle is just minutes away from pristine sandy beaches, offering guests the perfect balance of a tranquil lagoon retreat and easy beach access." },
    ],
  },

  // ════════════════════════════════════════════════════════
  // STAYS PAGE  (app/(public)/stays/page.tsx)
  // ════════════════════════════════════════════════════════
  {
    pageSlug: "stays",
    sectionSlug: "hero",
    data: {
      headline: "Stays & Rates",
      subheadline: "Experience tranquility on a serene lagoon—best rates via direct WhatsApp.",
    },
  },
  {
    pageSlug: "stays",
    sectionSlug: "rooms",
    data: [
      {
        name: "Villa Room 1",
        sleeps: 2,
        features: ["Bedroom 1: 1 King Bed", "Private bathroom", "Full Equipped Kitchen", "Air conditioning"],
      },
      {
        name: "Villa Room 2",
        sleeps: 2,
        features: ["Bedroom 2: 1 King Bed", "Private bathroom", "Full Equipped Kitchen", "Air conditioning"],
      },
    ],
  },
  {
    pageSlug: "stays",
    sectionSlug: "pricing",
    data: [
      {
        season: "Regular Season",
        period: "Jan–Dec",
        nightly: "Contact for rates",
        minNights: 1,
        notes: "Rates vary by dates and length of stay.",
      },
    ],
  },
  {
    pageSlug: "stays",
    sectionSlug: "amenities",
    data: [
      "Beachfront location (650m to beach)",
      "52+ Mbps Wi-Fi coverage",
      "Free private parking",
      "24-hour front desk service",
      "On-site restaurant & bar",
      "Air conditioning in all rooms",
      "Full kitchen facilities",
      "Private terrace & balcony",
      "BBQ facilities",
      "Laundry service",
      "Airport shuttle available",
      "Bicycle rental",
    ],
  },

  // ════════════════════════════════════════════════════════
  // VISIT PAGE  (app/(public)/visit/page.tsx)
  // ════════════════════════════════════════════════════════
  {
    pageSlug: "visit",
    sectionSlug: "hero",
    data: {
      headline: "Visit Us",
      subheadline: "Plan your journey to Lake View Villa Tangalle with precise directions and fast contact options.",
    },
  },
  {
    pageSlug: "visit",
    sectionSlug: "map",
    data: {
      headline: "Location & Map",
      subheadline: "",
      coordinates: { lat: 6.0173643, lng: 80.7811559 },
      googleMapsUrl: "https://maps.app.goo.gl/wRLkZBxMSvfhd2jZA",
    },
  },
  {
    pageSlug: "visit",
    sectionSlug: "directions",
    data: {
      headline: "How to Get Here",
      subheadline: "~35 minutes from Matara • ~3 hours from Colombo Airport",
      steps: [
        "From Tangalle town, head towards the lagoon area",
        "Follow the coastal road for approximately 3km",
        "Turn left at the Lake View Villa signboard",
        "Call or WhatsApp us for the exact pin location",
      ],
    },
  },
  {
    pageSlug: "visit",
    sectionSlug: "nearby",
    data: {
      headline: "Nearby Attractions",
      subheadline: "Explore Tangalle's finest sights — all within easy reach of the villa.",
      attractions: [
        { name: "Rekawa Turtle Beach",       distance: "8 km",  description: "One of Sri Lanka's top sea turtle nesting sites." },
        { name: "Goyambokka Beach",          distance: "1 km",  description: "Pristine sandy beach just a short walk away." },
        { name: "Hummanaya Blowhole",        distance: "18 km", description: "Asia's second largest blowhole — a spectacular sight." },
        { name: "Mulkirigala Rock Temple",   distance: "20 km", description: "Ancient Buddhist cave temple with panoramic views." },
        { name: "Tangalle Lagoon",           distance: "2 km",  description: "Serene lagoon perfect for sunrise kayaking." },
        { name: "Yala National Park",        distance: "65 km", description: "World-famous wildlife reserve — leopards, elephants & more." },
      ],
    },
  },

  // ════════════════════════════════════════════════════════
  // FAQ PAGE  (app/(public)/faq/page.tsx)
  // ════════════════════════════════════════════════════════
  {
    pageSlug: "faq",
    sectionSlug: "hero",
    data: {
      headline: "Frequently Asked Questions",
      subheadline: "Find answers to common questions about Lake View Villa Tangalle",
    },
  },
  {
    pageSlug: "faq",
    sectionSlug: "questions",
    data: [
      { question: "Where is Lake View Villa Tangalle located?", answer: "Lake View Villa Tangalle is located on a serene lagoon in Tangalle, Sri Lanka. It provides panoramic lake views and easy access to beautiful local attractions such as Goyambokka Beach." },
      { question: "How do I book a stay at Lake View Villa Tangalle?", answer: "You can book a stay at Lake View Villa Tangalle by messaging us on WhatsApp for the best available rate and instant confirmation, or you can book directly through our Booking.com or Airbnb listings." },
      { question: "Is there air conditioning at the villa?", answer: "Yes, all bedrooms at Lake View Villa Tangalle are equipped with air conditioning to ensure your comfort during your stay in Sri Lanka." },
      { question: "Are meals included, and is there a chef available?", answer: "While meals are not automatically included, Lake View Villa Tangalle offers a personalized chef service on request. Our chef can prepare delicious local Sri Lankan and international cuisine." },
      { question: "Do you provide airport transfers to Tangalle?", answer: "Yes, Lake View Villa Tangalle offers convenient airport pickup services. Please contact us prior to your arrival to arrange your transfer directly to the villa." },
      { question: "What about Wi-Fi speed at the villa?", answer: "Lake View Villa Tangalle provides fast and reliable Wi-Fi with speeds of approximately 50+ Mbps throughout the property, making it ideal for remote workers and digital nomads." },
      { question: "What are the best things to do near Lake View Villa Tangalle?", answer: "Guests at Lake View Villa Tangalle can easily visit Rekawa turtle beach, explore the Mulkirigala rock temple, take a Yala safari day trip, or see the Hummanaya blowhole." },
      { question: "Is Lake View Villa Tangalle a private villa?", answer: "Yes, Lake View Villa Tangalle is a private vacation rental. Guests enjoy exclusive access to the villa, ensuring a peaceful and serene lagoon stay without the crowds of large hotels." },
      { question: "Is Lake View Villa Tangalle family-friendly?", answer: "Absolutely. Lake View Villa Tangalle is family-friendly, offering spacious rooms, beautiful gardens, and safe surroundings for a memorable family vacation in Sri Lanka." },
      { question: "How far is the beach from Lake View Villa Tangalle?", answer: "Lake View Villa Tangalle is just minutes away from pristine sandy beaches, offering guests the perfect balance of a tranquil lagoon retreat and easy beach access." },
    ],
  },

  // ════════════════════════════════════════════════════════
  // GALLERY PAGE  (app/(public)/gallery/page.tsx)
  // ════════════════════════════════════════════════════════
  {
    pageSlug: "gallery",
    sectionSlug: "hero",
    data: {
      headline: "Villa Gallery",
      subheadline: "A curated reel of the lagoon, interiors, and surrounding nature.",
    },
  },

  // ════════════════════════════════════════════════════════
  // BLOG PAGE  (app/(public)/blog/page.tsx)
  // ════════════════════════════════════════════════════════
  {
    pageSlug: "blog",
    sectionSlug: "hero",
    data: {
      headline: "Stories & Guides",
      subheadline: "Travel tips, Tangalle explorations, and villa life. Your curated guide to Sri Lanka's breathtaking southern coast.",
    },
  },
];

// ─── Upsert Logic ─────────────────────────────────────────────────────────────

async function seedCmsBlocks() {
  console.log("🌱 Seeding CMS content blocks...\n");

  let created = 0;
  let skipped = 0;

  for (const block of CMS_BLOCKS) {
    const { pageSlug, sectionSlug, data } = block;

    const existing = await prisma.contentBlock.findFirst({
      where: { pageSlug, sectionSlug },
      orderBy: { version: "desc" },
    });

    if (existing) {
      console.log(`  ⏭  ${pageSlug}/${sectionSlug} — already exists (v${existing.version}), skipping`);
      skipped++;
      continue;
    }

    await prisma.contentBlock.create({
      data: {
        pageSlug,
        sectionSlug,
        data: data as any,
        version: 1,
        publishedAt: new Date(),
      },
    });

    console.log(`  ✅ ${pageSlug}/${sectionSlug} — seeded`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped (already exist): ${skipped}`);
}

seedCmsBlocks()
  .catch((error) => {
    console.error("❌ CMS seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
