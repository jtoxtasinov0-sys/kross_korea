// Admin panel holati: token (telefonda saqlanadi), bo'lim, kutilayotgan buyurtmalar soni, toast
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AdminSection } from '@/types/admin';

interface AdminState {
  token: string;
  name: string;
  section: AdminSection;
  pending: number;
  ordersFilter: string; // buyurtmalar holat filtri (boshqaruvdan o'tilganda)
  toast: { id: number; text: string; tone: 'ok' | 'error' } | null;
  login: (token: string, name: string) => void;
  logout: () => void;
  go: (section: AdminSection, ordersFilter?: string) => void;
  setPending: (n: number) => void;
  notify: (text: string, tone?: 'ok' | 'error') => void;
  clearToast: () => void;
}

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      token: '',
      name: '',
      section: 'dashboard',
      pending: 0,
      ordersFilter: '',
      toast: null,
      login: (token, name) => set({ token, name }),
      logout: () => set({ token: '', name: '' }),
      go: (section, ordersFilter) => set((s) => ({ section, ordersFilter: ordersFilter ?? s.ordersFilter })),
      setPending: (pending) => set({ pending }),
      notify: (text, tone = 'ok') => set({ toast: { id: Date.now(), text, tone } }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'kross-admin',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, name: s.name, section: s.section }),
    },
  ),
);
