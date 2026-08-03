import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
  return new Response(site.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
