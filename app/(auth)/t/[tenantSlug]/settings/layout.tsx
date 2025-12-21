import { ensureAdmin } from "@/lib/auth/permissions";

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  
  // This will throw a redirect if the user is not an ADMIN for this tenant
  await ensureAdmin(tenantSlug);

  return (
    <div className="flex flex-col space-y-6">
      {children}
    </div>
  );
}