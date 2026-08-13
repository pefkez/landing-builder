import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "@/lib/actions/auth";
import CreateSiteForm from "@/components/create-site-form";
import SiteCard from "@/components/site-card";

export const metadata: Metadata = { title: "Дашборд — Landing Builder" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мои лендинги</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Привет, {session.user.name || session.user.email}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            Выйти
          </button>
        </form>
      </header>

      <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">
          Создать новый лендинг
        </h2>
        <CreateSiteForm />
      </section>

      {sites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-lg font-medium">Пока пусто</p>
          <p className="mt-2 text-sm text-zinc-400">
            Создай первый лендинг — соберём его за 30 секунд
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              id={site.id}
              name={site.name}
              slug={site.slug}
              style={site.style}
              published={site.published}
              views={site.views}
              updatedAt={new Date(site.updatedAt).toLocaleDateString("ru-RU")}
            />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-zinc-600">
        <Link href="/" className="hover:text-zinc-400">
          ← На главную
        </Link>
      </p>
    </main>
  );
}
