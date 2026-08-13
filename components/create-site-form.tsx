"use client";

import { useActionState } from "react";

import { createSite, type CreateSiteState } from "@/lib/actions/sites";
import { TEMPLATES } from "@/lib/templates";

const initialState: CreateSiteState = undefined;

export default function CreateSiteForm() {
  const [state, formAction, pending] = useActionState(createSite, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <input
            name="name"
            placeholder="Название сайта, например: Сервис доставки кофе"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-violet-500"
          />
          {state?.error && <p className="mt-1 text-sm text-red-400">{state.error}</p>}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {pending ? "Создаём..." : "+ Новый сайт"}
        </button>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Или начни с шаблона
        </p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors has-[:checked]:border-violet-500 has-[:checked]:bg-violet-500/15 has-[:checked]:text-violet-300"
            >
              <input type="radio" name="template" value={t.id} className="sr-only" />
              <span aria-hidden>{t.emoji}</span>
              {t.label}
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}