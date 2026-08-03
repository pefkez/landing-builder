import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/limits";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const sites = await prisma.site.findMany({
    where: { published: true, html: { not: "" } },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...sites.map((site) => ({
      url: `${base}/s/${site.slug}`,
      lastModified: site.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
