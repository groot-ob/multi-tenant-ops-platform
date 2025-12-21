import { ensureAdmin } from "@/lib/auth/permissions";
import { getTenantPrisma } from "@/lib/prisma"; //
import SimulatorTool from "./SimulatorTool";
import { Flag, Settings2, Globe, Beaker, Terminal, CheckCircle2, CircleOff } from "lucide-react";

export default async function FeatureFlagsPage({ 
  params 
}: { 
  params: Promise<{ tenantSlug: string }> 
}) {
  const { tenantSlug } = await params;
  const { membership } = await ensureAdmin(tenantSlug);
  
  // Fetch all flags for this specific tenant
  const db = getTenantPrisma(membership.tenantId);
  const flags = await db.featureFlag.findMany({
    where: { tenantId: membership.tenantId },
    orderBy: { key: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-5 h-5 text-blue-600" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Feature Flags</h1>
          </div>
          <p className="text-slate-500 font-medium">Control feature availability for {membership.slug} across environments.</p>
        </div>
        
        <button className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg">
          <Settings2 className="w-4 h-4" />
          Create New Flag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-4">
          {flags.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Flag className="w-6 h-6 text-slate-300" />
              </div>
              <p className="font-bold text-slate-400">No flags configured yet</p>
            </div>
          ) : (
            flags.map((flag) => (
              <div 
                key={flag.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all shadow-sm group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-800 tracking-tight">{flag.key}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        flag.environment === 'production' ? 'bg-amber-100 text-amber-700' :
                        flag.environment === 'staging' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {flag.environment}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                       <div className="flex items-center gap-1">
                          <Terminal className="w-3 h-3" />
                          <span>Type: {(flag.rules as any)?.type || 'standard'}</span>
                       </div>
                       <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          {flag.enabled ? <CheckCircle2 className="w-3 h-3" /> : <CircleOff className="w-3 h-3 text-slate-300" />}
                          <span className={flag.enabled ? "" : "text-slate-400"}>
                            {flag.enabled ? "Active" : "Disabled"}
                          </span>
                       </div>
                    </div>
                  </div>
                  
                  <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-200">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-5">
           <SimulatorTool tenantSlug={tenantSlug} />
        </div>
      </div>
    </div>
  );
}