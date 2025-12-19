import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { Prisma } from "@prisma/client";

export async function getCachedIncidents(tenantId: string, queryOptions: any) {
  // Create a unique key based on the tenant AND the specific filters/pagination
  const queryHash = Buffer.from(JSON.stringify(queryOptions)).toString('base64');
  const CACHE_KEY = `incidents:${tenantId}:${queryHash}`;

  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      console.log("🎯 Cache Hit");
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Redis error:", e);
  }

  console.log("🐢 Cache Miss");
  const incidents = await prisma.incident.findMany(queryOptions);

  // Store for 5 minutes
  await redis.set(CACHE_KEY, JSON.stringify(incidents), "EX", 300);
  
  return incidents;
}