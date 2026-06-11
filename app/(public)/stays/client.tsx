"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Users, Phone, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { SectionReveal } from "@/components/motion/section-reveal";
import { RATES, SITE_CONFIG, BOOKING_FACTS } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";
import { GuestsSelect } from "@/components/ui2/guests-select";
import { trackContact } from "@/lib/analytics";

/* ---------- schema ---------- */
const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "Enter an international phone (e.g. +94717448391)"
    ),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.number().min(1).max(4, "Maximum 4 guests allowed"),
  message: z.string().optional(),
});
type EnquiryForm = z.infer<typeof enquirySchema>;

/* ---------- helpers ---------- */
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

const WhatsappIcon = () => (
  <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M16 3C9.373 3 4 8.373 4 15a11.9 11.9 0 0 0 1.77 6.23L4 29l7.95-1.74A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3Z" />
  </svg>
);

interface StaysPageProps {
  cmsHero?: { headline?: string; subheadline?: string };
  cmsRooms?: { name: string; sleeps: number; features: string[] }[];
  cmsPricing?: { season: string; period: string; nightly: string; minNights: number; notes?: string }[];
  cmsAmenities?: string[];
  room1Images?: string[];
  room2Images?: string[];
}

export default function StaysPage({
  cmsHero,
  cmsRooms,
  cmsPricing,
  cmsAmenities,
  room1Images = [],
  room2Images = [],
}: StaysPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
  } = useForm<EnquiryForm>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { guests: 2 },
    mode: "onTouched",
  });

  const { name, checkIn, checkOut, guests } = watch();

  const minCheckout = useMemo(() => {
    if (!checkIn) return todayISO();
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [checkIn]);

  const onSubmit = async (data: EnquiryForm) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const composed = [
        "WhatsApp Enquiry — Lake View Villa Tangalle",
        "",
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        `Check-in: ${data.checkIn}`,
        `Check-out: ${data.checkOut}`,
        `Guests: ${data.guests}`,
        data.message ? `\nMessage: ${data.message}` : "",
        "",
        `Source: ${typeof window !== "undefined" ? window.location.href : ""}`,
      ]
        .filter(Boolean)
        .join("\n");

      const wa = buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, composed);

      trackContact("whatsapp", wa, "Chat on WhatsApp");
      setTimeout(() => window.open(wa, "_blank", "noopener"), 120);

      setSubmitStatus("success");
      reset({ guests: 2 } satisfies Partial<EnquiryForm>);
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rating = BOOKING_FACTS?.reviewMetrics?.average ?? null;
  const ratingCount = BOOKING_FACTS?.reviewMetrics?.count ?? null;

  // Resolve fallbacks for CMS data elements
  const headline = cmsHero?.headline || "Stays & Rates";
  const subheadline = cmsHero?.subheadline || "Experience tranquility on a serene lagoon—best rates via direct WhatsApp.";
  const pricingList = Array.isArray(cmsPricing) ? cmsPricing : (Array.isArray(RATES) ? RATES : []);
  const roomsList = Array.isArray(cmsRooms) ? cmsRooms : (Array.isArray(BOOKING_FACTS.rooms) ? BOOKING_FACTS.rooms : []);

  return (
    <div className="min-h-screen relative overflow-hidden text-foreground bg-background">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 40% at 20% 10%, var(--color-primary) 0%, transparent 70%), radial-gradient(50% 30% at 80% 20%, var(--color-gold-muted) 0%, transparent 70%)",
          opacity: 0.05
        }}
      />

      {/* Header */}
      <div className="relative z-10 pt-36 pb-12">
        <div className="container mx-auto px-6">
          <SectionReveal>
            <div className="text-center flex flex-col items-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block">
                Lagoon Sanctuary
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
                {headline}
              </h1>
              <p className="text-sm md:text-base text-foreground/70 dark:text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                {subheadline}
              </p>
              
              {(rating || ratingCount) && (
                <div className="mt-8 inline-flex items-center gap-3 border border-border/60 bg-card px-5 py-2.5 shadow-sm rounded-sm">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="text-xs font-sans font-bold">
                    {rating ? `${rating.toFixed(1)}/10` : ""} · {ratingCount ?? 0} verified reviews
                  </span>
                </div>
              )}
            </div>
          </SectionReveal>
        </div>
      </div>

      {/* Body Content */}
      <div className="relative z-10 container mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Block: Rates + Room listings (Spans 7 columns) */}
          <div className="lg:col-span-7 flex flex-col gap-12">
            
            {/* Rates Table Block */}
            <SectionReveal>
              <div className="bg-card border border-border/60 rounded-sm p-8 shadow-sm">
                <h2 className="font-display text-xl font-bold mb-6 tracking-tight text-foreground flex items-center gap-3">
                  Rates & Seasons
                </h2>

                <div className="overflow-x-auto rounded-sm border border-border/60">
                  <table className="w-full text-xs md:text-sm text-foreground">
                    <thead className="bg-foreground/[0.02] border-b border-border/60">
                      <tr>
                        <th className="text-left py-3.5 px-4 font-display font-bold uppercase tracking-wider">
                          Season
                        </th>
                        <th className="text-left py-3.5 px-4 font-display font-bold uppercase tracking-wider">
                          Period
                        </th>
                        <th className="text-left py-3.5 px-4 font-display font-bold uppercase tracking-wider">
                          Nightly Rate
                        </th>
                        <th className="text-left py-3.5 px-4 font-display font-bold uppercase tracking-wider">
                          Min Stay
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {pricingList.map((r, i) => (
                        <tr key={i} className="hover:bg-foreground/[0.01]">
                          <td className="py-4 px-4 font-display font-bold text-foreground">
                            {r.season}
                          </td>
                          <td className="py-4 px-4 text-foreground/60">
                            {r.period}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center bg-accent/5 border border-accent/25 px-2.5 py-1 text-xs font-bold text-accent">
                              {r.nightly}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-foreground/60">
                            {r.minNights} {r.minNights === 1 ? "Night" : "Nights"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pricingList[0]?.notes && (
                  <p className="text-xs text-foreground/50 mt-4 leading-relaxed">
                    * {pricingList[0].notes}
                  </p>
                )}
              </div>
            </SectionReveal>

            {/* Room listing cards with sharp geometries */}
            <div className="flex flex-col gap-8">
              {roomsList.map((room, i) => {
                const roomImg =
                  i === 0
                    ? room1Images[0] || "/villa/optimized/room_01_img_01.webp"
                    : i === 1
                    ? room2Images[0] || "/villa/optimized/room_02_img_01.webp"
                    : null;

                return (
                  <SectionReveal key={room.name}>
                    <article className="group overflow-hidden rounded-sm border border-border/60 bg-card p-6 shadow-sm hover:shadow-xl hover:border-accent/20 transition-all duration-350">
                      {/* Room dynamic image */}
                      {roomImg && (
                        <div className="relative -mx-6 -mt-6 mb-6 aspect-[16/10] overflow-hidden">
                          <Image
                            src={roomImg}
                            alt={room.name}
                            fill
                            priority={i === 0}
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, 40vw"
                          />
                        </div>
                      )}

                      {/* Room details header */}
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-2xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent">
                            {room.name}
                          </h3>
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground/50 font-sans font-medium">
                            <Users className="h-4 w-4 text-accent" />
                            <span>Accommodates up to {room.sleeps} guests</span>
                          </div>
                        </div>
                        <span className="flex h-9 w-9 items-center justify-center border border-accent/20 bg-accent/5 text-xs font-display font-bold text-accent">
                          0{i + 1}
                        </span>
                      </div>

                      {/* Amenities checklist */}
                      <ul className="space-y-3 pt-4 border-t border-border/40">
                        {room.features.slice(0, 5).map((f, fi) => (
                          <li key={fi} className="flex items-center gap-3 text-xs text-foreground/75 dark:text-foreground/80 font-sans">
                            <Check className="h-4 w-4 text-accent shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </SectionReveal>
                );
              })}
            </div>
          </div>

          {/* Right Block: Direct Booking / Inquiry Form (Spans 5 columns) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <SectionReveal>
              <div className="bg-card border border-border/60 rounded-sm p-8 md:p-10 shadow-lg">
                <h2 className="font-display text-2xl font-bold mb-6 tracking-tight text-foreground flex items-center gap-3 border-b border-border/60 pb-4">
                  <Phone className="h-5 w-5 text-accent" /> Direct Reservation
                </h2>

                {/* Live preview banner card */}
                <div className="mb-8 p-4 bg-background border border-border/60 rounded-sm text-xs font-sans leading-relaxed text-foreground/70">
                  <span className="font-display font-bold uppercase tracking-wider text-accent block mb-1">
                    Booking Request Preview
                  </span>
                  <span>
                    {name || "Your Name"} • {checkIn || "Arrival"} → {checkOut || "Departure"} • {guests ?? 2} {guests === 1 ? "Guest" : "Guests"}
                  </span>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                  noValidate
                  aria-busy={isSubmitting}
                >
                  <div className="flex flex-col gap-6">
                    {/* Full Name */}
                    <div>
                      <label
                        className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                        htmlFor="s-name"
                      >
                        Full Name *
                      </label>
                      <input
                        id="s-name"
                        {...register("name")}
                        className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:border-accent"
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

                    {/* Phone Number */}
                    <div>
                      <label
                        className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                        htmlFor="s-phone"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="s-phone"
                        {...register("phone")}
                        className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:border-accent"
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

                    {/* Check-in / Check-out Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                          htmlFor="s-in"
                        >
                          Check-in *
                        </label>
                        <input
                          id="s-in"
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
                          htmlFor="s-out"
                        >
                          Check-out *
                        </label>
                        <input
                          id="s-out"
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
                    </div>

                    {/* Guests Select */}
                    <Controller
                      name="guests"
                      control={control}
                      render={({ field }) => (
                        <GuestsSelect
                          id="stays-guests"
                          label="Guests *"
                          value={field.value ?? 2}
                          onChange={field.onChange}
                          error={errors.guests?.message}
                          min={1}
                          max={4}
                        />
                      )}
                    />

                    {/* Message */}
                    <div>
                      <label
                        className="block text-xs font-display font-bold uppercase tracking-widest text-foreground/80 mb-2"
                        htmlFor="s-msg"
                      >
                        Special Requirements
                      </label>
                      <textarea
                        id="s-msg"
                        {...register("message")}
                        rows={4}
                        className="w-full px-4 py-3.5 rounded-sm bg-background border border-border/60 text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:border-accent resize-none"
                        placeholder="Dietary preferences, transport, etc..."
                      />
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex w-full items-center justify-between border border-accent bg-accent/5 px-8 py-5 text-xs font-bold uppercase tracking-widest text-accent transition-all duration-500 hover:bg-accent hover:text-background hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <WhatsappIcon /> {isSubmitting ? "Sending..." : "Submit to WhatsApp"}
                    </span>
                    <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  {submitStatus === "success" && (
                    <div
                      className="text-emerald-500 text-center text-xs font-sans font-bold mt-4"
                      role="status"
                      aria-live="polite"
                    >
                      Inquiry composed! We will follow up with you on WhatsApp shortly.
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

