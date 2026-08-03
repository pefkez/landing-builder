import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function requireUser(): Promise<string> {
  const session = await auth();
  if (!session) redirect("/login");
  return session.user.id;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return ip.slice(0, 64);
}
