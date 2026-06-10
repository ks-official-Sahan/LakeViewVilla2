# SEO Cluster Plan — Lake View Villa Tangalle

## Cluster Architecture

```
                    ┌─────────────────────┐
                    │   Homepage (/)       │
                    │   "luxury villa      │
                    │    Sri Lanka"        │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Stays (/stays) │  │  Visit (/visit) │  │  Blog (/blog)   │
│  "private villa │  │  "things to do  │  │  "Sri Lanka     │
│   Tangalle"     │  │   in Tangalle"  │  │   south coast"  │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │                    │                    ├─ Rekawa turtles
         │                    │                    ├─ Goyambokka beach
         │                    │                    ├─ Hiriketiya surf
         │                    │                    ├─ Yala safari
         │                    │                    ├─ Tangalle food
         │                    │                    └─ Mulkirigala temple
         │                    │
         │                    ├─ Rekawa Turtle Beach
         │                    ├─ Goyambokka Beach
         │                    ├─ Hummanaya Blowhole
         │                    ├─ Mulkirigala Rock Temple
         │                    ├─ Kalamatiya Sanctuary
         │                    └─ Yala National Park
         │
         ├─ Room 1 details
         ├─ Room 2 details
         ├─ Pricing / rates
         ├─ Amenities
         └─ Reviews

    FAQ (/faq) — supports all clusters
```

## Content Calendar (Priority Order)

### Month 1: Foundation
1. **Homepage optimization** — Enhanced schema, review integration
2. **Stays page** — Room-level Offer schemas, amenity markup
3. **Visit page** — HowTo directions, LocalBusiness schema

### Month 2: Content Cluster
4. **Blog: "Complete Guide to Tangalle Beaches"** — Targets beach keywords
5. **Blog: "Rekawa Turtle Watching Guide"** — Targets wildlife keywords
6. **Blog: "Best Day Trips from Tangalle"** — Targets excursion keywords

### Month 3: Expansion
7. **Blog: "Sri Lanka South Coast Food Guide"** — Targets food/dining keywords
8. **Blog: "Surfing in Hiriketiya"** — Targets surf keywords
9. **Blog: "Yala Safari from Tangalle"** — Targets safari keywords

### Month 4: Authority
10. **Blog: "Mulkirigala Rock Temple History"** — Targets culture keywords
11. **Blog: "Tangalle vs Mirissa vs Unawatuna"** — Targets comparison keywords
12. **Blog: "Planning a Sri Lanka South Coast Road Trip"** — Targets travel planning keywords

## Internal Linking Rules

- Every blog post links to `/stays` (booking CTA)
- Every blog post links to `/visit` (location context)
- Every blog post links to 2-3 related blog posts
- `/stays` links to `/visit` (explore area)
- `/visit` links to `/stays` (book your stay)
- `/faq` links to relevant blog posts for detailed answers
- Homepage features latest blog posts

## Schema Markup per Content Type

### Blog Post (BlogPosting)
- headline, description, image
- datePublished, dateModified
- author (Person)
- publisher (Organization with logo)
- mainEntityOfPage
- keywords

### Review (Review)
- itemReviewed (LodgingBusiness)
- reviewRating (ratingValue, bestRating, worstRating)
- reviewBody
- author (Person)
- datePublished

### AggregateRating
- itemReviewed (LodgingBusiness)
- ratingValue, reviewCount
- bestRating, worstRating

### Offer (for Stays)
- name, description
- price, priceCurrency
- availability
- offeredBy (LodgingBusiness)

### HowTo (for Visit)
- name, description
- step[] (HowToStep with position, name, text)
- totalTime (optional)
