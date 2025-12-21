import { prisma, getTenantPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import IncidentTable from "./IncidentTable";
import CreateIncidentModal from "./CreateIncidentModal";
import Link from "next/link";
import { Search, Filter, XCircle, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import IncidentListClient from "./IncidentListClient";
import { getCachedIncidents } from "@/lib/services/incident-service";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { Banner } from "@/components/flags/Banner";

const PAGE_SIZE = 10;

export default async function IncidentListPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ 
    status?: string; 
    severity?: string; 
    service?: string;
    search?: string;
    cursor?: string; 
    direction?: "next" | "prev"; // Track which way we are moving
  }>;
}) {
  const { tenantSlug } = await params;
  const filters = await searchParams;
  const session = await getServerSession(authOptions);

  // Get the current user's ID and Tenant ID from the session
  const userId = session?.user?.id ?? "";
  const membership = session?.user?.memberships?.find(m => m.slug === tenantSlug);
  const tenantId = membership?.tenantId ?? "";
  const flagKey = "feature-alpha-1";
  const { enabled, trace } = await isFeatureEnabled(
   flagKey, 
    { userId, environment: "production", service: "dashboard" }, 
    tenantId
  );

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || !session) notFound();

  const db = getTenantPrisma(tenant.id);

  const whereClause: any = {
    OR: filters.search ? [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { service: { contains: filters.search, mode: 'insensitive' } },
    ] : undefined,
    status: filters.status,
    severity: filters.severity,
  };

  const isBackward = filters.direction === "prev";
  

  const queryOptions = {
    take: isBackward ? -(PAGE_SIZE + 1) : PAGE_SIZE + 1,
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    skip: filters.cursor ? 1 : 0, 
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { assignee: { select: { name: true } } },
  };

  
  const incidents = await getCachedIncidents(tenant.id, queryOptions);

  const hasMore = incidents.length > PAGE_SIZE;
  const displayIncidents = hasMore 
    ? (isBackward ? incidents.slice(1) : incidents.slice(0, -1))
    : incidents;

  // Cursors for navigation
  const firstItem = displayIncidents[0];
  const lastItem = displayIncidents[displayIncidents.length - 1];

  // Helper to persist other filters in the URL
  const getQueryString = (cursorId: string, dir: string) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.severity) params.set("severity", filters.severity);
    if (filters.search) params.set("search", filters.search);
    params.set("cursor", cursorId);
    params.set("direction", dir);
    return `?${params.toString()}`;
  };

  return (
  
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
       <Banner enabled={enabled} trace={trace} flagKey={flagKey} />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
              <span>Organizations</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900">{tenant.name}</span>
            </nav>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Incidents</h1>
          </div>
          <CreateIncidentModal tenantId={tenant.id} userId={session.user.id} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <form action="">
               <input 
                name="search" 
                defaultValue={filters.search}
                placeholder="Search by title or service..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {/* ... Filters UI remains the same ... */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 mr-2 border-r pr-2">Status</span>
              <div className="flex gap-3">
                <Link href={`?status=OPEN`} className={`text-xs hover:text-blue-600 ${filters.status === 'OPEN' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>Open</Link>
                <Link href={`?status=RESOLVED`} className={`text-xs hover:text-blue-600 ${filters.status === 'RESOLVED' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>Resolved</Link>
              </div>
            </div>
             {/* ... Severity Filters ... */}
             {(filters.status || filters.severity || filters.search) && (
              <Link href="?" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 ml-2">
                <XCircle className="w-3.5 h-3.5" /> Clear
              </Link>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <IncidentListClient 
                incidents={displayIncidents} 
                tenantSlug={tenantSlug} 
                tenantId={tenant.id}
                userId={session.user.id}
            />
          
          {/* Footer / Bidirectional Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="text-slate-900">{displayIncidents.length}</span> results
            </p>
            
            <div className="flex gap-2">
              {/* Previous Page Button */}
              {filters.cursor && (isBackward ? hasMore : true) && (
                <Link
                  href={getQueryString(firstItem?.id, "prev")}
                  className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Link>
              )}

              {/* Next Page Button */}
              {(isBackward ? true : hasMore) && (
                <Link
                  href={getQueryString(lastItem?.id, "next")}
                  className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  
  );
}