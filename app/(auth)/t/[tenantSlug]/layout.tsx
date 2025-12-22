import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/SideBar";
import NotificationIcon from "@/components/notification/NotificationIcon";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { tenantSlug } = await params;

  if (!session || !session.user) {
    redirect("/login");
  }

  const tenantMembership = session.user.memberships?.find(
    (m: any) => m.slug === tenantSlug
  );

  if (!tenantMembership) {
    redirect("/"); 
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Fixed to left */}
      <Sidebar 
        user={session.user} 
        currentTenant={tenantMembership} 
        tenantSlug={tenantSlug} 
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <NotificationIcon /> 
            {/* You could also add user avatar here later */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}