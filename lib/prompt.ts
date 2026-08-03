const SECTION_LABELS: Record<string, string> = {
  hero: "Hero — крупный заголовок, подзаголовок, призыв к действию",
  features: "Features — 3–6 карточек преимуществ",
  how: "How it works — шаги как это работает",
  testimonials: "Testimonials — отзывы клиентов",
  pricing: "Pricing — 2–3 тарифа с ценами",
  faq: "FAQ — 4–6 вопросов с ответами",
  contact: "Contact — форма связи",
  cta: "CTA — финальный призыв к действию",
  footer: "Footer — контакты, соцсети, копирайт",
};

export const SECTION_OPTIONS = Object.keys(SECTION_LABELS);

export function buildPrompt(input: {
  name: string;
  description: string;
  style: string;
  sections: string[];
  extra: string;
}): string {
  const sectionLines = input.sections
    .map((s) => SECTION_LABELS[s] ?? s)
    .join("\n- ");

  const styleGuide: Record<string, string> = {
    modern: "современный, чистый, много воздуха, акцентные градиенты",
    minimal: "минимализм, почти без цветов, типографика решает",
    dark: "тёмная тема, неоновые акценты, tech-стиль",
    playful: "яркий, дружелюбный, скруглённые формы, крупная типографика",
    corporate: "деловой, строгий, консервативные цвета",
  };

  return `Сгенерируй законченный одностраничный лендинг на русском языке.

Сайт: ${input.name}
Что это: ${input.description || "не указано, придумай правдоподобное описание"}
Стиль: ${styleGuide[input.style] ?? "современный"}
Секции в таком порядке:
- ${sectionLines}

Дополнительные требования:
${input.extra || "нет"}

Правила:
- Верни ТОЛЬКО HTML без markdown-обёрток (без \`\`\`) и без пояснений
- Один самодостаточный файл: инлайн CSS в <style>, без внешних библиотек и CDN
- Полностью адаптивная вёрстка, современный дизайн, градиенты и hover-эффекты
- Правдоподобный контент (тексты, цены, отзывы) на русском языке
- Семантичные теги, доступность, favicon через data-URI
- Без внешних картинок: используй CSS-градиенты и эмодзи для иллюстраций`;
}
