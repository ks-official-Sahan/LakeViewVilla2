"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";

const updateProfileSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  email: z.string().email().max(254),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAccountProfile() {
  const session = await requireSessionUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateAccountProfile(
  data: z.infer<typeof updateProfileSchema>,
) {
  const session = await requireSessionUser();
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name?.trim() || null;

  const existing = await prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      NOT: { id: session.user.id },
    },
  });
  if (existing) {
    return { success: false as const, error: "That email is already in use" };
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { email, name },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entityType: "User",
        entityId: user.id,
        newValue: { email: user.email, name: user.name, selfService: true },
      },
    });

    revalidatePath("/admin/account");
    return { success: true as const, data: user };
  } catch (error) {
    console.error("updateAccountProfile:", error);
    return { success: false as const, error: "Could not update profile" };
  }
}

export async function changeAccountPassword(
  data: z.infer<typeof changePasswordSchema>,
) {
  const session = await requireSessionUser();
  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    return { success: false as const, error: "User not found" };
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return { success: false as const, error: "Current password is incorrect" };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entityType: "User",
        entityId: user.id,
        newValue: { action: "PASSWORD_CHANGE", selfService: true },
      },
    });

    return { success: true as const };
  } catch (error) {
    console.error("changeAccountPassword:", error);
    return { success: false as const, error: "Could not change password" };
  }
}
