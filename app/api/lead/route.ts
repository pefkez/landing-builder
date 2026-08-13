import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/user";

export const dynamic = "force-dynamic";

const leadSchema = z.object({
  slug: z.string().trim().min(1).max(60),
  name: z.string().trim().max(100).default(""),
  email: z.string().trim().email("Неверный email").max(200).or(z.literal("")),
  phone: z.string().trim().max(40).default(""),
  message: z.string().trim().max(2000).default(""),
});

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    /* уведомление не критично */
  }
}

export async function POST(request: Request) {
  const ip = await clientIp();
  const limiter = rateLimit(`lead:${ip}`, 10, 60 * 60 * 1000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: `Слишком много заявок, попробуй через ${limiter.retryAfterSec} сек` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const site = await prisma.site.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true, name: true, contactEnabled: true },
  });
  if (!site || !site.contactEnabled) {
    return NextResponse.json({ error: "Форма отключена" }, { status: 404 });
  }

  const lead = await prisma.lead.create({
    data: {
      siteId: site.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    },
  });

  const fields = [
    `🔔 Новая заявка на «${site.name}»`,
    parsed.data.name && `👤 Имя: ${parsed.data.name}`,
    parsed.data.email && `📧 Email: ${parsed.data.email}`,
    parsed.data.phone && `📞 Телефон: ${parsed.data.phone}`,
    parsed.data.message && `💬 Сообщение: ${parsed.data.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  void sendTelegram(fields);

  return NextResponse.json({ ok: true, id: lead.id });
}