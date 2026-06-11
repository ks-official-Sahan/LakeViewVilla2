"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { SectionReveal } from "@/components/motion/section-reveal";
import { SITE_CONFIG, DIRECTIONS, PROPERTY } from "@/data/content";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";
import { buildWhatsAppUrl } from "@/lib/utils";
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

/* ---------- custom premium SVG icons (replacing Lucide) ---------- */
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-accent shrink-0" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const NavigationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-accent shrink-0" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-accent shrink-0" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a20.373 20.373 0 01-6.727-6.728c-.156-.44.01-1.27.387-1.21l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-accent shrink-0" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-accent shrink-0" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-accent shrink-0" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.324-5.186a1.875 1.875 0 00-1.802-1.76l-11.026-.063m11.536 7.633L16.5 12h-9v6.75M16.5 12V9a1.5 1.5 0 00-1.5-1.5H9A1.5 1.5 0 007.5 9v3m9 0H7.5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 shrink-0" aria-hidden="true">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L.057 24zm6.59-4.846c1.6.95 3.167 1.455 4.733 1.456 5.487 0 9.954-4.468 9.957-9.958.001-2.659-1.023-5.158-2.884-7.022C16.6 1.765 14.113.74 11.457.74 5.972.74 1.505 5.207 1.502 10.693c0 1.637.436 3.23 1.264 4.646L1.724 20.89l5.63-1.478c1.378.75 2.872 1.155 4.382 1.155z" />
  </svg>
);

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
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const directionsSteps = Array.isArray(cmsDirections?.steps) && cmsDirections.steps.length > 0
    ? cmsDirections.steps
    : DIRECTIONS;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
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

      const wa = buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, message);
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

  return (
    <div className="min-h-screen relative overflow-hidden text-foreground bg-background">
      {/* Ambient background grid + glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 40% at 20% 10%, var(--color-primary) 0%, transparent 70%), radial-gradient(50% 30% at 80% 20%, var(--color-gold-muted) 0%, transparent 70%)",
          opacity: 0.04
        }}
      />

      {/* Header */}
      <div className="relative z-10 pt-36 pb-16">
        <div className="container mx-auto px-6 text-center flex flex-col items-center">
          <SectionReveal>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block">
              Directions & Location
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              {cmsHero?.headline || "Visit Us"}
            </h1>
            <p className="text-sm md:text-base text-foreground/70 dark:text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              {cmsHero?.subheadline || "Plan your journey to Lake View Villa Tangalle with precise directions and fast contact options."}
            </p>
          </SectionReveal>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pb-32 flex flex-col gap-20">
        
        {/* ROW 1: Map (Asymmetric 8cols) + Side panel (4cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Map block */}
          <div className="lg:col-span-8 flex flex-col">
            <SectionReveal className="h-full flex flex-col">
              <div className="flex-1 bg-card border border-border/60 p-6 rounded-sm shadow-sm flex flex-col">
                <h2 className="font-display text-lg font-bold mb-4 tracking-tight flex items-center gap-2.5 text-foreground border-b border-border/60 pb-3">
                  <MapPinIcon />
                  {cmsMap?.headline || "Location & Map"}
                </h2>
                {cmsMap?.subheadline && (
                  <p className="text-foreground/60 text-xs mb-4 leading-relaxed">{cmsMap.subheadline}</p>
                )}

                <div className="relative w-full aspect-video min-h-[350px] overflow-hidden rounded-sm border border-border/60 bg-background flex-1">
                  <Map
                    viewport={{ center: [80.7811559, 6.0173643], zoom: 15 }}
                    className="w-full h-full relative z-10"
                  >
                    <MapMarker longitude={80.7811559} latitude={6.0173643}>
                      <MarkerContent className="!w-5 !h-5 overflow-visible">
                        <div className="relative w-5 h-5 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-sm bg-accent border-2 border-background shadow-lg relative z-10 animate-pulse" />
                          <div className="absolute w-5 h-5 rounded-sm bg-accent/50 animate-ping" />

                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex flex-col items-center gap-1 bg-card border border-border/60 rounded-sm px-4 py-2.5 shadow-2xl pointer-events-auto w-max z-50">
                            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-foreground">
                              Lake View Villa
                            </span>
                            <a
                              href={SITE_CONFIG.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-accent hover:opacity-85 transition-opacity font-bold mt-1"
                            >
                              Open in Google Maps
                              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            </a>
                          </div>
                        </div>
                      </MarkerContent>
                    </MapMarker>
                    <MapControls position="bottom-right" />
                  </Map>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <a
                    href={SITE_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-4 px-6 rounded-sm border border-accent bg-accent/5 text-xs font-bold uppercase tracking-widest text-accent transition-all duration-300 hover:bg-accent hover:text-background text-center shadow-sm"
                  >
                    <NavigationIcon />
                    Open in Google Maps
                  </a>

                  <button
                    onClick={() => {
                      const msg = "Hi! I need directions to Lake View Villa Tangalle. Could you share the exact pin?";
                      const url = buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, msg);
                      trackContact("whatsapp", url, "Chat on WhatsApp");
                      setTimeout(() => window.open(url, "_blank", "noopener"), 120);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-4 px-6 rounded-sm border border-border/60 bg-card text-xs font-bold uppercase tracking-widest text-foreground transition-all duration-300 hover:bg-foreground/[0.02] text-center shadow-sm"
                  >
                    <NavigationIcon />
                    Get via WhatsApp
                  </button>
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* Side Panel: Attractions & Contact */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Quick Contact Info */}
            <SectionReveal className="flex-1 flex flex-col">
              <div className="flex-1 bg-card border border-border/60 p-6 rounded-sm shadow-sm flex flex-col">
                <h2 className="font-display text-lg font-bold mb-4 tracking-tight border-b border-border/60 pb-3">
                  Quick Contacts
                </h2>
                <div className="flex-1 flex flex-col gap-4 justify-center">
                  <a
                    href={`tel:${SITE_CONFIG.whatsappNumber}`}
                    className="group flex items-center gap-4 p-4 rounded-sm bg-background border border-border/60 hover:border-accent/30 transition-all duration-300 shadow-sm"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-accent/10 text-accent">
                      <PhoneIcon />
                    </span>
                    <div>
                      <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground/50">Call Us</p>
                      <p className="text-xs font-mono font-semibold text-foreground mt-0.5">{SITE_CONFIG.whatsappNumber}</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${PROPERTY.email}`}
                    className="group flex items-center gap-4 p-4 rounded-sm bg-background border border-border/60 hover:border-accent/30 transition-all duration-300 shadow-sm"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-accent/10 text-accent">
                      <MailIcon />
                    </span>
                    <div>
                      <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground/50">Email Us</p>
                      <p className="text-xs font-mono font-semibold text-foreground mt-0.5">{PROPERTY.email}</p>
                    </div>
                  </a>
                </div>
              </div>
            </SectionReveal>

            {/* Attractions */}
            {((cmsNearby?.headline) || PROPERTY.location.noted_nearby.length > 0) && (
              <SectionReveal className="flex-1 flex flex-col">
                <div className="flex-1 bg-card border border-border/60 p-6 rounded-sm shadow-sm flex flex-col">
                  <h2 className="font-display text-lg font-bold mb-4 tracking-tight flex items-center gap-2.5 text-foreground border-b border-border/60 pb-3">
                    <MapPinIcon />
                    {cmsNearby?.headline || "Attractions"}
                  </h2>
                  {cmsNearby?.subheadline && (
                    <p className="text-foreground/60 text-xs mb-4">{cmsNearby.subheadline}</p>
                  )}
                  <div className="flex-1 flex flex-col gap-3 justify-center">
                    {PROPERTY.location.noted_nearby.slice(0, 3).map((n, i) => (
                      <div key={i} className="flex justify-between items-center rounded-sm bg-background p-3.5 border border-border/60 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">{n.place}</span>
                        <span className="text-xs font-mono font-bold text-accent">{n.distance_mi} mi</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionReveal>
            )}
          </div>
        </div>

        {/* ROW 2: The Journey Route (Staggered Roadmap Grid) */}
        <div>
          <SectionReveal>
            <div className="bg-card border border-border/60 p-8 rounded-sm shadow-sm">
              <h2 className="font-display text-2xl font-black uppercase tracking-wider mb-8 flex items-center gap-3">
                <CarIcon /> {cmsDirections?.headline || "How to Get Here"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {directionsSteps.map((step, i) => (
                  <div key={i} className="bg-background border border-border/60 p-6 rounded-sm relative shadow-sm hover:border-accent/20 transition-all duration-300">
                    <span className="absolute top-4 right-4 text-4xl font-display font-black text-accent/10 select-none">
                      0{i + 1}
                    </span>
                    <h3 className="font-display font-bold uppercase tracking-wider text-xs text-accent mb-3">
                      Leg 0{i + 1}
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 rounded-sm border border-accent/20 bg-accent/[0.02] flex items-start gap-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-accent/10 text-accent">
                  <ClockIcon />
                </span>
                <div>
                  <h3 className="text-xs font-display font-bold uppercase tracking-widest text-foreground">
                    Typical Travel Time
                  </h3>
                  <p className="text-xs text-foreground/70 mt-1 leading-relaxed">
                    {cmsDirections?.subheadline || "~3 hours from Colombo Airport • ~45 minutes from Matara"}
                  </p>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>

        {/* ROW 3: Form Layout (Asymmetric 5cols / 7cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Prompt/Instructions (5cols) */}
          <div className="lg:col-span-5">
            <SectionReveal>
              <div className="bg-card border border-border/60 p-8 rounded-sm shadow-sm h-full flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-3 block">
                    Reservations & Inquiries
                  </span>
                  <h2 className="font-display text-2xl font-black tracking-tight leading-[1.1] mb-4">
                    Begin Your Lagoon Retreat
                  </h2>
                  <p className="text-xs text-foreground/70 leading-relaxed mb-6">
                    Our team will customize your experience. Submit the details of your travel dates and stay requirements, and we will contact you directly via WhatsApp or Email to coordinate your reservation.
                  </p>
                </div>
                <div className="p-4 bg-background border border-border/60 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest text-foreground/50">
                  <span className="text-accent mr-1">■</span> Direct Booking Rates Applied
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* Right Block: Message Form (7cols) */}
          <div className="lg:col-span-7">
            <SectionReveal>
              <div className="bg-card border border-border/60 p-8 md:p-10 rounded-sm shadow-sm">
                <h3 className="font-display text-xl font-bold mb-6 tracking-tight text-foreground">
                  Send us a Message
                </h3>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                  noValidate
                  aria-busy={isSubmitting}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                        htmlFor="v-name"
                      >
                        Full Name *
                      </label>
                      <input
                        id="v-name"
                        {...register("name")}
                        className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground placeholder:text-foreground/30 text-sm focus:outline-none focus:border-accent"
                        placeholder="Your full name"
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 font-sans font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                        htmlFor="v-phone"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="v-phone"
                        {...register("phone")}
                        className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground placeholder:text-foreground/30 text-sm focus:outline-none focus:border-accent"
                        placeholder="+94717448391"
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1 font-sans font-medium">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                      htmlFor="v-email"
                    >
                      Email Address *
                    </label>
                    <input
                      id="v-email"
                      {...register("email")}
                      type="email"
                      className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground placeholder:text-foreground/30 text-sm focus:outline-none focus:border-accent"
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 font-sans font-medium">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label
                        className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                        htmlFor="v-in"
                      >
                        Check-in *
                      </label>
                      <input
                        id="v-in"
                        {...register("checkIn")}
                        type="date"
                        min={todayISO()}
                        className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground text-sm focus:outline-none focus:border-accent"
                        aria-invalid={!!errors.checkIn}
                      />
                      {errors.checkIn && (
                        <p className="text-red-500 text-xs mt-1 font-sans font-medium">
                          {errors.checkIn.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                        htmlFor="v-out"
                      >
                        Check-out *
                      </label>
                      <input
                        id="v-out"
                        {...register("checkOut")}
                        type="date"
                        min={minCheckout}
                        className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground text-sm focus:outline-none focus:border-accent"
                        aria-invalid={!!errors.checkOut}
                      />
                      {errors.checkOut && (
                        <p className="text-red-500 text-xs mt-1 font-sans font-medium">
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
                          onChange={field.onChange}
                          error={errors.guests?.message}
                          min={1}
                          max={4}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                      htmlFor="v-msg"
                    >
                      Message *
                    </label>
                    <textarea
                      id="v-msg"
                      {...register("message")}
                      rows={5}
                      className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground placeholder:text-foreground/30 text-sm focus:outline-none focus:border-accent resize-none"
                      placeholder="Tell us your dates, flexibility, special requests…"
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1 font-sans font-medium">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex w-full items-center justify-between border border-accent bg-accent/5 px-8 py-5 text-xs font-bold uppercase tracking-widest text-accent transition-all duration-500 hover:bg-accent hover:text-background hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center gap-2.5">
                      <WhatsappIcon /> {isSubmitting ? "Sending…" : "Send Message"}
                    </span>
                    <ArrowRightIcon />
                  </button>

                  {submitStatus === "success" && (
                    <div
                      className="text-emerald-500 text-center text-xs font-sans font-bold mt-4"
                      role="status"
                      aria-live="polite"
                    >
                      Message sent! We’ll get back to you shortly.
                    </div>
                  )}
                  {submitStatus === "error" && (
                    <div
                      className="text-red-500 text-center text-xs font-sans font-bold mt-4"
                      role="status"
                      aria-live="polite"
                    >
                      Something went wrong. Please check fields and try again.
                    </div>
                  )}
                </form>
              </div>
            </SectionReveal>
          </div>
        </div>

      </div>
    </div>
  );
}
