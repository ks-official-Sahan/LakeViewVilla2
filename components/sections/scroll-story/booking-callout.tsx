"use client";

interface BookingCalloutProps {
  onBook: () => void;
}

export function BookingCallout({ onBook }: BookingCalloutProps) {
  return (
    <section
      aria-label="Reservations info"
      className="relative overflow-hidden py-24 bg-[var(--color-background)] border-t border-[var(--color-border)]/50 transition-colors duration-300"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(201,165,90,0.06) 0%, transparent 60%)"
        }}
      />

      <div className="relative z-10 lv-container text-center max-w-4xl mx-auto">
        <p className="flex items-center justify-center gap-3 mb-6">
          <span className="h-px w-6 bg-[var(--color-gold)]/40" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
            Direct Booking
          </span>
          <span className="h-px w-6 bg-[var(--color-gold)]/40" />
        </p>

        <h2
          className="font-[var(--font-serif)] font-black text-[var(--color-foreground)] leading-tight tracking-tight mb-8 transition-colors duration-300"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
        >
          Your lagoon.
          <br />
          <span className="text-[var(--color-gold)] italic">Your sanctuary.</span>
        </h2>

        <div className="flex justify-center mt-12">
          <button
            onClick={onBook}
            aria-label="Connect via WhatsApp"
            className="group relative flex h-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-gold)] px-10 text-xs font-bold uppercase tracking-widest text-[var(--color-charcoal)] shadow-[0_8px_30px_rgba(201,165,90,0.2)] transition-all duration-300 hover:scale-[1.02] hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-[var(--color-charcoal)]"
          >
            <span>Check Availability on WhatsApp</span>
          </button>
        </div>
      </div>
    </section>
  );
}
