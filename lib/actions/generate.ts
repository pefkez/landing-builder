"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Anthropic, { APIError } from "@anthropic-ai/sdk";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { buildPrompt, SECTION_OPTIONS, STYLE_OPTIONS } from "@/lib/prompt";
import { rateLimit } from "@/lib/rate-limit";
import { getGenerationsLimitDay, getMaxHtmlLength } from "@/lib/limits";
import { requireUser } from "@/lib/user";

export type GenerateState = { error?: string } | undefined;

function extractHtml(text: string): string {
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

function friendlyError(error: unknown): string {
  if (error instanceof APIError) {
    if (error.status === 401) return "Невалидный ключ API";
    if (error.status === 429) return "Слишком много запросов к генератору, подожди минуту";
    if (error.status === 529) return "Генератор перегружен, попробуй через минуту";
    return `Ошибка генератора (${error.status ?? "сеть"}). Попробуй ещё раз`;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Неизвестная ошибка генерации";
}

export async function generateSite(siteId: string): Promise<{ html: string }> {
  const userId = await requireUser();
  if (typeof siteId !== "string" || !siteId) redirect("/dashboard");

  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site) redirect("/dashboard");

  const burst = rateLimit(`generate:${userId}`, 5, 60 * 1000);
  if (!burst.ok)
    throw new Error("Не так быстро: максимум 5 генераций в минуту");

  const dayLimit = getGenerationsLimitDay();
  const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const usedToday = await prisma.generationLog.count({
    where: { createdAt: { gte: lastDay }, site: { userId } },
  });
  if (usedToday >= dayLimit) {
    throw new Error(
      `Лимит бесплатного плана: ${dayLimit} генераций в сутки. Вернись завтра`
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY не настроен. Добавь ключ в .env");
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
  const sections = (site.sections || "hero,features,cta")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => SECTION_OPTIONS.includes(s) || s.length < 30);

  const prompt = buildPrompt({
    name: site.name,
    description: site.description,
    style: site.style,
    sections,
    extra: site.prompt || "",
  });

  let text: string;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model,
      max_tokens: 8192,
      system:
        "Ты — эксперт по созданию лендингов. Генерируешь продающие одностраничники отличного качества.",
      messages: [{ role: "user", content: prompt }],
    });
    text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");
  } catch (error) {
    throw new Error(friendlyError(error));
  }

  const html = extractHtml(text);
  if (!html.includes("<html")) {
    throw new Error("Генератор вернул не HTML. Попробуй ещё раз");
  }

  await prisma.$transaction([
    prisma.site.update({
      where: { id: site.id },
      data: { html },
    }),
    prisma.generationLog.create({
      data: { siteId: site.id, prompt, model },
    }),
  ]);
  revalidatePath(`/build/${site.id}`);
  revalidatePath(`/s/${site.slug}`);

  return { html };
}

const settingsSchema = z.object({
  description: z.string().trim().max(500, "Описание слишком длинное"),
  style: z.enum(STYLE_OPTIONS, { message: "Неизвестный стиль" }),
  sections: z
    .array(z.enum(SECTION_OPTIONS as [string, ...string[]], {
      message: "Неизвестная секция",
    }))
    .min(1, "Выбери хотя бы одну секцию")
    .max(10, "Максимум 10 секций"),
  prompt: z.string().trim().max(500, "Требования слишком длинные"),
});

export async function updateSiteSettings(
  siteId: string,
  formData: FormData
): Promise<GenerateState> {
  const userId = await requireUser();

  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site) return { error: "Сайт не найден" };

  const parsed = settingsSchema.safeParse({
    description: formData.get("description"),
    style: formData.get("style"),
    sections: formData.getAll("sections").map(String),
    prompt: formData.get("prompt"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { description, style, sections, prompt } = parsed.data;
  await prisma.site.update({
    where: { id: site.id },
    data: { description, style, sections: sections.join(","), prompt },
  });
  revalidatePath(`/build/${site.id}`);

  return {};
}

export async function saveHtml(
  siteId: string,
  html: string
): Promise<GenerateState> {
  const userId = await requireUser();

  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site) return { error: "Сайт не найден" };

  const value = String(html ?? "").trim();
  if (!value) return { error: "HTML пустой" };
  const maxLen = getMaxHtmlLength();
  if (value.length > maxLen) {
    return { error: `HTML слишком большой (максимум ${Math.round(maxLen / 1024)} КБ)` };
  }

  await prisma.site.update({
    where: { id: site.id },
    data: { html: value },
  });
  revalidatePath(`/build/${site.id}`);
  revalidatePath(`/s/${site.slug}`);

  return {};
}

export async function togglePublish(siteId: string) {
  const userId = await requireUser();

  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site || !site.html) return;
  await prisma.site.update({
    where: { id: site.id },
    data: { published: !site.published },
  });
  revalidatePath(`/build/${site.id}`);
  revalidatePath(`/s/${site.slug}`);
}
