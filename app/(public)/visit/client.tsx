"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MapPin, Navigation, Phone, Mail, Clock, Car } from "lucide-react";
import { SectionReveal } from "@/components/motion/section-reveal";
import { SITE_CONFIG, DIRECTIONS, PROPERTY } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";
import { Controller } from "react-hook-form";
import { GuestsSelect } from "@/components/ui2/guests-select";
import { trackContact } from "@/lib/analytics";

/* ---------- schema ---------- */
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "Please enter a valid international number (E.164)"
    ),
  email: z.string().email("Please enter a valid email address"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.number().min(1).max(4, "Maximum 4 guests allowed"),
  message: z.string().min(10, "Please provide more details about your enquiry"),
});
type ContactForm = z.infer<typeof contactSchema>;

/* ---------- helpers ---------- */
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

interface VisitPageProps {
  cmsHero?: { headline?: string; subheadline?: string };
  cmsMap?: { headline?: string; subheadline?: string };
  cmsDirections?: { headline?: string; subheadline?: string; steps?: string[] };
  cmsNearby?: { headline?: string; subheadline?: string };
}

export default function VisitPage({
  cmsHero,
  cmsMap,
  cmsDirections,
  cmsNearby,
}: VisitPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const directionsSteps = Array.isArray(cmsDirections?.steps) && cmsDirections.steps.length > 0
    ? cmsDirections.steps
    : DIRECTIONS;

  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  //   watch,
  // } = useForm<ContactForm>({
  //   resolver: zodResolver(contactSchema),
  //   defaultValues: { guests: 2 },
  //   mode: "onTouched",
  // });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control, // ⬅️ add this
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { guests: 2 },
    mode: "onTouched",
  });

  const checkIn = watch("checkIn");
  const minCheckout = useMemo(() => {
    if (!checkIn) return todayISO();
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [checkIn]);

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const message = [
        "Contact Form Enquiry — Lake View Villa Tangalle",
        "",
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        `Email: ${data.email}`,
        `Check-in: ${data.checkIn}`,
        `Check-out: ${data.checkOut}`,
        `Guests: ${data.guests}`,
        "",
        `Message: ${data.message}`,
        "",
        `Source: ${typeof window !== "undefined" ? window.location.href : ""}`,
      ].join("\n");

      // WhatsApp → fallback mailto
      const wa = buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, message);
      //window.open(wa, "_blank", "noopener");
      trackContact("whatsapp", wa, "Chat on WhatsApp");
      setTimeout(() => window.open(wa, "_blank", "noopener"), 120);

      setTimeout(() => {
        const mailto = `mailto:info@lakeviewvillatangalle.com?subject=${encodeURIComponent(
          `Villa Enquiry from ${data.name}`
        )}&body=${encodeURIComponent(message)}`;
        window.location.href = mailto;
      }, 800);

      setSubmitStatus("success");
      reset({ guests: 2 } satisfies Partial<ContactForm>);
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stable, keyless embed
  const mapsEmbedSrc = useMemo(() => {
    // const { lat, lng } = SITE_CONFIG.coordinates;
    // return `https://www.google.com/maps?q=${lat},${lng}&z=14&output=embed`;
    return SITE_CONFIG.googleMapsUrl;
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden text-[var(--color-foreground)] bg-[var(--color-background)]">
      {/* Ambient background using design tokens */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 40% at 20% 10%, rgba(14,165,233,0.08), transparent 70%), radial-gradient(50% 30% at 80% 20%, rgba(201,165,90,0.06), transparent 70%)"
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-30 dark:mix-blend-screen dark:opacity-75"
        animate={{ backgroundPosition: ["0px 0px", "36px 24px", "0px 0px"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0 1px,transparent 1px 6px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0 1px,transparent 1px 6px)",
          backgroundSize: "18px 18px, 18px 18px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] bg-clip-text text-transparent">
                  {cmsHero?.headline || "Visit Us"}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
                {cmsHero?.subheadline || "Plan your journey to Lake View Villa Tangalle with precise directions and fast contact options."}
              </p>
            </div>
          </SectionReveal>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left column */}
          <div className="space-y-8">
            {/* Map */}
            <SectionReveal>
              <div className="rounded-2xl p-8 shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <MapPin className="text-[var(--color-primary)]" size={24} />
                  {cmsMap?.headline || "Location & Map"}
                </h2>
                {cmsMap?.subheadline && (
                  <p className="text-[var(--color-muted)] text-sm mb-4">{cmsMap.subheadline}</p>
                )}

                <motion.div
                  className="relative mx-auto aspect-square max-w-lg overflow-hidden rounded-[2rem] shadow-[0_24px_80px_rgba(14,165,233,.08)] ring-1 ring-[var(--color-border)] md:max-w-none md:rounded-[2.5rem] md:[clip-path:circle(48%_at_50%_50%)]"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 180, damping: 18 }}
                >
                  <div className="pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-gold)]/20 blur-[6px]" />
                  <iframe
                    src={mapsEmbedSrc}
                    title="Lake View Villa Tangalle Location"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="relative z-10 h-full min-h-[280px] w-full"
                  />
                </motion.div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <motion.a
                    href={SITE_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[var(--color-primary-foreground)] font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 bg-[var(--color-primary)] hover:opacity-90"
                  >
                    <Navigation size={20} />
                    Open in Google Maps
                  </motion.a>

                  <motion.button
                    onClick={() => {
                      const msg =
                        "Hi! I need directions to Lake View Villa Tangalle. Could you share the exact pin?";
                      const url = buildWhatsAppUrl(
                        SITE_CONFIG.whatsappNumber,
                        msg
                      );
                      trackContact("whatsapp", url, "Chat on WhatsApp");
                      setTimeout(
                        () => window.open(url, "_blank", "noopener"),
                        120
                      );
                    }}
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[var(--color-foreground)] font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/85 transition"
                  >
                    <Navigation size={20} />
                    Get Directions via WhatsApp
                  </motion.button>
                </div>
              </div>
            </SectionReveal>

            {/* How to get here */}
            <SectionReveal>
              <div className="rounded-2xl p-8 shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Car className="text-[var(--color-primary)]" size={24} />
                  {cmsDirections?.headline || "How to Get Here"}
                </h2>

                <div className="space-y-4">
                  {directionsSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] flex items-center justify-center text-[var(--color-primary-foreground)] font-semibold text-sm">
                        {i + 1}
                      </div>
                      <p className="text-[var(--color-foreground)]/90 pt-1">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl ring-1 ring-[var(--color-primary)]/20 bg-[var(--color-primary)]/[0.04]">
                  <div className="flex items-start gap-3">
                    <Clock
                      className="text-[var(--color-primary)] mt-1 flex-shrink-0"
                      size={20}
                    />
                    <div>
                      <h3 className="font-semibold mb-1 text-[var(--color-foreground)]">
                        Typical Travel Time
                      </h3>
                      <p className="text-[var(--color-muted)] text-sm">
                        {cmsDirections?.subheadline || "~3 hours from Colombo Airport • ~45 minutes from Matara"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>

            {/* Nearby Attractions */}
            {((cmsNearby?.headline) || PROPERTY.location.noted_nearby.length > 0) && (
              <SectionReveal>
                <div className="rounded-2xl p-8 shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <MapPin className="text-[var(--color-primary)]" size={24} />
                    {cmsNearby?.headline || "Nearby Attractions"}
                  </h2>
                  {cmsNearby?.subheadline && (
                    <p className="text-[var(--color-muted)] text-sm mb-4">{cmsNearby.subheadline}</p>
                  )}
                  <div className="grid gap-3">
                    {PROPERTY.location.noted_nearby.map((n, i) => (
                      <div key={i} className="flex justify-between items-center rounded-xl bg-[var(--color-background)] p-4 border border-[var(--color-border)]">
                        <span className="font-medium">{n.place}</span>
                        <span className="text-sm font-semibold text-[var(--color-primary)]">{n.distance_mi} miles away</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionReveal>
            )}

            {/* Quick contact */}
            <SectionReveal>
              <div className="rounded-2xl p-8 shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <h2 className="text-2xl font-bold mb-6">Quick Contact</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <a
                    href={`tel:${SITE_CONFIG.whatsappNumber}`}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/95">
                      <Phone className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="font-medium">Call Us</p>
                      <p className="text-[var(--color-muted)] text-sm">
                        {SITE_CONFIG.whatsappNumber}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${PROPERTY.email}`}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/95">
                      <Mail className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="font-medium">Email Us</p>
                      <p className="text-[var(--color-muted)] text-sm">{PROPERTY.email}</p>
                    </div>
                  </a>
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* Right column: form */}
          <SectionReveal>
            <div className="rounded-2xl p-8 shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)]">Send us a Message</h2>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
                aria-busy={isSubmitting}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                      htmlFor="v-name"
                    >
                      Full Name *
                    </label>
                    <input
                      id="v-name"
                      {...register("name")}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent"
                      placeholder="Your full name"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                      htmlFor="v-phone"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="v-phone"
                      {...register("phone")}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent"
                      placeholder="+94717448391"
                      inputMode="tel"
                      autoComplete="tel"
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                    htmlFor="v-email"
                  >
                    Email Address *
                  </label>
                  <input
                    id="v-email"
                    {...register("email")}
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                      htmlFor="v-in"
                    >
                      Check-in *
                    </label>
                    <input
                      id="v-in"
                      {...register("checkIn")}
                      type="date"
                      min={todayISO()}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent"
                      aria-invalid={!!errors.checkIn}
                    />
                    {errors.checkIn && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.checkIn.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                      htmlFor="v-out"
                    >
                      Check-out *
                    </label>
                    <input
                      id="v-out"
                      {...register("checkOut")}
                      type="date"
                      min={minCheckout}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent"
                      aria-invalid={!!errors.checkOut}
                    />
                    {errors.checkOut && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.checkOut.message}
                      </p>
                    )}
                  </div>

                  <Controller
                    name="guests"
                    control={control}
                    render={({ field }) => (
                      <GuestsSelect
                        id="visit-guests"
                        label="Guests *"
                        value={field.value ?? 2}
                        onChange={field.onChange} // GuestsSelect returns a number
                        error={errors.guests?.message}
                        min={1}
                        max={4}
                      />
                    )}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                    htmlFor="v-msg"
                  >
                    Message *
                  </label>
                  <textarea
                    id="v-msg"
                    {...register("message")}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent resize-none"
                    placeholder="Tell us your dates, flexibility, special requests…"
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full py-4 px-6 rounded-xl font-semibold shadow-xl disabled:opacity-60 disabled:cursor-not-allowed bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 transition-all"
                >
                  {isSubmitting ? "Sending…" : "Send Message"}
                </motion.button>

                {submitStatus === "success" && (
                  <div
                    className="text-emerald-600 dark:text-emerald-400 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    Message sent! We’ll get back to you shortly.
                  </div>
                )}
                {submitStatus === "error" && (
                  <div
                    className="text-red-600 dark:text-red-400 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    Something went wrong. Please try again or contact us
                    directly.
                  </div>
                )}
              </form>
            </div>
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}
