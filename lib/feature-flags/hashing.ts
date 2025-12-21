import crypto from "crypto";

/**
 * Deterministic hash to get a consistent number between 0-99 for a user+flag combo.
 */
export function getDeterministicScore(userId: string, flagKey: string): number {
  const hash = crypto
    .createHash("sha256")
    .update(`${userId}:${flagKey}`)
    .digest("hex");
    
  // Take the first 8 characters and convert to an integer
  const hashInt = parseInt(hash.substring(0, 8), 16);
  return hashInt % 100;
}