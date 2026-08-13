import { NextResponse } from "next/server";
import JSZip from "jszip";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/limits";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function injectAssets(site: {
  html: string;
  name: string;
  description: string;
  slug: string;
  customCss: string;
}): string {
  let html = site.html;
  if (site.customCss.trim()) {
    const style = `<style data-custom>\n${site.customCss}\n</style>`;
    const head = html.match(/<\/head>/i);
    html = head
      ? html.replace(/<\/head>/i, `${style}\n</head>`)
      : `${style}\n${html}`;
  }
  return html;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const site = await prisma.site.findFirst({
    where: { id, userId: session.user.id },
    select: {
      name: true,
      slug: true,
      description: true,
      html: true,
      customCss: true,
      style: true,
      updatedAt: true,
    },
  });
  if (!site || !site.html) {
    return NextResponse.json({ error: "Сайт не найден" }, { status: 404 });
  }

  const html = injectAssets(site);
  const readme = `# ${site.name}

Скачанный лендинг. Открой index.html в браузере или задеплой на любой хостинг.

- Ссылка: ${getSiteUrl()}/s/${site.slug}
- Стиль: ${site.style}
- Обновлён: ${site.updatedAt.toISOString().slice(0, 10)}
`;

  const zip = new JSZip();
  zip.file("index.html", html);
  zip.file("README.md", readme);

  const body = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

  const filename = `${encodeURIComponent(site.slug)}-landing.zip`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${site.slug}-landing.zip"; filename*=UTF-8''${filename}`,
      "Cache-Control": "no-store",
    },
  });
}