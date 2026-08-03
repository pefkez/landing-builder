export function intFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export function getSitesLimit(): number {
  return intFromEnv("SITES_LIMIT", 3);
}

export function getGenerationsLimitDay(): number {
  return intFromEnv("GENERATIONS_LIMIT_DAY", 10);
}

export function getMaxHtmlLength(): number {
  return intFromEnv("MAX_HTML_LENGTH", 300_000);
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}
