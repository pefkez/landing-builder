import Link from "next/link";

import { deleteSite } from "@/lib/actions/sites";

type SiteCardProps = {
  id: string;
  name: string;
  slug: string;
  published: boolean;
  updatedAt: string;
  views: number;
};

export default function SiteCard({ id, name, slug, published, updatedAt, views }: SiteCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{name}</h3>
          <p className="truncate text-sm text-zinc-500">/{slug}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            published
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {published ? "Опубликован" : "Черновик"}
        </span>
      </div>
      <p className="text-xs text-zinc-500">
        Обновлён {updatedAt}
        {views > 0 && ` · ${views} просмотров`}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={`/build/${id}`}
          className="rounded-lg bg-zinc-800 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
        >
          Редактировать
        </Link>
        {published && (
          <a
            href={`/s/${slug}`}
            target="_blank"
            className="rounded-lg bg-zinc-800 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
          >
            Открыть
          </a>
        )}
        <form action={deleteSite.bind(null, id)} className="ml-auto">
          <button
            type="submit"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            Удалить
          </button>
        </form>
      </div>
    </div>
  );
}
