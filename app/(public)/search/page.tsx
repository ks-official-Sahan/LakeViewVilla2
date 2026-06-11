import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search — Lake View Villa Tangalle",
  description: "Search Lake View Villa Tangalle content.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/search" },
};

// Custom inline SVG Search Icon
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q?.trim() ?? "";
  const suggestions = ["stays", "gallery", "visit", "blog", "tangalle"];

  return (
    <main className="min-h-screen bg-[var(--color-background)] py-24 md:py-32 flex items-center justify-center">
      {/* Background ambient radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle 800px at 50% 30%, rgba(201,165,90,0.05), transparent 80%)",
        }}
      />

      <div className="w-full max-w-2xl px-4 md:px-8 space-y-8">
        {/* Header & Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-gold)]">
            Explore the villa
          </span>
          <h1 className="font-[var(--font-display)] text-3xl md:text-5xl font-black tracking-tight text-[var(--color-foreground)]">
            Search
          </h1>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            Search for information about stays, dining, stories, or activities.
          </p>
        </div>

        {/* Search Console Input Form */}
        <form action="/search" method="GET" className="relative">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Type your query (e.g. lagoon, rooms, chef)..."
            className="w-full rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] py-4 pl-12 pr-24 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-300"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-muted)]" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs uppercase font-bold tracking-wider rounded-sm hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>

        {/* Suggestion tags */}
        <div className="flex flex-wrap gap-2 items-center justify-center text-xs text-[var(--color-muted)]">
          <span>Try searching:</span>
          {suggestions.map((s) => (
            <Link
              key={s}
              href={`/search?q=${s}`}
              className="px-2.5 py-1 bg-teal-950/5 text-[var(--color-primary)] hover:bg-teal-950/10 border border-[var(--color-border)] rounded-sm transition-all"
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Query Results Placeholder (since search logic is integrated in stays/blog page views) */}
        {q && (
          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-foreground)]">
              Search Results for “{q}”
            </h2>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              We found references to <strong className="text-[var(--color-foreground)]">“{q}”</strong> in our details. 
              Please navigate to the respective section:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`/stays?q=${q}`}
                className="p-3 border border-[var(--color-border)] hover:border-[var(--color-gold)] rounded-sm text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-background)]/50 transition-colors"
              >
                Search in Stays & Rates →
              </Link>
              <Link
                href={`/blog?q=${q}`}
                className="p-3 border border-[var(--color-border)] hover:border-[var(--color-gold)] rounded-sm text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-background)]/50 transition-colors"
              >
                Search in Stories & Guides →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
