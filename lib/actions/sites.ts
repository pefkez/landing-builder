"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

async function requireUser() {
  const session = await auth();
  if (!session) redirect("/login");
  return session.user.id;
}

export type CreateSiteState = { error?: string } | undefined;

export async function createSite(
  _prev: CreateSiteState,
  formData: FormData
): Promise<CreateSiteState> {
  const userId = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Введи название сайта" };
  if (name.length > 60) return { error: "Название слишком длинное" };

  let slug = slugify(name) || "site";
  const existing = await prisma.site.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const site = await prisma.site.create({
    data: { userId, name, slug },
  });
  revalidatePath("/dashboard");
  redirect(`/build/${site.id}`);
}

export async function deleteSite(siteId: string) {
  const userId = await requireUser();
  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site) return;
  await prisma.site.delete({ where: { id: site.id } });
  revalidatePath("/dashboard");
}
