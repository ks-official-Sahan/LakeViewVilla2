"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Content pulled/normalized from your PDF + GitHub profile
const PROFILE = `Software Engineering undergraduate (BSc Hons) with a proven record delivering production-grade web, mobile, and desktop apps. Strengths in Next.js, React Native, NestJS, Prisma, Docker, WebSockets, CI/CD, and scalable system design.`;

export default function CVPage() {
  return (
    <main className="safe-top min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] py-12 print:py-0">
      <div className="mx-auto max-w-5xl px-4 print:px-0">
        {/* Toolbar (hidden in print) */}
        <div className="no-print print:hidden mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-gold)]">
              Developer Profile
            </span>
            <h1 className="text-2xl font-black font-[var(--font-display)]">Curriculum Vitae</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-sm border-[var(--color-border)] hover:bg-[var(--color-surface)]" asChild>
              <Link href="/developer" transitionTypes={["spa-page"]}>
                Back to Developer
              </Link>
            </Button>
            <Button className="rounded-sm bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90" onClick={() => window.print()}>
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* CV Card */}
        <article className="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] p-8 md:p-12 shadow-md print:rounded-none print:border-0 print:shadow-none print:bg-white print:text-black">
          <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold font-[var(--font-display)] leading-tight tracking-tight">
                Sahan Sachintha
              </h2>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-gold)] mt-1">
                Full-Stack Software Engineer
              </p>
            </div>
            <div className="text-xs space-y-1 text-[var(--color-muted)] font-mono print:text-black">
              <p>Tangalle, Sri Lanka • Available Worldwide</p>
              <p>
                Email:{" "}
                <a
                  className="underline underline-offset-4 hover:text-[var(--color-foreground)]"
                  href="mailto:ks.official.sahan@gmail.com"
                >
                  ks.official.sahan@gmail.com
                </a>
              </p>
              <p>
                GitHub:{" "}
                <a
                  className="underline underline-offset-4 hover:text-[var(--color-foreground)]"
                  href="https://github.com/ks-official-sahan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/ks-official-sahan
                </a>
              </p>
              <p>
                Portfolio:{" "}
                <a
                  className="underline underline-offset-4 hover:text-[var(--color-foreground)]"
                  href="https://sahansachintha.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  sahansachintha.com
                </a>
              </p>
            </div>
          </header>

          <Separator className="my-8 bg-[var(--color-border)]" />

          <section className="grid gap-8 md:grid-cols-3">
            {/* Left column */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-[var(--color-foreground)]">Profile</h3>
                <p className="leading-relaxed text-sm text-[var(--color-muted)] print:text-black">
                  {PROFILE}
                </p>
              </div>

              <div>
                <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-[var(--color-foreground)]">Experience</h3>
                <ul className="space-y-6">
                  <li className="space-y-1">
                    <p className="font-bold text-sm text-[var(--color-foreground)] print:text-black">
                      Associate Software Engineer (Contract) — Quantum Cod
                    </p>
                    <p className="text-[10px] font-mono text-[var(--color-gold)]">May 2024 – Sep 2024</p>
                    <p className="text-xs leading-relaxed text-[var(--color-muted)] print:text-black">
                      Built high-performance web apps (MERN + Prisma),
                      Dockerized environments, MVC; Java Swing/Windows Forms
                      systems; cross-team collaboration.
                    </p>
                  </li>
                  <li className="space-y-1">
                    <p className="font-bold text-sm text-[var(--color-foreground)] print:text-black">
                      Software Engineer / Co-founder — ImagineCoreX
                    </p>
                    <p className="text-[10px] font-mono text-[var(--color-gold)]">Sep 2023 – Aug 2025</p>
                    <p className="text-xs leading-relaxed text-[var(--color-muted)] print:text-black">
                      Led mobile (React Native, Expo, Supabase) and full-stack
                      (NextJS, NestJS, Prisma, Docker) projects; end-to-end
                      deployments & CI. Notables: Udocs, Wisebiz.io, Green
                      Roamer, PPA Web, Ceynapp.
                    </p>
                  </li>
                  <li className="space-y-1">
                    <p className="font-bold text-sm text-[var(--color-foreground)] print:text-black">
                      Software Engineering Intern — KVFX Studios
                    </p>
                    <p className="text-[10px] font-mono text-[var(--color-gold)]">Jul 2023 – Jan 2024</p>
                    <p className="text-xs leading-relaxed text-[var(--color-muted)] print:text-black">
                      Backend with PHP & Node/Express, PostgreSQL/MySQL, and
                      React UI contributions.
                    </p>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-[var(--color-foreground)]">
                  Selected Projects
                </h3>
                <ul className="space-y-3 text-xs text-[var(--color-muted)] print:text-black">
                  <li>
                    <span className="font-bold text-[var(--color-foreground)] print:text-black">
                      Lake View Villa Platform
                    </span>{" "}
                    — immersive, accessible, high-performance site.
                  </li>
                  <li>
                    <span className="font-bold text-[var(--color-foreground)] print:text-black">Green Roamer</span> — realtime
                    sync, role-based dashboards, analytics.
                  </li>
                  <li className="pt-1 flex gap-2 font-mono text-[10px]">
                    <a
                      className="underline hover:text-[var(--color-foreground)]"
                      target="_blank"
                      href="https://wisebiz.io"
                      rel="noreferrer"
                    >
                      wisebiz.io
                    </a>
                    <span>•</span>
                    <a
                      className="underline hover:text-[var(--color-foreground)]"
                      target="_blank"
                      href="https://greenroamer.vercel.app"
                      rel="noreferrer"
                    >
                      greenroamer.vercel.app
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right column */}
            <aside className="space-y-8 border-t border-[var(--color-border)] pt-8 md:border-t-0 md:pt-0 md:border-l md:pl-8 border-dashed">
              <div>
                <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-[var(--color-foreground)]">Skills</h3>
                <ul className="space-y-2 text-xs text-[var(--color-muted)] print:text-black font-mono">
                  <li>React, Next.js, TypeScript, React Native</li>
                  <li>NestJS, Node.js, REST/WebSockets, Prisma</li>
                  <li>Supabase, PostgreSQL, MySQL, MongoDB</li>
                  <li>Docker, CI/CD (GitHub Actions)</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-[var(--color-foreground)]">Education</h3>
                <p className="text-xs leading-relaxed text-[var(--color-muted)] print:text-black">
                  BEng (Hons) Software Engineering — IIC University (via Java
                  Institute), expected 2025
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-[var(--color-foreground)]">Links</h3>
                <ul className="space-y-2 text-xs text-[var(--color-muted)] print:text-black font-mono">
                  <li>
                    <a
                      className="underline hover:text-[var(--color-foreground)]"
                      href="https://sahan-ruddy.vercel.app"
                      target="_blank"
                      rel="noreferrer"
                    >
                      sahan-ruddy.vercel.app
                    </a>
                  </li>
                  <li>
                    <a
                      className="underline hover:text-[var(--color-foreground)]"
                      href="https://developer.lakeviewvillatangalle.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      dev.lakeviewvilla
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </section>
        </article>
      </div>
    </main>
  );
}
