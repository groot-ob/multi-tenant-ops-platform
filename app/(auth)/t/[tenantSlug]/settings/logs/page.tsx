
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, User, Activity, ArrowRight, History } from "lucide-react";
import { notFound } from "next/navigation";

export default async function AuditLogsPage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = await params;
  const session = await getServerSession(authOptions);
  
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || !session) notFound();

  // Security: Ensure tenant isolation
  const logs = await prisma.auditLog.findMany({
    where: { tenantId: tenant.id },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 flex items-center gap-3">
          <History className="w-8 h-8 text-blue-600" />
          Audit Logs
        </h1>
        <p className="text-slate-600 font-medium mt-1">
          A secure, immutable trail of all actions performed within <span className="text-slate-900 font-bold">{tenant.name}</span>.
        </p>
      </div>

      <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-300">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-700">Action & Actor</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-700">Changes (Before → After)</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-700">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Action & Actor */}
                <td className="px-6 py-5 align-top">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-tighter">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pt-1">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      {log.entity}: {log.entityId.slice(0, 8)}...
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <User className="w-3 h-3" />
                      ID: {log.actorId.slice(0, 8)}
                    </div>
                  </div>
                </td>

                {/* Json Diff Viewer */}
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-2 bg-red-50 border border-red-100 rounded-lg text-[11px] font-mono text-red-700 truncate max-w-[150px]">
                      {log.before ? JSON.stringify(log.before) : 'null'}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <div className="flex-1 p-2 bg-green-50 border border-green-100 rounded-lg text-[11px] font-mono text-green-700 truncate max-w-[150px]">
                      {log.after ? JSON.stringify(log.after) : 'null'}
                    </div>
                  </div>
                </td>

                {/* Timestamp */}
                <td className="px-6 py-5 align-top text-right whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-900">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium">
            No audit logs found for this tenant.
          </div>
        )}
      </div>
    </div>
  );
}