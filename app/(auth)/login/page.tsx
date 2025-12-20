"use client";

import { signIn } from "next-auth/react";
import { Github, Globe } from "lucide-react"; 

// Small helper component to keep the SVG logic out of the main UI
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
          <p className="text-sm text-slate-500 mt-2">Access your incident dashboard</p>
        </div>
        
        <div className="space-y-3">
          {/* Google Sign In - Now clean like GitHub */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* GitHub Sign In */}
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-slate-900 border border-slate-900 rounded-xl text-white font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <Github className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}