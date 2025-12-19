// app/t/[tenantSlug]/incidents/[id]/page.tsx
import { getTenantPrisma, prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import StatusButtons from "./StatusButtons"; 

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
      events: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } }
      }
    }
  });

  if (!incident) notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{incident.title}</h1>
          <p className="text-gray-500">{incident.service} • {incident.severity}</p>
        </div>
        <StatusButtons 
          incidentId={incident.id} 
          currentStatus={incident.status} 
          tenantId={tenant.id}
          userId={session.user.id}
        />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Timeline</h2>
          {incident.events.map(event => (
            <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-white shadow-sm">
              <p className="font-bold text-sm uppercase">{event.type}</p>
              <p>{event.content}</p>
              <p className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}