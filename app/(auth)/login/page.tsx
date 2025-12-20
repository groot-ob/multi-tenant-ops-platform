// app/auth/signin/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg border border-slate-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Access your tenant dashboard via GitHub
          </p>
        </div>

        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-white transition-hover hover:bg-slate-800 font-medium"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>

        <p className="text-center text-xs text-slate-400">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}