import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function getCachedIncidents(tenantId: string, queryOptions: any) {
  const secureQueryOptions = {
    ...queryOptions,
    where: {
      ...queryOptions.where,
      tenantId: tenantId, // Injection of the tenant security context
    },
  };

  const queryHash = Buffer.from(JSON.stringify(secureQueryOptions)).toString('base64');
  const CACHE_KEY = `incidents:${tenantId}:${queryHash}`;

  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      console.log(`[Cache Hit] Tenant: ${tenantId}`);
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Redis error:", e);
  }

  const incidents = await prisma.incident.findMany(secureQueryOptions);

  try {
    // Store for 5 minutes
   await redis.set(CACHE_KEY, JSON.stringify(incidents), "EX", 30);
  } catch (e) {
    console.error("Redis save error:", e);
  }
  
  return incidents;
}