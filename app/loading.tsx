export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b2027] text-[#f5f2e8]">
      <div className="relative flex flex-col items-center">
        {/* Cinematic Logo */}
        <span className="font-[var(--font-display)] text-xl font-bold tracking-[0.3em] uppercase text-[#c9a55a] animate-pulse">
          Lake View Villa
        </span>
        <span className="mt-2 text-xs tracking-widest text-[#7ba38c] uppercase font-mono">
          Tangalle, Sri Lanka
        </span>

        {/* Geometric progress line */}
        <div className="mt-8 h-[2px] w-32 overflow-hidden bg-teal-950">
          <div className="h-full w-full bg-[#c9a55a] origin-left animate-[shimmer_1.5s_infinite_linear]" />
        </div>
      </div>
    </div>
  );
}
