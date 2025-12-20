// app/t/[tenantSlug]/incidents/[id]/page.tsx
import { getTenantPrisma, prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import StatusButtons from "./StatusButtons"; 
import { FileIcon, Paperclip, Clock, ShieldAlert, User } from "lucide-react";
import FileUploader from "./FileUploader";
import { Severity } from "@prisma/client";

export default async function IncidentDetailsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const { tenantSlug, id } = await params;
  const session = await getServerSession(authOptions);
  
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || !session) notFound();

  const db = getTenantPrisma(tenant.id);

  const incident = await db.incident.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      attachments: {
        orderBy: { createdAt: "desc" }
      },
      events: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } }
      }
    }
  });

  if (!incident) notFound();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{incident.title}</h1>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
              incident.severity === Severity.SEV4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {incident.severity}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> {incident.service}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Created by {incident.createdBy?.name}</span>
          </div>
        </div>

        <StatusButtons 
          incidentId={incident.id} 
          currentStatus={incident.status} 
          tenantId={tenant.id}
          userId={session.user.id}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT COLUMN: TIMELINE --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800">Activity Timeline</h2>
          </div>
          
          <div className="space-y-4">
            {incident.events.map((event, idx) => (
              <div key={event.id} className="relative pl-8 pb-4">
                {/* Vertical Line Connector */}
                {idx !== incident.events.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100" />
                )}
                {/* Timeline Dot */}
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center z-10" />
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-xs uppercase text-blue-600 tracking-wider">{event.type}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{event.content}</p>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium italic">— {event.user?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR --- */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-blue-500" />
              Evidence & Logs
            </h2>
            
            <div className="space-y-3">
              {incident.attachments?.length === 0 ? (
                <div className="text-center py-8 bg-white/50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 italic">No files attached yet.</p>
                </div>
              ) : (
                incident.attachments.map((file) => (
                  <a 
                    key={file.id} 
                    href={file.fileUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group"
                  >
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <FileIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-gray-700 group-hover:text-blue-600">
                        {file.filename}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        {(file.fileSize / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </a>
                ))
              )}
            </div>

            <div className="mt-6">
               <FileUploader 
                  incidentId={incident.id} 
                  tenantId={tenant.id} 
               />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-[10px] text-gray-400 leading-tight">
                    Files are stored securely and scoped to this tenant. Max file size: 5MB.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}