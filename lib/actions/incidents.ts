"use server";

import { getTenantPrisma } from "@/lib/prisma";
import {  Status } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";
import { simulateNotification } from "./notification";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth";

export async function createIncident(formData: any, tenantId: string, userId: string) {
  const db = getTenantPrisma(tenantId);

  const title = formData.get("title");
  const severity = formData.get("severity");
  const service = formData.get("service");
  const environment = formData.get("environment");

  const tagsRaw = formData.get("tags") as string;
  let tags: string[] = [];
    try {
      tags = tagsRaw ? JSON.parse(tagsRaw) : [];
    } catch (e) {
      console.error("Failed to parse tags:", e);
      tags = [];
    }

  const incident = await db.incident.create({
    data: {
      title,
      severity,
      service,
      environment,
      status: "OPEN",
      tenantId,
      createdById: userId,
      tags: {
        set: tags
      }, 
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

  //Purge redis cache
  try {
    const keys = await redis.keys(`incidents:${tenantId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (e) {
    console.error("Redis Cache Purge Failed:", e);
  }

  
  revalidatePath(`/t/[tenantSlug]/dashboard`, "layout");
  return incident;
}

export async function updateIncidentStatus(
  incidentId: string,
  newStatus: Status,
  tenantId: string,
  userId: string
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const db = getTenantPrisma(tenantId);

  const result = await db.$transaction(async (tx) => {
    const current = await tx.incident.findFirst({
      where: { id: incidentId, tenantId: tenantId }
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
 

    await tx.auditLog.create({
      data: {
        actorId: userId,
        tenantId,
        action: "UPDATE_STATUS",
        entity: "Incident",
        entityId: incidentId,
        before: { status: current.status },
        after: { status: newStatus },
      }
    });

    return updated;
  });

  simulateNotification({
    incidentId,
    newStatus,
    tenantId
  }).catch(err => console.error("Notification simulation failed", err));

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
  status?: Status;
  assigneeId?: string;
  tenantId: string;
  userId: string;
}) {
  const db = getTenantPrisma(tenantId);
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const allowedSourceStatuses: Record<Status, Status[]> = {
    [Status.MITIGATED]: [Status.OPEN],
    [Status.RESOLVED]: [Status.OPEN, Status.MITIGATED],
    [Status.OPEN]: [], 
  };

  const result = await db.$transaction(async (tx) => {

    const initialIncidentStates = await tx.incident.findMany({
      where: { 
        id: { in: ids }, 
        tenantId,
        ...(status && { status: { in: allowedSourceStatuses[status] } })
      },
      select: { id: true, status: true, assigneeId: true }
    });

    const updateResult = await tx.incident.updateMany({
      where: { 
        id: { in: ids }, 
        tenantId,
        ...(status && { status: { in: allowedSourceStatuses[status] } })
      },
      data: {
        ...(status && { status }),
        ...(assigneeId && { assigneeId }),
      }
    });

    if (updateResult.count > 0) {
      const events = ids.map(id => ({
        incidentId: id,
        type: "note" as const,
        content: `Bulk Action: ${status ? `Status set to ${status}` : ''} ${assigneeId ? 'Assignee updated' : ''}`,
        userId,
        tenantId
      }));
      await tx.timelineEvent.createMany({ data: events });
    }

    const auditLogs = initialIncidentStates.map(incident => ({
        actorId: userId,
        tenantId,
        action: "BULK_UPDATE",
        entity: "Incident",
        entityId: incident.id,
        before: { status: incident.status, assigneeId: incident.assigneeId },
        after: { status: status ?? incident.status, assigneeId: assigneeId ?? incident.assigneeId },
      }));
      await tx.auditLog.createMany({ data: auditLogs });
  
    return { count: updateResult.count }; // Return count from transaction
  });

  // Clear Cache
  const keys = await redis.keys(`incidents:${tenantId}:*`);
  if (keys.length > 0) await redis.del(...keys);

  revalidatePath(`/t/[tenantSlug]`, "layout");

  return { success: true, count: result.count };
}
