'use client';

import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/lib/hooks/use-notifications';

export default function NotificationIcon() {
 const { count, reset } = useNotificationStore();

  return (
    <div className="relative p-2 cursor-pointer group" onClick={reset}>
      <Bell className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
      
      {count > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm animate-in zoom-in duration-200">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
}