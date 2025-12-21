import { FeatureRule, FlagContext } from "./schema";
import { getDeterministicScore } from "./hashing";

interface EvaluationResult {
  enabled: boolean;
  trace: string;
}

export function evaluateRule(
  rule: FeatureRule,
  context: FlagContext,
  flagKey: string
): EvaluationResult {
  switch (rule.type) {
    case "percent": {
      const score = getDeterministicScore(context.userId, flagKey);
      const enabled = score < rule.rollout;
      return {
        enabled,
        trace: `Percent: User score ${score} is ${enabled ? "<" : ">="} target ${rule.rollout}`,
      };
    }

    case "allowlist": {
      const enabled = rule.values.includes(context.userId);
      return {
        enabled,
        trace: `Allowlist: User ${context.userId} is ${enabled ? "present" : "absent"}`,
      };
    }

    case "logical": {
      const results = rule.conditions.map((c:FeatureRule) => evaluateRule(c, context, flagKey));
      const enabled = rule.operator === "AND" 
        ? results.every((r:EvaluationResult) => r.enabled) 
        : results.some((r:EvaluationResult) => r.enabled);

      return {
        enabled,
        trace: `${rule.operator}([${results.map((r:EvaluationResult)  => r.trace).join(", ")}]) -> ${enabled}`,
      };
    }

    default:
      return { enabled: false, trace: "Unknown rule type" };
  }
}