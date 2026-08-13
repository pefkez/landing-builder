export type Template = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  siteDescription: string;
  style: string;
  sections: string;
  prompt: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "coffee",
    label: "Кофейня / доставка еды",
    emoji: "☕",
    description: "Лендинг для кофейни или сервиса доставки",
    siteDescription:
      "Кофейня с обжаркой свежего кофе и доставкой по городу за 30 минут",
    style: "modern",
    sections: "hero,features,how,pricing,contact,footer",
    prompt: "Тарифы: 299₽ за стакан. Акцент на свежую обжарку и скорость доставки",
  },
  {
    id: "course",
    label: "Онлайн-курс",
    emoji: "🎓",
    description: "Продажа онлайн-курса или обучения",
    siteDescription:
      "Онлайн-курс по запуску собственного дела с нуля за 8 недель",
    style: "corporate",
    sections: "hero,features,how,testimonials,pricing,faq,cta,footer",
    prompt: "Тарифы: базовый 9 900₽, премиум 24 900₽. Добавь гарантию возврата",
  },
  {
    id: "saas",
    label: "SaaS / приложение",
    emoji: "💻",
    description: "Сервис, приложение или B2B-продукт",
    siteDescription:
      "Сервис для автоматизации учёта расходов малого бизнеса",
    style: "dark",
    sections: "hero,features,how,pricing,faq,cta,footer",
    prompt: "Подписки: старт 0₽, про 990₽/мес. Покажи API-интеграции и бейдж «сделано в России»",
  },
  {
    id: "fitness",
    label: "Фитнес / спорт",
    emoji: "💪",
    description: "Фитнес-клуб, тренер или марафон",
    siteDescription: "Студия функционального тренинга с персональными программами",
    style: "playful",
    sections: "hero,features,how,testimonials,pricing,cta,footer",
    prompt: "Первый месяц со скидкой 50%. Пробное занятие бесплатно",
  },
  {
    id: "beauty",
    label: "Бьюти-студия",
    emoji: "💇‍♀️",
    description: "Салон красоты, барбершоп или маникюр",
    siteDescription:
      "Студия красоты: маникюр, брови, уход. Действуют мастера с опытом 5+ лет",
    style: "minimal",
    sections: "hero,features,how,pricing,contact,footer",
    prompt: "Прайс: маникюр от 1500₽, брови от 900₽. Запись по телефону в шапке",
  },
  {
    id: "agency",
    label: "Агентство",
    emoji: "📈",
    description: "Маркетинг, разработка, консалтинг",
    siteDescription:
      "Агентство интернет-маркетинга: контекст, таргет, SEO для e-commerce",
    style: "corporate",
    sections: "hero,features,how,testimonials,cta,footer",
    prompt: "Покажи кейсы с цифрами: рост продаж ×2.4 за 3 месяца",
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}