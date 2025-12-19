// app/t/[tenantSlug]/settings/flags/tester/page.tsx
"use client";
import { useState } from "react";
// import { evaluateFlag } from "@/lib/feature-flags/engine";

export default function FlagTester() {
  const [testUserId, setTestUserId] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

//   const runTest = () => {
//     // Mocking a 50% rollout rule for testing the UI
//     const mockRule = { type: "percentage", rollout: 50 };
//     const result = evaluateFlag(testUserId, "new-dashboard", mockRule as any);
//     setTestResult(result);
//   };

  return (
    <div className="p-6 bg-white rounded-xl border">
      <h3 className="font-bold mb-4">Feature Flag Debugger</h3>
      {/* <input 
        value={testUserId} 
        onChange={(e) => setTestUserId(e.target.value)}
        placeholder="Enter User ID to test"
        className="border p-2 rounded w-full mb-4"
      />
      <button onClick={runTest} className="bg-blue-600 text-white px-4 py-2 rounded">
        Evaluate deterministic hash
      </button>

      {testResult && (
        <div className={`mt-4 p-4 rounded ${testResult.enabled ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="font-bold">{testResult.enabled ? "ENABLED" : "DISABLED"}</p>
          <p className="text-sm text-slate-500">{testResult.trace}</p>
        </div>
      )} */}
    </div>
  );
}