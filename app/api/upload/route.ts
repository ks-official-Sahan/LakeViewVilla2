import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { MediaType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { bumpMediaAndGalleryCache } from "@/lib/cache/tags";
import { uploadToCloudinary, uploadFromUrl, validateFile, isCloudinaryConfigured } from "@/lib/admin/upload";
import { audit } from "@/lib/admin/audit";
import { mediaLocationsTableExists } from "@/lib/db/media-locations-table";
import { defaultGalleryLocationCreate, legacyGallerySlugFields } from "@/lib/media/default-gallery-location";

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("EDITOR");

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured on the server." },
        { status: 503 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") ?? undefined;

    let url: string | null = null;
    let file: File | null = null;
    let category = "all";
    let title = "";
    let alt = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      url = body.url || null;
      category = body.category || "all";
      title = body.title || "";
      alt = body.alt || "";

      if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 });
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      file = formData.get("file") as File | null;
      category = (formData.get("category") as string) || "all";
      title = (formData.get("title") as string) || "";
      alt = (formData.get("alt") as string) || "";

      if (!file || file.size === 0) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    const hasJoin = await mediaLocationsTableExists();
    let mediaAsset;

    if (file) {
      // Validate file
      const validation = validateFile(file.type, file.size);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error ?? "Invalid file" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const safeStem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");

      const uploaded = await uploadToCloudinary(buffer, {
        folder: `lakeviewvilla/${category}`,
        publicId: `${Date.now()}_${safeStem || "upload"}`,
        resourceType: file.type.startsWith("video/")
          ? "video"
          : file.type === "application/pdf"
            ? "raw"
            : "image",
        tags: [category],
      });

      let mediaType: MediaType = MediaType.OTHER;
      if (uploaded.resourceType === "image") mediaType = MediaType.IMAGE;
      else if (uploaded.resourceType === "video") mediaType = MediaType.VIDEO;
      else if (uploaded.resourceType === "raw") mediaType = MediaType.PDF;

      mediaAsset = await prisma.mediaAsset.create({
        data: {
          url: uploaded.url,
          publicId: uploaded.publicId,
          type: mediaType,
          category,
          title: title || file.name,
          alt: alt || null,
          width: uploaded.width,
          height: uploaded.height,
          sizeBytes: uploaded.sizeBytes,
          mimeType: file.type || "application/octet-stream",
          uploadedById: session.user.id,
          ...legacyGallerySlugFields,
          ...(hasJoin ? { locations: defaultGalleryLocationCreate } : {}),
        },
      });
    } else if (url) {
      // URL import
      const uploaded = await uploadFromUrl(url, {
        folder: `lakeviewvilla/${category}`,
        tags: [category],
      });

      let mediaType: MediaType = MediaType.OTHER;
      if (uploaded.resourceType === "image") mediaType = MediaType.IMAGE;
      else if (uploaded.resourceType === "video") mediaType = MediaType.VIDEO;
      else if (uploaded.resourceType === "raw") mediaType = MediaType.PDF;

      mediaAsset = await prisma.mediaAsset.create({
        data: {
          url: uploaded.url,
          publicId: uploaded.publicId,
          type: mediaType,
          category,
          title: title || url.split("/").pop() || "imported_file",
          alt: alt || null,
          width: uploaded.width,
          height: uploaded.height,
          sizeBytes: uploaded.sizeBytes,
          mimeType: uploaded.resourceType === "image" ? "image/jpeg" : "application/octet-stream", // Fallback approximations
          uploadedById: session.user.id,
          ...legacyGallerySlugFields,
          ...(hasJoin ? { locations: defaultGalleryLocationCreate } : {}),
        },
      });
    }

    if (!mediaAsset) {
      return NextResponse.json({ error: "Failed to create media asset" }, { status: 500 });
    }

    await audit({
      userId: session.user.id,
      action: "UPLOAD",
      entityType: "MediaAsset",
      entityId: mediaAsset.id,
      ipAddress: ip,
      userAgent,
      newValue: { url: mediaAsset.url, category },
    });

    revalidatePath("/admin/media");
    revalidatePath("/gallery");
    bumpMediaAndGalleryCache();

    return NextResponse.json({
      url: mediaAsset.url,
      publicId: mediaAsset.publicId,
      id: mediaAsset.id,
      type: mediaAsset.type.toLowerCase(),
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    console.error("API upload route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
