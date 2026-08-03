import type { Metadata } from "next";
import Link from "next/link";

import RegisterForm from "@/components/register-form";

export const metadata: Metadata = { title: "Регистрация — Landing Builder" };

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Landing<span className="text-violet-500">Builder</span>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Регистрация</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Бесплатно: 3 лендинга и 10 генераций
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-zinc-400">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-violet-400 hover:underline">
            Войди
          </Link>
        </p>
      </div>
    </main>
  );
}
