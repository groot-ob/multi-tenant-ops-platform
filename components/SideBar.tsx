"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, AlertCircle, Settings, Users, 
  LogOut, Zap, ChevronRight, 
  ScrollText
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null; // Allow null to prevent crashes
  currentTenant: {
    name: string;
    role: string;
  };
  tenantSlug: string;
}

export default function Sidebar({ user, currentTenant, tenantSlug }: SidebarProps) {
  const pathname = usePathname();

  // Safety check: If user data is missing during a session transition, 
  // render a skeleton or nothing instead of crashing.
  if (!user) return <aside className="w-64 border-r bg-white fixed inset-y-0" />;

  const navItems = [

    { name: 'Settings', href: `/t/${tenantSlug}/settings/flags`, icon: Settings },
    { name: "Logs", href: `/t/${tenantSlug}/settings/logs`, icon: ScrollText }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col fixed inset-y-0 z-40 shadow-sm">
      {/* 1. PROFILE SECTION */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name || "User"} 
                className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="flex-1 overflow-hidden">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {user.name || "Anonymous"}
            </h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate">
              {currentTenant.role}
            </p>
          </div>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all group"
        >
          <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>

      {/* 2. NAVIGATION */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Menu</span>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* 3. ORGANIZATION FOOTER */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest truncate">
            {currentTenant.name}
          </span>
        </div>
      </div>
    </aside>
  );
}