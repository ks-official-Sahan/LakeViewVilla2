import { ImageResponse } from "next/og";
import { connection } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);

    // Parse parameters
    const title = searchParams.get("title") || "Lake View Villa Tangalle";
    const description =
      searchParams.get("description") ||
      "Lagoon stay in Tangalle, Sri Lanka. Private two-bedroom villa rental with panoramic views.";
    const isBlog = searchParams.get("type") === "blog";

    // Load Montserrat font (optional, using system fonts fallback below for speed)
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#031518",
            backgroundImage: "radial-gradient(circle at 80% 20%, #0c333a 0%, #031518 100%)",
            padding: "80px",
            boxSizing: "border-box",
            border: "8px solid #b8933f",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Top Brand Logo & Label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#b8933f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#031518",
              }}
            >
              L
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: "#e2e8f0",
                textTransform: "uppercase",
              }}
            >
              {isBlog ? "Lake View Villa Blog" : "Lake View Villa"}
            </span>
          </div>

          {/* Main Title & Excerpt Text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxWidth: "900px",
              marginTop: "40px",
              marginBottom: "40px",
            }}
          >
            <h1
              style={{
                fontSize: "64px",
                fontWeight: 800,
                lineHeight: 1.1,
                color: "#ffffff",
                margin: 0,
                padding: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "24px",
                lineHeight: 1.5,
                color: "#a0aec0",
                margin: 0,
                padding: 0,
              }}
            >
              {description.length > 150 ? description.slice(0, 147) + "..." : description}
            </p>
          </div>

          {/* Bottom Location Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: "#b8933f",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              Tangalle · Sri Lanka
            </span>
            <span
              style={{
                fontSize: "16px",
                color: "#4a5568",
              }}
            >
              lakeviewvillatangalle.com
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Failed to generate OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
