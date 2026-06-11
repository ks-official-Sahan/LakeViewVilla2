// app/og/route.ts
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function toBase64(ab) {
  // Edge-safe base64 (no Node Buffer)
  const bytes = new Uint8Array(ab);
  // @ts-ignore
  return bytes.toBase64();
}

export async function GET(req) {
  const { origin } = new URL(req.url);
  let bgDataUrl = null;

  try {
    const res = await fetch(`${origin}/villa/optimized/drone_view_villa.webp`, {
      cache: "force-cache",
    });
    if (res.ok) {
      const ab = await res.arrayBuffer();
      bgDataUrl = `data:image/jpeg;base64,${toBase64(ab)}`;
    }
  } catch {
    // ignore and use gradient fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          position: "relative",
          display: "flex",
          fontFamily: "ui-sans-serif, system-ui, -apple-system",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: bgDataUrl
              ? `url(${bgDataUrl}) center/cover no-repeat`
              : "linear-gradient(135deg,#0b2027,#1a5c5e)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg,rgba(11,32,39,0.3),rgba(11,32,39,0.75))",
          }}
        />
        <div
          style={{
            position: "relative",
            padding: 56,
            marginTop: "auto",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>
            Lake View Villa Tangalle
          </div>
          <div style={{ fontSize: 30, marginTop: 12, opacity: 0.95 }}>
            Private villa on a serene lagoon • A/C rooms • Fast Wi-Fi • Chef
            services
          </div>
          <div style={{ fontSize: 24, marginTop: 22, color: "#c9a55a", fontWeight: 700, letterSpacing: "0.05em" }}>
            LAKEVIEWVILLATANGALLE.COM
          </div>
        </div>
      </div>
    ),
    size
  );
}
