import type { Metadata } from "next";
import { BookingLinkPage } from "./booking-link-page";

export const metadata: Metadata = {
  title: "Lake View Villa — Booking.com",
  description:
    "Redirecting to Lake View Villa on Booking.com — check availability and guest reviews.",
  alternates: {
    canonical: "https://lakeviewvillatangalle.com/links/booking",
  },
};

export default function Page() {
  return <BookingLinkPage />;
}
