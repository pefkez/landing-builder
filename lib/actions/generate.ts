"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Anthropic from "@anthropic-ai/sdk";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPrompt, SECTION_OPTIONS } from "@/lib/prompt";

export type GenerateState = { error?: string } | undefined;

function extractHtml(text: string): string {
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

export async function generateSite(siteId: string): Promise<{ html: string }> {
  const userId = await (async () => {
    const session = await auth();
    if (!session) redirect("/login");
    return session.user.id;
  })();

  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site) redirect("/dashboard");

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

  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    system:
      "Ты — эксперт по созданию лендингов. Генерируешь продающие одностраничники отличного качества.",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const html = extractHtml(text);
  if (!html.includes("<html")) {
    throw new Error("ИИ вернул не HTML. Попробуй ещё раз.");
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

  return { html };
}

export async function updateSiteSettings(
  siteId: string,
  formData: FormData
): Promise<GenerateState> {
  const userId = await (async () => {
    const session = await auth();
    if (!session) redirect("/login");
    return session.user.id;
  })();

  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site) return { error: "Сайт не найден" };

  const description = String(formData.get("description") ?? "").trim().slice(0, 500);
  const style = String(formData.get("style") ?? "modern");
  const sections = formData.getAll("sections").map(String).slice(0, 10);
  const prompt = String(formData.get("prompt") ?? "").trim().slice(0, 500);

  await prisma.site.update({
    where: { id: site.id },
    data: {
      description,
      style,
      sections: sections.length ? sections.join(",") : "hero,features,cta",
      prompt,
    },
  });
  revalidatePath(`/build/${site.id}`);
}

export async function togglePublish(siteId: string) {
  const userId = await (async () => {
    const session = await auth();
    if (!session) redirect("/login");
    return session.user.id;
  })();

  const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
  if (!site || !site.html) return;
  await prisma.site.update({
    where: { id: site.id },
    data: { published: !site.published },
  });
  revalidatePath(`/build/${site.id}`);
  revalidatePath(`/s/${site.slug}`);
}
