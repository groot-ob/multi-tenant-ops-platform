import { getTenantPrisma } from "@/lib/prisma";
import { evaluateRule } from "./engine";
import { FlagContext } from "./schema";

export async function isFeatureEnabled(
  key: string,
  context: FlagContext,
  tenantId: string
) {
  const db = getTenantPrisma(tenantId);
  
  const flag = await db.featureFlag.findUnique({
    where: {
      // Prisma generated this name based on alphabetical order: environment_key_tenantId 
      // OR tenantId_key_environment depending on your exact schema definition.
      // Use the one the error suggested:
      tenantId_key_environment: {
        key,
        tenantId,
        environment: context.environment,
      },
    },
  });

  if (!flag || !flag.enabled) {
    return { enabled: false, trace: "Flag not found or globally inactive" };
  }

  return evaluateRule(flag.rules as any, context, key);
}