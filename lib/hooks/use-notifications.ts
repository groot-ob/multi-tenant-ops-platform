import { create } from 'zustand'; // You can also use simple useState/Context

interface NotificationState {
  count: number;
  increment: (by: number) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  increment: (by) => set((state) => ({ count: state.count + by })),
  reset: () => set({ count: 0 }),
}));