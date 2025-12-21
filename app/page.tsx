import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import Link from "next/link";
import { ChevronRight, Building2, LogIn, PlusCircle } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
             <Building2 className="text-white w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ops Platform</h1>
            <p className="text-slate-500 font-medium">Please sign in to manage your organizations.</p>
          </div>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200">
            <Building2 className="text-blue-600 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Select Organization
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Welcome back, {session.user.name}
          </p>
        </div>

        {/* Selection Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="p-2">
            <ul className="space-y-1">
              {session.user.memberships.map((m) => (
                <li key={m.tenantId}>
                  <Link 
                    href={`/t/${m.slug}/dashboard`}
                    className="group flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar / Icon */}
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {m.name}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {m.role}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Action */}
          <div className="bg-slate-50 p-4 border-t border-slate-100">
            <button className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              <PlusCircle className="w-4 h-4" />
              Create New Organization
            </button>
          </div>
        </div>

        {/* Utility Links */}
        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          Logged in as <span className="text-slate-600">{session.user.email}</span>
        </p>
      </div>
    </div>
  );
}