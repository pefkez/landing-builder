import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Builder from "@/components/builder";

export const metadata: Metadata = { title: "Билдер — Landing Builder" };

export default async function BuildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { id } = await params;
  const site = await prisma.site.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!site) notFound();

  return (
    <Builder
      site={{
        id: site.id,
        name: site.name,
        slug: site.slug,
        description: site.description,
        style: site.style,
        sections: site.sections,
        prompt: site.prompt,
        html: site.html,
        published: site.published,
      }}
    />
  );
}
