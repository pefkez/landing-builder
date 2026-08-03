"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSitesLimit } from "@/lib/limits";
import { requireUser } from "@/lib/user";
import { slugify } from "@/lib/slugify";

export type CreateSiteState = { error?: string } | undefined;

const createSchema = z.object({
  name: z.string().trim().min(1, "Введи название сайта").max(60, "Название слишком длинное"),
});

export async function createSite(
  _prev: CreateSiteState,
  formData: FormData
): Promise<CreateSiteState> {
  const userId = await requireUser();
  const parsed = createSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const limit = getSitesLimit();
  const count = await prisma.site.count({ where: { userId } });
  if (count >= limit) {
    return { error: `Лимит бесплатного плана: ${limit} лендинга. Удали ненужный` };
  }

  const name = parsed.data.name;
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
