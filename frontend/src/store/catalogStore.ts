// Katalog va mijoz sessiyasi: bir marta yuklanadi, ilovaga qaytilganda jimgina yangilanadi
import { create } from 'zustand';
import { api, ApiError, type AuthResponse } from '@/lib/api';
import type { Catalog, Product } from '@/types';

type Status = 'idle' | 'loading' | 'waking' | 'ready' | 'error' | 'botOnly';

interface CatalogState {
  catalog: Catalog | null;
  byId: Map<number, Product>;
  session: AuthResponse | null;
  botUrl: string;
  status: Status;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Bepul serverda backend uxlab qolgan bo'lishi mumkin — 502/503/504 va tarmoq xatosida qayta urinamiz
const isWaking = (err: unknown) => err instanceof ApiError && (err.status === 0 || err.status >= 502);

function index(catalog: Catalog) {
  return new Map(catalog.products.map((p) => [p.id, p]));
}

export const useCatalog = create<CatalogState>()((set, get) => ({
  catalog: null,
  byId: new Map(),
  session: null,
  botUrl: '',
  status: 'idle',

  load: async () => {
    if (get().status === 'loading' || get().status === 'waking') return;
    set({ status: 'loading' });
    for (let attempt = 0; attempt < 10; attempt += 1) {
      try {
        const [catalog, session] = await Promise.all([api.catalog(), api.auth()]);
        set({ catalog, byId: index(catalog), session, status: 'ready' });
        return;
      } catch (err) {
        if (err instanceof ApiError && err.code === 'browser_closed') {
          const access = await api.access().catch(() => ({ botUrl: '' }));
          set({ status: 'botOnly', botUrl: access.botUrl });
          return;
        }
        if (!isWaking(err)) break;
        set({ status: 'waking' });
        await wait(Math.min(2000 + attempt * 1500, 8000));
      }
    }
    set({ status: 'error' });
  },

  refresh: async () => {
    try {
      const catalog = await api.catalog();
      set({ catalog, byId: index(catalog) });
    } catch {
      // jim yangilash — xato bo'lsa eski ma'lumot qoladi
    }
  },

  refreshSession: async () => {
    try {
      set({ session: await api.auth() });
    } catch {
      // e'tiborsiz
    }
  },
}));

export const useProduct = (id: number | null | undefined) =>
  useCatalog((s) => (id ? s.byId.get(id) : undefined));
