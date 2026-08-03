"use client";

import { useState } from "react";
import Link from "next/link";

import {
  generateSite,
  updateSiteSettings,
  togglePublish,
  saveHtml,
} from "@/lib/actions/generate";
import { SECTION_OPTIONS, STYLE_OPTIONS } from "@/lib/prompt";

export type BuilderSite = {
  id: string;
  name: string;
  slug: string;
  description: string;
  style: string;
  sections: string;
  prompt: string;
  html: string;
  published: boolean;
  views: number;
};

const SECTION_NAMES: Record<string, string> = {
  hero: "Hero",
  features: "Преимущества",
  how: "Как работает",
  testimonials: "Отзывы",
  pricing: "Тарифы",
  faq: "FAQ",
  contact: "Контакты",
  cta: "CTA",
  footer: "Подвал",
};

export default function Builder({ site }: { site: BuilderSite }) {
  const [description, setDescription] = useState(site.description);
  const [style, setStyle] = useState(site.style);
  const [sections, setSections] = useState<string[]>(
    site.sections.split(",").map((s) => s.trim()).filter(Boolean)
  );
  const [extra, setExtra] = useState(site.prompt);
  const [html, setHtml] = useState(site.html);
  const [published, setPublished] = useState(site.published);
  const [editing, setEditing] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(site.html);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [htmlSaving, setHtmlSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function toggleSection(name: string) {
    setSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateSite(site.id);
      setHtml(result.html);
      setHtmlDraft(result.html);
      setNotice("Лендинг сгенерирован");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка генерации");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    setError(null);
    const form = new FormData();
    form.set("description", description);
    form.set("style", style);
    sections.forEach((s) => form.append("sections", s));
    form.set("prompt", extra);
    try {
      const result = await updateSiteSettings(site.id, form);
      if (result?.error) setError(result.error);
      else setNotice("Настройки сохранены");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    await togglePublish(site.id);
    setPublished((p) => !p);
  }

  function startEditing() {
    setHtmlDraft(html);
    setEditing(true);
  }

  async function handleSaveHtml() {
    setHtmlSaving(true);
    setError(null);
    try {
      const result = await saveHtml(site.id, htmlDraft);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setHtml(htmlDraft);
      setEditing(false);
      setNotice("HTML сохранён");
    } finally {
      setHtmlSaving(false);
    }
  }

  const previewUrl = "/s/" + site.slug;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            ← Дашборд
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{site.name}</h1>
          <p className="text-sm text-zinc-500">
            /{site.slug}
            {site.views > 0 && (
              <span className="ml-2 text-zinc-600">
                · {site.views} просмотров
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {published && html && (
            <a
              href={previewUrl}
              target="_blank"
              className="rounded-lg bg-zinc-800 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
            >
              Открыть сайт ↗
            </a>
          )}
          <button
            type="button"
            onClick={handlePublish}
            disabled={!html}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${
              published
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
          >
            {published ? "Снять с публикации" : "Опубликовать"}
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {notice}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Описание продукта
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Например: доставка свежеобжаренного кофе за 30 минут"
              className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Стиль</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
            >
              {STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Секции</label>
            <div className="flex flex-wrap gap-1.5">
              {SECTION_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSection(s)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    sections.includes(s)
                      ? "border-violet-500 bg-violet-500/15 text-violet-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {SECTION_NAMES[s] ?? s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Дополнительные требования
            </label>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={3}
              placeholder="Например: оранжевые акценты, тариф 999₽, телефон в шапке"
              className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500"
            />
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {generating ? "Генерируем..." : html ? "Перегенерировать" : "Сгенерировать"}
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {saving ? "Сохраняем..." : "Сохранить настройки"}
            </button>
          </div>
        </aside>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">
              {editing ? "Правка HTML" : "Превью"}
            </h2>
            <div className="flex items-center gap-3">
              {published && html && !editing && (
                <p className="text-xs text-zinc-500">
                  Опубликовано:{" "}
                  <a
                    href={previewUrl}
                    target="_blank"
                    className="text-violet-400 hover:underline"
                  >
                    /s/{site.slug}
                  </a>
                </p>
              )}
              {html && (
                <button
                  type="button"
                  onClick={() => (editing ? setEditing(false) : startEditing())}
                  disabled={editing && htmlSaving}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  {editing ? "Отменить правку" : "Править HTML"}
                </button>
              )}
            </div>
          </div>
          {html ? (
            editing ? (
              <div className="flex flex-col gap-3">
                <textarea
                  value={htmlDraft}
                  onChange={(e) => setHtmlDraft(e.target.value)}
                  spellCheck={false}
                  className="h-[600px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-300 outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={handleSaveHtml}
                  disabled={htmlSaving}
                  className="self-end rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
                >
                  {htmlSaving ? "Сохраняем..." : "Сохранить HTML"}
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 bg-zinc-900 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-zinc-500">/{site.slug}</span>
                </div>
                <iframe
                  title="Превью лендинга"
                  srcDoc={html}
                  sandbox="allow-scripts"
                  className="h-[600px] w-full bg-white"
                />
              </div>
            )
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-zinc-800">
              <p className="text-sm text-zinc-500">
                Опиши продукт слева и нажми «Сгенерировать»
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
