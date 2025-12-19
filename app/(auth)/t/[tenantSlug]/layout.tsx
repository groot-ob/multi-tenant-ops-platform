import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/SideBar";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>; // Change to Promise
}) {
  const session = await getServerSession(authOptions);
  
  // Await the params!
  const { tenantSlug } = await params;

  if (!session || !session.user) {
    redirect("/login");
  }

  const tenantMembership = session.user.memberships?.find(
    (m: any) => m.slug === tenantSlug
  );

  if (!tenantMembership) {
    console.log("Redirect triggered: Membership not found for slug:", tenantSlug);
    redirect("/"); 
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        user={session.user} 
        currentTenant={tenantMembership} 
        tenantSlug={tenantSlug} 
      />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}