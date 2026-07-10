"use client";

import useSWR from "swr";
import * as React from "react";
import Link from "next/link";
import { navForward } from "@/lib/navigation/view-transitions";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MagicCard } from "@/components/ui/magic-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ErrorBoundary } from "@/components/error-boundary";
import FloatingAudioSwitch from "@/components/FloatingAudioSwitch";
import { AudioProvider } from "@/context/AudioContext";
import Particals from "@/components/ui2/Particles";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandWhatsapp,
} from "@tabler/icons-react";

type GH = {
  user?: {
    login: string;
    name?: string;
    html_url: string;
    avatar_url: string;
    bio?: string;
    followers: number;
    following: number;
    public_repos: number;
    location?: string;
  };
  repos?: any[];
  pinned?: any[];
  events?: {
    id: string;
    type: string;
    repo: { name: string; url: string };
    created_at: string;
  }[];
  ts?: number;
  error?: boolean;
};

type Status = {
  results: {
    label: string;
    url: string;
    ok: boolean;
    status: number;
    latency: number;
  }[];
  best?: { url: string };
  ts?: number;
};

const fetcher = (u: string) => fetch(u).then((r) => r.json());

// Inline SVGs for developer profile
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6v7z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
  </svg>
);

const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const GitForkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9M12 15v-3" />
  </svg>
);

const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function DeveloperClient({
  initial,
  statusInitial,
}: {
  initial: GH | null;
  statusInitial: Status | null;
}) {
  const prefersReducedMotion = useReducedMotion();

  // SWR tuned for stability + UX
  const { data: gh } = useSWR<GH>("/api/dev/github", fetcher, {
    fallbackData: initial ?? undefined,
    refreshInterval: 60_000,
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const { data: status } = useSWR<Status>("/api/dev/status", fetcher, {
    fallbackData: statusInitial ?? undefined,
    refreshInterval: 30_000,
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: 15_000,
  });

  const user = gh?.user;
  const pinned = gh?.pinned ?? [];
  const repos = gh?.repos ?? [];
  const events = gh?.events ?? [];

  // Status selector
  const [target, setTarget] = React.useState<string | null>(null);
  const best = React.useMemo(() => {
    if (target) return target;
    const ok = (status?.results || []).filter((r) => r.ok);
    if (!ok.length) return status?.best?.url || "https://sahansachintha.com";
    const fastest = ok.reduce((a, b) => (a.latency < b.latency ? a : b));
    return fastest.url;
  }, [status, target]);

  // BG parallax
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start", "end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  const socials = [
    {
      name: "GitHub",
      icon: IconBrandGithub,
      href: user?.html_url || "https://github.com/ks-official-sahan",
    },
    {
      name: "LinkedIn",
      icon: IconBrandLinkedin,
      href: "https://www.linkedin.com/in/sahan-sachintha",
    },
    { name: "Email", icon: MailIcon, href: "mailto:ks.official.sahan@gmail.com" },
    {
      name: "WhatsApp",
      icon: IconBrandWhatsapp,
      href: "https://wa.me/94768701148?text=Hello%20Sahan.%20I%20want%20to%20contact%20you.%20I%20saw%20your%20portfolio%20from%20lake%20view%20villa.",
    },
  ];

  return (
    <ErrorBoundary>
      <AudioProvider>
        <Particals />
        <Particals />
        <div ref={ref} className="relative min-h-screen isolate">
          {/* Cinematic Aurora / Grid background */}
          <motion.div
            aria-hidden
            className="fixed inset-0 -z-10"
            style={prefersReducedMotion ? undefined : { y }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_12%_10%,color-mix(in_oklab,theme(colors.primary.DEFAULT)_18%,transparent),transparent_60%),radial-gradient(900px_500px_at_80%_70%,color-mix(in_oklab,theme(colors.accent.DEFAULT)_14%,transparent),transparent_60%),linear-gradient(180deg,theme(colors.background),color-mix(in_oklab,theme(colors.background)_82%,black_18%))]" />
            <div className="absolute inset-0 opacity-[.08] bg-grid-small-[hsl(var(--border))]" />
            <Spotlight
              className="top-28 left-10 md:left-40"
              fill="rgba(56,189,248,0.35)"
            />
          </motion.div>

          {/* ===== HERO ===== */}
          <section
            className="safe-top pt-16 md:pt-24 pb-10 md:pb-14"
            aria-labelledby="hero-title"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[420px,1fr] gap-8 items-stretch">
              {/* Portrait / vertical card */}
              <MagicCard className="relative bg-card/70 backdrop-blur-xl border border-border rounded-sm p-5 overflow-hidden">
                <div className="absolute inset-x-0 -top-20 h-40 blur-2xl opacity-60 bg-gradient-to-r from-primary/40 via-accent/30 to-secondary/40" />
                <div className="relative flex flex-col items-center">
                  <Avatar className="h-32 w-32 ring-4 ring-primary/25 shadow-2xl rounded-sm">
                    <AvatarImage
                      src={user?.avatar_url}
                      alt={`${user?.name || "Sahan"} avatar`}
                    />
                    <AvatarFallback className="text-3xl font-bold">
                      SS
                    </AvatarFallback>
                  </Avatar>
                  <h1
                    id="hero-title"
                    className="mt-4 text-center text-4xl font-extrabold leading-tight"
                  >
                    <span className="text-gradient-primary">Hyper-Luxury</span>
                    <br />
                    Developer
                  </h1>
                  <p className="mt-3 text-center text-muted-foreground text-sm">
                    {user?.name || "Sahan Sachintha"} — Full-Stack Engineer
                  </p>

                  {/* Status selector */}
                  <div className="mt-6 w-full">
                    <label htmlFor="status" className="sr-only">
                      Prefer a live portfolio endpoint
                    </label>
                    <div
                      role="radiogroup"
                      aria-label="Choose live portfolio endpoint"
                      className="grid grid-cols-2 gap-2"
                    >
                      {(status?.results || []).map((r) => {
                        const active = (target || best) === r.url;
                        const ok = r.ok;
                        return (
                          <button
                            key={r.url}
                            role="radio"
                            aria-checked={active}
                            onClick={() => setTarget(r.url)}
                            title={`${r.url} • ${
                              ok ? `${Math.round(r.latency)}ms` : "Down"
                            }`}
                            className={`group rounded-sm border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer ${
                              active
                                ? "border-primary/50 bg-primary/10"
                                : "border-border bg-card/60 hover:bg-card/80"
                            } ${
                              ok ? "text-foreground" : "opacity-60 line-through"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`size-2 rounded-full ${
                                  ok ? "bg-emerald-500" : "bg-red-500"
                                }`}
                                aria-hidden
                              />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {r.label}
                              </span>
                              <span className="ml-auto text-xs opacity-70">
                                {ok
                                  ? `${Math.max(
                                      1,
                                      Math.min(9999, Math.round(r.latency))
                                    )}ms`
                                  : "Down"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest text-center">
                      Fastest OK endpoint is active by default.
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 w-full">
                    <Badge variant="secondary" className="justify-center rounded-sm">
                      <MapPinIcon className="mr-1.5 h-4 w-4" />{" "}
                      <span className="text-[9px] uppercase tracking-wider">{user?.location || "Sri Lanka"}</span>
                    </Badge>
                    <Badge variant="secondary" className="justify-center rounded-sm">
                      <CalendarIcon className="mr-1.5 h-4 w-4" />{" "}
                      <span className="text-[9px] uppercase tracking-wider">5+ Years</span>
                    </Badge>
                    <Badge variant="secondary" className="justify-center rounded-sm">
                      <GlobeIcon className="mr-1.5 h-4 w-4" />{" "}
                      <span className="text-[9px] uppercase tracking-wider">Global</span>
                    </Badge>
                  </div>
                </div>
              </MagicCard>

              {/* Right column – value prop + CTAs */}
              <MagicCard className="relative bg-card/70 backdrop-blur-xl border border-border rounded-sm overflow-hidden">
                <div className="absolute inset-0 pointer-events-none [mask-image:linear-gradient(180deg,black,transparent)]">
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[110%] rounded-full bg-gradient-to-r from-primary/25 via-accent/25 to-secondary/25 blur-2xl" />
                </div>

                <div className="relative p-8 md:p-10 flex flex-col justify-between h-full">
                  <p className="text-lg md:text-xl text-muted-foreground md:max-w-prose lg:max-w-full leading-relaxed">
                    I design and engineer premium, **future-proof** products
                    with <strong>Next.js</strong>, <strong>TypeScript</strong>,{" "}
                    <strong>GSAP</strong>, <strong>Framer Motion</strong>,
                    realtime stacks, robust CI/CD, <strong>SEO</strong> and
                    meticulous attention to motion, a11y, and performance.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 items-center">
                    <Button
                      size="lg"
                      className="shadow-lg rounded-sm bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
                      asChild
                      data-magnetic
                    >
                      <Link
                        href={best}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View portfolio"
                      >
                        <ShieldCheckIcon className="mr-2 h-5 w-5" />
                        View Portfolio
                        <ExternalLinkIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>

                    {socials.map((s) => (
                      <Button
                        key={s.name}
                        size="lg"
                        variant="outline"
                        className="rounded-sm border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                        asChild
                        data-magnetic
                      >
                        <Link
                          href={s.href}
                          target={s.name !== "Email" ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          aria-label={s.name}
                        >
                          <s.icon className="mr-2 h-5 w-5" />
                          {s.name}
                          {s.name !== "Email" && (
                            <ExternalLinkIcon className="ml-2 h-4 w-4" />
                          )}
                        </Link>
                      </Button>
                    ))}

                    <Button size="lg" variant="secondary" className="rounded-sm" asChild>
                      <Link
                        href="/developer/cv"
                        transitionTypes={[...navForward]}
                        aria-label="Open print-ready CV mode"
                      >
                        <ZapIcon className="mr-2 h-5 w-5" /> CV Mode
                      </Link>
                    </Button>
                  </div>

                  {/* KPIs */}
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Stat label="Followers" value={user?.followers} />
                    <Stat label="Public Repos" value={user?.public_repos} />
                    <Stat label="Following" value={user?.following} />
                    <Stat
                      label="Synced"
                      value={
                        gh?.ts ? new Date(gh.ts).toLocaleTimeString() : "—"
                      }
                    />
                  </div>
                </div>
              </MagicCard>
            </div>
          </section>

          {/* ===== Flagship Work ===== */}
          <Section
            title="Flagship Work"
            subtitle="Curated repositories that embody my standards"
            className="bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.06)_20%,transparent_60%)] dark:bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.18)_20%,transparent_60%)]"
          >
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {(pinned.length ? pinned : repos.slice(0, 6)).map((r: any) => (
                <RepoCard key={r.id} r={r} />
              ))}
              {!pinned.length && !repos.length && <SkeletonCard />}
            </div>
          </Section>

          {/* ===== Recent Activity ===== */}
          <Section title="Recent Activity" subtitle="Freshly updated codebases">
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {(gh?.repos || []).map((r: any) => (
                <RepoCard key={r.id} r={r} />
              ))}
              {!gh?.repos?.length && <SkeletonCard />}
            </div>
          </Section>

          {/* ===== Live GitHub Feed ===== */}
          <Section
            title="Live GitHub Feed"
            subtitle="Public events in near-realtime"
          >
            <div className="mt-8 space-y-4">
              {(events || []).slice(0, 10).map((e: any) => (
                <MagicCard
                  key={e.id}
                  className="p-4 flex items-center gap-3 bg-card/70 backdrop-blur-xl border border-border rounded-sm"
                >
                  <ActivityIcon className="h-4 w-4 text-primary" aria-hidden />
                  <div className="text-sm leading-relaxed">
                    <span className="font-medium">
                      {e.type.replace("Event", "")}
                    </span>{" "}
                    on{" "}
                    <a
                      href={e.repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-dotted"
                    >
                      {e.repo.name}
                    </a>{" "}
                    •{" "}
                    <span className="opacity-70">
                      {new Date(e.created_at).toLocaleString()}
                    </span>
                  </div>
                </MagicCard>
              ))}
              {!events?.length && (
                <div
                  className="h-10 rounded-sm bg-muted/40 animate-pulse"
                  aria-hidden
                />
              )}
            </div>
          </Section>

          {/* ===== CTA ===== */}
          <section className="py-16" aria-labelledby="cta">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <MagicCard className="p-8 md:p-10 text-center bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-sm">
                <h2
                  id="cta"
                  className="text-3xl md:text-4xl font-extrabold text-shadow-ambient"
                >
                  Let’s build something premium
                </h2>
                <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm">
                  Design-driven engineering for products that must feel
                  extraordinary—delivered with world-class performance.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="shadow-lg rounded-sm bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90" asChild>
                    <Link
                      href={
                        user?.html_url || "https://github.com/ks-official-sahan"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconBrandGithub className="mr-2 h-5 w-5" /> GitHub{" "}
                      <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-sm border-[var(--color-border)]" asChild>
                    <Link href="mailto:ks.official.sahan@gmail.com">
                      <MailIcon className="mr-2 h-5 w-5" /> Contact
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" className="rounded-sm" asChild>
                    <Link href={best} target="_blank" rel="noopener noreferrer">
                      <GlobeIcon className="mr-2 h-5 w-5" /> Portfolio{" "}
                      <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <Separator className="my-6" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Response within 24h • Mon–Fri • GMT+5:30
                </p>
              </MagicCard>
            </div>
          </section>

          {/* Floating audio switch preserved */}
          <FloatingAudioSwitch />
        </div>
      </AudioProvider>
    </ErrorBoundary>
  );
}

/* ---------------- small pieces ---------------- */

function Section({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const id = title.replace(/\s+/g, "-").toLowerCase();
  return (
    <section className={`py-14 ${className || ""}`} aria-labelledby={id}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2
            id={id}
            className="text-3xl font-extrabold tracking-tight"
          >
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  const display =
    typeof value === "number" ? value.toLocaleString() : String(value ?? "—");
  const pct =
    typeof value === "number"
      ? Math.max(6, Math.min(100, (value / 100) * 22))
      : 0;
  return (
    <MagicCard className="p-4 text-center bg-card/70 backdrop-blur-xl border border-border rounded-sm">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{display}</div>
      <Progress value={pct} className="mt-2 h-1 rounded-none" />
    </MagicCard>
  );
}

function RepoCard({ r }: { r: any }) {
  return (
    <MagicCard className="group p-5 h-full bg-card/70 backdrop-blur-xl border border-border rounded-sm hover:border-primary/45 transition">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={r.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline decoration-dotted underline-offset-4 group-hover:text-primary transition-colors text-sm"
        >
          {r.name}
        </Link>
        <span className="text-xs opacity-70 font-mono">{r.language || "—"}</span>
      </div>
      <p className="text-xs opacity-80 mt-2 line-clamp-3 leading-relaxed">
        {r.description || "—"}
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs opacity-80 pt-3 border-t border-border/50">
        <span className="inline-flex items-center gap-1">
          <StarIcon className="h-3.5 w-3.5" /> {r.stargazers_count}
        </span>
        <span className="inline-flex items-center gap-1">
          <GitForkIcon className="h-3.5 w-3.5" /> {r.forks_count}
        </span>
        <span className="ml-auto text-[10px] font-mono">
          {new Date(r.updated_at).toLocaleDateString()}
        </span>
      </div>
    </MagicCard>
  );
}

function SkeletonCard() {
  return (
    <div className="h-36 rounded-sm bg-muted/40 animate-pulse" aria-hidden />
  );
}
