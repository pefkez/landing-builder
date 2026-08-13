"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSitesLimit } from "@/lib/limits";
import { requireUser } from "@/lib/user";
import { slugify } from "@/lib/slugify";
import { getTemplate } from "@/lib/templates";

export type CreateSiteState = { error?: string } | undefined;

const createSchema = z.object({
  name: z.string().trim().min(1, "Введи название сайта").max(60, "Название слишком длинное"),
  template: z.string().trim().max(30).optional(),
});

export async function createSite(
  _prev: CreateSiteState,
  formData: FormData
): Promise<CreateSiteState> {
  const userId = await requireUser();
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    template: formData.get("template") || undefined,
  });
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

  const template = parsed.data.template ? getTemplate(parsed.data.template) : undefined;

  const site = await prisma.site.create({
    data: {
      userId,
      name,
      slug,
      ...(template
        ? {
            description: template.siteDescription,
            style: template.style,
            sections: template.sections,
            prompt: template.prompt,
          }
        : {}),
    },
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

export type RenameSiteState = { error?: string } | undefined;

const renameSchema = z.object({
  name: z.string().trim().min(1, "Введи название сайта").max(60, "Название слишком длинное"),
  slug: z.string().trim().min(1, "Введи ссылку").max(40, "Ссылка слишком длинная"),
});

export async function renameSite(
  siteId: string,
  _prev: RenameSiteState,
  formData: FormData
): Promise<RenameSiteState> {
  const userId = await requireUser();
  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site) return { error: "Сайт не найден" };

  const parsed = renameSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name } = parsed.data;
  const slug = slugify(parsed.data.slug) || "site";

  if (slug !== site.slug) {
    const existing = await prisma.site.findUnique({ where: { slug } });
    if (existing) return { error: "Такая ссылка уже занята. Придумай другую" };
  }

  await prisma.site.update({ where: { id: site.id }, data: { name, slug } });
  revalidatePath("/dashboard");
  revalidatePath(`/build/${site.id}`);
  revalidatePath(`/s/${site.slug}`);
  revalidatePath(`/s/${slug}`);

  return {};
}
