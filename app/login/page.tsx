import type { Metadata } from "next";
import Link from "next/link";

import LoginForm from "@/components/login-form";

export const metadata: Metadata = { title: "Вход — Landing Builder" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Landing<span className="text-violet-500">Builder</span>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Вход</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Продолжи строить свои лендинги
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-zinc-400">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium text-violet-400 hover:underline">
            Зарегистрируйся
          </Link>
        </p>
      </div>
    </main>
  );
}
