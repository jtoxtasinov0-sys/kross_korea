// Navigatsiya holati: tablar, ustma-ust oynalar (layers), katalog filtrlari, toast
import { create } from 'zustand';
import type { Tab } from '@/types';

export type Layer =
  | { kind: 'product'; id: number }
  | { kind: 'checkout' }
  | { kind: 'payment'; orderId: number; fresh?: boolean }
  | { kind: 'orders' }
  | { kind: 'story'; index: number }
  | { kind: 'contact' }
  | { kind: 'viewer'; images: string[]; index: number };

export type Sort = 'default' | 'new' | 'cheap' | 'expensive';

interface Toast {
  id: number;
  text: string;
  action?: 'cart';
}

interface UiState {
  tab: Tab;
  layers: Layer[];
  categoryId: number | null;
  brand: string | null;
  sort: Sort;
  query: string;
  focusSearch: boolean; // katalog ochilganda qidiruv maydoniga fokus
  toast: Toast | null;
  cartBump: number; // o'zgarsa savat tugmasi sakraydi

  setTab: (tab: Tab) => void;
  push: (layer: Layer) => void;
  pop: () => void;
  replaceTop: (layer: Layer) => void;
  closeAll: () => void;
  openProduct: (id: number) => void;
  back: () => boolean;

  openCatalog: (opts?: { categoryId?: number | null; sort?: Sort; search?: boolean }) => void;
  setCategory: (id: number | null) => void;
  setBrand: (brand: string | null) => void;
  setSort: (sort: Sort) => void;
  setQuery: (q: string) => void;
  consumeFocus: () => void;

  showToast: (text: string, action?: 'cart') => void;
  hideToast: () => void;
  bumpCart: () => void;
}

export const useUi = create<UiState>()((set, get) => ({
  tab: 'home',
  layers: [],
  categoryId: null,
  brand: null,
  sort: 'default',
  query: '',
  focusSearch: false,
  toast: null,
  cartBump: 0,

  setTab: (tab) => set({ tab, layers: [] }),
  push: (layer) => set((s) => ({ layers: [...s.layers, layer] })),
  pop: () => set((s) => ({ layers: s.layers.slice(0, -1) })),
  replaceTop: (layer) => set((s) => ({ layers: [...s.layers.slice(0, -1), layer] })),
  closeAll: () => set({ layers: [] }),

  // Mahsulot oynasi ustiga yana mahsulot ochilsa — almashtiriladi
  openProduct: (id) => {
    const { layers } = get();
    const top = layers[layers.length - 1];
    if (top?.kind === 'product') get().replaceTop({ kind: 'product', id });
    else get().push({ kind: 'product', id });
  },

  // Telegram BackButton tartibi: eng ustidagi oyna → tab → asosiy
  back: () => {
    const { layers, tab } = get();
    if (layers.length) {
      get().pop();
      return true;
    }
    if (tab !== 'home') {
      set({ tab: 'home' });
      return true;
    }
    return false;
  },

  openCatalog: (opts = {}) =>
    set((s) => ({
      tab: 'catalog',
      layers: [],
      categoryId: opts.categoryId !== undefined ? opts.categoryId : s.categoryId,
      brand: opts.categoryId !== undefined ? null : s.brand,
      sort: opts.sort ?? s.sort,
      focusSearch: !!opts.search,
    })),
  setCategory: (categoryId) => set({ categoryId, brand: null }),
  setBrand: (brand) => set({ brand }),
  setSort: (sort) => set({ sort }),
  setQuery: (query) => set({ query }),
  consumeFocus: () => set({ focusSearch: false }),

  showToast: (text, action) => set({ toast: { id: Date.now(), text, action } }),
  hideToast: () => set({ toast: null }),
  bumpCart: () => set((s) => ({ cartBump: s.cartBump + 1 })),
}));
