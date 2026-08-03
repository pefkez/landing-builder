import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Landing<span className="text-violet-500">Builder</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="px-3 py-2 text-zinc-300 transition-colors hover:text-white"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Начать бесплатно
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
            Генерация на Claude
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Лендинг за{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              30 секунд
            </span>{" "}
            без дизайнера
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
            Опиши продукт — ИИ соберёт продающий одностраничник: тексты, структура
            и дизайн. Опубликуй по ссылке и делись с клиентами.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-lg bg-violet-600 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-violet-500 sm:w-auto"
            >
              Создать лендинг бесплатно
            </Link>
            <a
              href="#how"
              className="w-full rounded-lg border border-zinc-700 px-8 py-3.5 font-medium transition-colors hover:bg-zinc-800/60 sm:w-auto"
            >
              Как это работает
            </a>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Бесплатный план: 3 лендинга, 10 генераций. Без карты.
          </p>

          <div className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-zinc-500">
                ваш-лендинг.landing-builder.app
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 p-6 text-left text-sm sm:grid-cols-6">
              {["Hero", "Фичи", "Как работает", "Отзывы", "Тарифы", "FAQ"].map(
                (label, i) => (
                  <div
                    key={label}
                    className={`rounded-lg border ${
                      i === 0
                        ? "col-span-3 row-span-2 border-violet-500/40 bg-violet-500/10 p-4"
                        : "border-zinc-800 bg-zinc-900 p-4"
                    }`}
                  >
                    <div className={`${i === 0 ? "text-2xl" : "text-base"} font-semibold`}>
                      {label}
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="h-1.5 rounded bg-zinc-700" />
                      <div className="h-1.5 w-3/4 rounded bg-zinc-700" />
                      <div className="h-1.5 w-1/2 rounded bg-zinc-700" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-zinc-900 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold">
              Три шага до готового сайта
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Опиши продукт",
                  text: "Что продаёшь, какой стиль и какие секции нужны — парой предложений.",
                },
                {
                  step: "02",
                  title: "ИИ собирает лендинг",
                  text: "Claude генерирует структуру, тексты и дизайн. Перегенерируй, пока не понравится.",
                },
                {
                  step: "03",
                  title: "Публикуй",
                  text: "Один клик — и лендинг доступен по ссылке. Подключи свой домен позже.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
                >
                  <div className="text-sm font-bold text-violet-400">{item.step}</div>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-900 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold">Что внутри</h2>
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
              {[
                {
                  title: "5 стилей дизайна",
                  text: "Modern, minimal, dark, playful, corporate — под любую нишу.",
                },
                {
                  title: "9 секций на выбор",
                  text: "Hero, преимущества, отзывы, тарифы, FAQ, форма и другие.",
                },
                {
                  title: "Живое превью",
                  text: "Смотри результат в реальном времени до публикации.",
                },
                {
                  title: "Правки текстом",
                  text: "Добавь требования: «оранжевые акценты, тариф 999₽» — ИИ учтёт.",
                },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      {f.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-900 py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-3xl font-bold">Тарифы</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="mt-1 text-sm text-zinc-400">Попробовать</p>
                <div className="mt-4 text-3xl font-bold">0 ₽</div>
                <ul className="mt-6 space-y-2 text-sm text-zinc-300">
                  <li>3 лендинга</li>
                  <li>10 генераций</li>
                  <li>Публикация по ссылке</li>
                </ul>
                <Link
                  href="/register"
                  className="mt-8 block rounded-lg border border-zinc-700 px-4 py-2.5 text-center font-semibold transition-colors hover:bg-zinc-800"
                >
                  Начать
                </Link>
              </div>
              <div className="relative rounded-xl border border-violet-500/50 bg-violet-500/5 p-8">
                <span className="absolute -top-3 right-6 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold">
                  Скоро
                </span>
                <h3 className="text-lg font-semibold">Pro</h3>
                <p className="mt-1 text-sm text-zinc-400">Для запуска</p>
                <div className="mt-4 text-3xl font-bold">
                  990 ₽<span className="text-base font-normal text-zinc-400">/мес</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-zinc-300">
                  <li>Безлимит лендингов</li>
                  <li>Безлимит генераций</li>
                  <li>Свой домен</li>
                  <li>Приоритетная генерация</li>
                </ul>
                <button
                  disabled
                  className="mt-8 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-center font-semibold opacity-50"
                >
                  Скоро
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-900 py-20 text-center">
          <h2 className="text-3xl font-bold">Готовый лендинг — сегодня</h2>
          <p className="mx-auto mt-3 max-w-md text-zinc-400">
            Не жди дизайнера и неделю вёрстки. Опиши продукт — и покажи сайт клиенту
            через полминуты.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-violet-600 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Создать бесплатно
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-900 py-8 text-center text-sm text-zinc-600">
        LandingBuilder — лендинги на ИИ. © 2026
      </footer>
    </div>
  );
}
