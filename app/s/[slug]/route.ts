import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/limits";

export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectSeo(
  html: string,
  meta: { title: string; description: string; url: string }
): string {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="robots" content="index, follow">`,
  ].join("\n");

  const head = html.match(/<\/head>/i);
  if (head) return html.replace(/<\/head>/i, `${tags}\n</head>`);
  const start = html.match(/<html[^>]*>/i);
  if (start) {
    return html.replace(/<html[^>]*>/i, (tag) => `${tag}\n<head>\n${tags}\n</head>`);
  }
  return tags + "\n" + html;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site || !site.published || !site.html) {
    return new Response("Страница не найдена", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (site.views < 100_000) {
    prisma.site
      .update({
        where: { id: site.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => {});
  }

  const origin = getSiteUrl();
  const html = injectSeo(site.html, {
    title: site.name,
    description: site.description || `${site.name} — лендинг`,
    url: `${origin}/s/${site.slug}`,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
