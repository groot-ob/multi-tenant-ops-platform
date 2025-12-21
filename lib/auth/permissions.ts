import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export async function ensureAdmin(tenantSlug: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // Find the membership for this specific tenant
  const membership = session.user.memberships.find(m => m.slug === tenantSlug);

  if (!membership || membership.role.toUpperCase() !== "ADMIN") {
    // Redirect to dashboard if they aren't an admin
    redirect(`/t/${tenantSlug}/dashboard?error=unauthorized`);
  }

  return { session, membership };
}