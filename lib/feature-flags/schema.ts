import { z } from "zod";

/**
 * Rule Schema
 * Defines the logic for Percent Rollout, Allowlists, and Nesting (AND/OR)
 */
export const FeatureRuleSchema: z.ZodType<any> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("percent"),
      rollout: z.number().min(0).max(100),
    }),
    z.object({
      type: z.literal("allowlist"),
      values: z.array(z.string()), 
    }),
    z.object({
      type: z.literal("logical"),
      operator: z.enum(["AND", "OR"]),
      conditions: z.array(FeatureRuleSchema),
    }),
  ])
);

/**
 * Context Schema
 * The input data required to evaluate a flag
 */
export const FlagContextSchema = z.object({
  userId: z.string(),
  environment: z.enum(["production", "staging", "development"]),
  service: z.string(),
});

export type FeatureRule = z.infer<typeof FeatureRuleSchema>;
export type FlagContext = z.infer<typeof FlagContextSchema>;