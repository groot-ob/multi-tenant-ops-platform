"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Github, Mail, Loader2, AlertCircle, CheckCircle2, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (provider: string, isEmail = false) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const result = await signIn(provider, { 
        email: isEmail ? email : undefined,
        callbackUrl: "/",
        redirect: isEmail ? false : true, // Manual handle for email to show success alert
      });

      if (isEmail) {
        if (result?.error) {
          setStatus("error");
          setErrorMessage("Could not send magic link. Please try again.");
        } else {
          setStatus("success");
        }
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* 1. TOP PROGRESS BAR */}
      {status === "loading" && (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-blue-100">
          <div className="h-full bg-blue-600 animate-progress-fast origin-left" />
        </div>
      )}

      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg mb-2">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          
          {/* 2. ALERTS SECTION */}
          {status === "error" && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {status === "success" && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center gap-2 text-emerald-800 animate-in zoom-in-95">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <div className="space-y-1">
                <p className="font-bold">Check your email</p>
                <p className="text-xs">A magic link has been sent to <b>{email}</b></p>
              </div>
            </div>
          )}

          {/* Login Content - Hidden on Success to focus on instructions */}
          {status !== "success" && (
            <>
              <div className="space-y-3">
                <button
                  disabled={status === "loading"}
                  onClick={() => handleSignIn("github")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  <Github className="w-4 h-4" />
                  Continue with GitHub
                </button>
              </div>

              <div className="my-6 border-t border-slate-100 relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-slate-400 text-[10px] font-bold uppercase">OR</span>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSignIn("email", true); }} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Work Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Magic Link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}