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

function injectCustomCss(html: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return html;
  const style = `<style>\n${trimmed}\n</style>`;
  const head = html.match(/<\/head>/i);
  if (head) return html.replace(/<\/head>/i, `${style}\n</head>`);
  return `${style}\n${html}`;
}

function injectLeadScript(html: string, slug: string): string {
  const script = `<script>
(function () {
  var api = "/api/lead";
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.lead !== "true") return;
    e.preventDefault();
    var data = {
      slug: ${JSON.stringify(slug)},
      name: (form.elements.namedItem("name") || {}).value || "",
      email: (form.elements.namedItem("email") || {}).value || "",
      phone: (form.elements.namedItem("phone") || {}).value || "",
      message: (form.elements.namedItem("message") || {}).value || ""
    };
    var btn = form.querySelector("button[type=submit]");
    if (btn) btn.disabled = true;
    fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (btn) btn.disabled = false;
        var ok = document.createElement("div");
        ok.textContent = res.ok ? "Спасибо! Заявка отправлена" : (res.error || "Ошибка отправки");
        ok.style.cssText = "margin-top:12px;padding:12px;border-radius:8px;font:600 14px/1.4 sans-serif;" +
          (res.ok ? "background:#d1fae5;color:#065f46;" : "background:#fee2e2;color:#991b1b;");
        form.parentNode.insertBefore(ok, form.nextSibling);
        if (res.ok) form.reset();
      })
      .catch(function () {
        if (btn) btn.disabled = false;
      });
  });
})();
</script>`;
  const body = html.match(/<\/body>/i);
  if (body) return html.replace(/<\/body>/i, `${script}\n</body>`);
  return html + script;
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
  let html = injectSeo(site.html, {
    title: site.name,
    description: site.description || `${site.name} — лендинг`,
    url: `${origin}/s/${site.slug}`,
  });
  html = injectCustomCss(html, site.customCss);
  if (site.contactEnabled) html = injectLeadScript(html, site.slug);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
