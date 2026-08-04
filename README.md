# LandingBuilder

Генерирует лендинг по описанию через клода. Описал продукт - получил готовую страницу с текстами и дизайном, публикуется по ссылке.

Стек: next.js 16, typescript, tailwind, prisma (sqlite, для прода postgres), nextauth, антропик-сдк.

Запуск:

```
npm install
npx prisma migrate dev
npm run dev
```

В .env нужны `AUTH_SECRET` (openssl rand -base64 32) и `ANTHROPIC_API_KEY`, шаблон в .env.example.

Что умеет:

- регистрация и вход по почте (rate limit на попытки)
- дашборд со списком лендингов и просмотрами
- билдер: описание, стиль (5 штук), секции (9), доп. требования
- генерация на Claude, можно перегенерировать или править HTML руками
- превью в реальном времени
- публикация по ссылке /s/slug с SEO-тегами и sitemap
- лимиты бесплатного плана: 3 лендинга, 10 генераций в сутки

Публичный лендинг отдаётся просто html без панели и авторизации.

## Как это работает

1. Описываешь продукт и выбираешь стиль (5 штук) и секции (9 на выбор).
2. Claude генерирует HTML лендинга с текстами и дизайном.
3. Превью в реальном времени, можно перегенерировать или править HTML руками.
4. Публикация — лендинг отдаётся по ссылке `/s/slug` без панели и авторизации, с SEO-тегами и sitemap.

## Структура проекта

```
app/
  login, register   — авторизация
  dashboard         — список лендингов с просмотрами
  build/[id]        — билдер и предпросмотр
  s/[slug]          — публичный лендинг (html без панели)
  api/auth          — next-auth
components/         — формы, билдер, карточки сайтов
lib/actions/        — серверные действия (создание, генерация, публикация)
prisma/             — schema (sqlite локально / postgres в проде)
```

## Полезные команды

```
npm run lint         # eslint
npx prisma studio    # посмотреть данные в браузере
```

## Деплой на Vercel

Нужен postgres (например, Neon или Supabase):

1. `vercel.json` не нужен — сборка подхватит `vercel-build` скрипт сам.
2. В настройках проекта задай переменные:
   - `DATABASE_URL` — postgres-строка подключения
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `ANTHROPIC_API_KEY` — ключ Anthropic
   - `NEXT_PUBLIC_SITE_URL` — адрес сайта, например `https://landing-builder.vercel.app`
3. Миграции применятся автоматически при сборке (`prisma migrate deploy`).
4. Локальная разработка — sqlite (`prisma/schema.prisma`), продакшн — `prisma/schema.postgres.prisma` (модели одинаковые).
