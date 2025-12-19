// import crypto from "crypto";

// export type EvaluationRule = {
//   type: "allowlist" | "percentage" | "logical";
//   value?: string[]; // For allowlist: ["user_1", "user_2"]
//   rollout?: number; // For percentage: 50
//   op?: "AND" | "OR";
//   rules?: EvaluationRule[];
// };

// export function evaluateFlag(
//   userId: string, 
//   flagKey: string, 
//   rules: EvaluationRule
// ): { enabled: boolean; trace: string } {
  
//   // 1. Percentage Rollout Logic
//   if (rules.type === "percentage") {
//     // Deterministic hash: userId + flagKey -> number between 0-99
//     const hash = crypto.createHash('sha256').update(userId + flagKey).digest('hex');
//     const hashInt = parseInt(hash.substring(0, 8), 16) % 100;
//     const isEnabled = hashInt < (rules.rollout || 0);
//     return { 
//       enabled: isEnabled, 
//       trace: `Hash ${hashInt} vs Rollout ${rules.rollout}%` 
//     };
//   }

//   // 2. Allowlist Logic
//   if (rules.type === "allowlist") {
//     const isAllowed = rules.value?.includes(userId) || false;
//     return { 
//       enabled: isAllowed, 
//       trace: isAllowed ? "User in allowlist" : "User not in allowlist" 
//     };
//   }

//   // 3. Logical Composition (AND/OR)
//   if (rules.type === "logical") {
//     const results = rules.rules?.map(r => evaluateFlag(userId, flagKey, r)) || [];
//     const isEnabled = rules.op === "AND" 
//       ? results.every(r => r.enabled) 
//       : results.some(r => r.enabled);
    
//     return { 
//       enabled: isEnabled, 
//       trace: `Logical ${rules.op}: [${results.map(r => r.trace).join(", ")}]` 
//     };
//   }

//   return { enabled: false, trace: "Default: Disabled" };
// }