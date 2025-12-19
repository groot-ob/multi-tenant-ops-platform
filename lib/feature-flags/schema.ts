// import { z } from "zod";

// // 1. Define the individual rule types
// const PercentageRuleSchema = z.object({
//   type: z.literal("percentage"),
//   rollout: z.number().min(0).max(100), // Requirement: Percent rollout [cite: 56]
// });

// const AllowlistRuleSchema = z.object({
//   type: z.literal("allowlist"),
//   value: z.array(z.string()), // Requirement: Allowlist [cite: 58]
// });

// // 2. Define the recursive Logical Rule
// // Use z.lazy because logical rules can contain other logical rules
// const BaseRuleSchema = z.discriminatedUnion("type", [
//   PercentageRuleSchema,
//   AllowlistRuleSchema,
//   z.object({
//     type: z.literal("logical"),
//     op: z.enum(["AND", "OR"]), // Requirement: Logical composition (AND/OR) 
//     rules: z.array(z.lazy(() => FeatureFlagRuleSchema)),
//   }),
// ]);

// export const FeatureFlagRuleSchema = BaseRuleSchema;

// // Type for use in your TypeScript code
// export type FeatureFlagRule = z.infer<typeof FeatureFlagRuleSchema>;