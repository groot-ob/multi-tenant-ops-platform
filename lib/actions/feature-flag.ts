"use server";

import { isFeatureEnabled } from "@/lib/feature-flags";
import { FlagContext } from "@/lib/feature-flags/schema";
import { ensureAdmin } from "@/lib/auth/permissions";

export async function simulateFlag(
  flagKey: string, 
  userId: string, 
  tenantSlug: string, // Passing slug to verify permissions
  environment: any
) {
  const { membership } = await ensureAdmin(tenantSlug);

  const context: FlagContext = {
    userId,
    environment,
    service: "simulator-tool",
  };


  return await isFeatureEnabled(flagKey, context, membership.tenantId);
}