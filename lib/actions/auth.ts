"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/user";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Имя обязательно").max(50, "Имя слишком длинное"),
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(8, "Пароль минимум 8 символов").max(100, "Пароль слишком длинный"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(1, "Введи пароль"),
});

export type AuthState = { error?: string } | undefined;

export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const ip = await clientIp();
  const limited = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok)
    return { error: "Слишком много попыток регистрации, подожди немного" };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Этот email уже зарегистрирован" };

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, password: hash } });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const ip = await clientIp();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email, password } = parsed.data;
  const limited = rateLimit(`login:${ip}:${email}`, 10, 5 * 60 * 1000);
  if (!limited.ok)
    return { error: "Слишком много попыток входа, подожди 5 минут" };

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Неверный email или пароль" };
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
