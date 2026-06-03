"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";

const settingUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
});

export async function updateSetting(data: z.infer<typeof settingUpdateSchema>) {
  const session = await requireRole("DEVELOPER");

  const parsed = settingUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const setting = await prisma.setting.upsert({
      where: { key: parsed.data.key },
      update: { value: parsed.data.value },
      create: { key: parsed.data.key, value: parsed.data.value },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_SETTING",
        entityType: "Setting",
        entityId: setting.key,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true, data: setting };
  } catch (error) {
    console.error("Failed to update setting:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function getSettings() {
  "use cache";
  try {
    const rows = await prisma.setting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      siteName: (map["site.name"] as string) || "Lake View Villa Tangalle",
      siteDescription: (map["seo.defaultDescription"] as string) || "Book Lake View Villa Tangalle. A private vacation rental and lodging business offering panoramic lake views, comfortable A/C bedrooms, fast Wi-Fi, and chef services in Sri Lanka.",
      defaultKeywords: [
        "Lake View Villa Tangalle",
        "Tangalle accommodation",
        "private villa Tangalle",
        "Sri Lanka lagoon stay",
      ],
      twitterHandle: "@lakeviewvilla",
      siteNameRaw: (map["site.name"] as string) || "Lake View Villa Tangalle",
    };
  } catch (err) {
    console.error("Failed to load global settings:", err);
    return {
      siteName: "Lake View Villa Tangalle",
      siteDescription: "Book Lake View Villa Tangalle. A private vacation rental and lodging business offering panoramic lake views, comfortable A/C bedrooms, fast Wi-Fi, and chef services in Sri Lanka.",
      defaultKeywords: [
        "Lake View Villa Tangalle",
        "Tangalle accommodation",
        "private villa Tangalle",
        "Sri Lanka lagoon stay",
      ],
      twitterHandle: "@lakeviewvilla",
      siteNameRaw: "Lake View Villa Tangalle",
    };
  }
}

