"use client";

import { useActionState } from "react";

import { register, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = undefined;

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-300">
          Имя
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-300">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
      >
        {pending ? "Создаём..." : "Создать аккаунт"}
      </button>
    </form>
  );
}
