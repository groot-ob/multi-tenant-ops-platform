"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createIncident(formData: any, tenantId: string, userId: string) {
  const db = getTenantPrisma(tenantId);

  const title = formData.get("title");
  const severity = formData.get("severity");
  const service = formData.get("service");
  const environment = formData.get("environment");

  const incident = await db.incident.create({
    data: {
      title,
      severity,
      service,
      environment,
      status: "OPEN",
      tenantId,
      createdById: userId,
  
      tags: ["manual-report"], 
    },
  });

  // Automatically log the creation in the timeline
  await db.timelineEvent.create({
    data: {
      type: "note",
      content: `Incident created manually by user.`,
      incidentId: incident.id,
      userId: userId,
      tenantId: tenantId
    }
  });

  revalidatePath(`/t/[tenantSlug]/dashboard`, "layout");
  return incident;
}

export async function updateIncidentStatus(
  incidentId: string,
  newStatus: Status,
  tenantId: string,
  userId: string
) {
  const db = getTenantPrisma(tenantId);

  const result = await db.$transaction(async (tx) => {
    const current = await tx.incident.findUnique({
      where: { id: incidentId },
      select: { status: true }
    });

    if (!current) throw new Error("Incident not found");
    if (current.status === Status.RESOLVED && newStatus === Status.OPEN) {
      throw new Error("Logic Violation: Resolved incidents cannot be re-opened.");
    }

    const updated = await tx.incident.update({
      where: { id: incidentId },
      data: { status: newStatus }
    });

    await tx.timelineEvent.create({
      data: {
        type: "status_change",
        content: `Status changed from ${current.status} to ${newStatus}`,
        incidentId,
        userId,
        tenantId 
      }
    });

    return updated;
  });

  revalidatePath(`/t/[tenantSlug]/dashboard`, "layout");

  return result;
}

export async function bulkUpdateIncidents({
  ids,
  status,
  assigneeId,
  tenantId,
  userId
}: {
  ids: string[];
  status?: any;
  assigneeId?: string;
  tenantId: string;
  userId: string;
}) {
  const db = getTenantPrisma(tenantId);

  await db.$transaction(async (tx) => {
    // 1. Perform the bulk update
    await tx.incident.updateMany({
      where: { id: { in: ids }, tenantId }, // tenantId check is critical!
      data: {
        ...(status && { status }),
        ...(assigneeId && { assigneeId }),
      }
    });

    // 2. Create timeline events for each incident
    const events = ids.map(id => ({
      incidentId: id,
      type: "note" as const,
      content: `Bulk Action: ${status ? `Status set to ${status}` : ''} ${assigneeId ? 'Assignee updated' : ''}`,
      userId,
      tenantId
    }));

    await tx.timelineEvent.createMany({ data: events });
  });

  revalidatePath(`/t/[tenantSlug]/dashboard`, "layout");
}