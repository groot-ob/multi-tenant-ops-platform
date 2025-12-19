// import { evaluateFlag } from "../feature-flags/engine";
// import { prisma } from "../prisma";

// // lib/actions/flags.ts
// export async function isFeatureEnabled(userId: string, tenantId: string, key: string) {
//   const flag = await prisma.featureFlag.findUnique({
//     where: { tenantId_key_environment: { tenantId, key, environment: 'production' } }
//   });

//   if (!flag || !flag.enabled) return false;

//   const evaluation = evaluateFlag(userId, key, flag.rules as any);
//   return evaluation.enabled;
// }

// import { FeatureFlagRuleSchema } from "../feature-flags/schema";

// export async function updateFeatureFlag(id: string, rules: any) {
//   // Validate before database write 
//   const validatedRules = FeatureFlagRuleSchema.parse(rules);

//   return await prisma.featureFlag.update({
//     where: { id },
//     data: { rules: validatedRules as any }
//   });
// }