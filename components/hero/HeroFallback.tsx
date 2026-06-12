export function HeroFallback() {
  return (
    <div
      className="absolute inset-0 bg-[#0b2027] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer-translate_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-teal-500/10 before:to-transparent"
      aria-hidden
    />
  );
}
