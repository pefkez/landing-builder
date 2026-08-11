"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteSite } from "@/lib/actions/sites";

export default function DeleteSiteButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteSite(siteId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
        >
          {deleting ? "Удаляем..." : "Точно удалить?"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          Отмена
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="ml-auto rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
    >
      Удалить
    </button>
  );
}