"use client";

import { useState } from "react";
import { simulateFlag } from "@/lib/actions/feature-flag";
import { Terminal, Zap, ShieldCheck, AlertCircle, Loader2, Database } from "lucide-react";

export default function SimulatorTool({ tenantSlug }: { tenantSlug: string }) {
  const [userId, setUserId] = useState("");
  const [flagKey, setFlagKey] = useState("");
  const [env, setEnv] = useState("production");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ enabled: boolean; trace: string } | null>(null);

  const handleEvaluate = async () => {
    if (!userId || !flagKey) return;
    setLoading(true);
    try {
      const res = await simulateFlag(flagKey, userId, tenantSlug, env);
      setResult(res);
    } catch (e) {
      console.error("Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Test Parameters</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Environment Target</label>
            <select 
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mock User ID</label>
            <input 
              type="text"
              placeholder="e.g. user_99"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border border-slate-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Feature Flag Key</label>
            <input 
              type="text"
              placeholder="e.g. beta-features"
              value={flagKey}
              onChange={(e) => setFlagKey(e.target.value)}
              className="w-full border border-slate-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          onClick={handleEvaluate}
          disabled={loading || !userId || !flagKey}
          className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-4 h-4" />}
          Run Simulation
        </button>
      </div>

      {result && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <div className={`rounded-2xl border-2 overflow-hidden shadow-lg ${
            result.enabled ? 'border-emerald-500/20' : 'border-slate-200'
          }`}>
            <div className={`px-5 py-4 flex items-center justify-between ${
              result.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <div className="flex items-center gap-3 font-black text-sm uppercase tracking-wider">
                {result.enabled ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {result.enabled ? "Access Granted" : "Access Denied"}
              </div>
            </div>
            
            <div className="bg-slate-950 p-6">
              <div className="flex items-center gap-2 text-slate-500 mb-3 border-b border-slate-800 pb-2">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Logic Trace Output</span>
              </div>
              <pre className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
                {`> ${result.trace}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}