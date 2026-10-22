// Savatdagi ma'lumotlarni saqlash (zustand persist). Faqat ID va soni — narx katalogdan olinadi.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MAX_QTY, STORAGE } from '@/lib/constants';

export interface CartItem {
  productId: number;
  variantId: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (productId: number, variantId: number, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  replace: (items: CartItem[]) => void;
  clear: () => void;
}

const clampQty = (n: number) => Math.min(Math.max(Math.round(n), 1), MAX_QTY);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, variantId, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === variantId);
          if (existing) {
            return {
              items: s.items.map((i) => (i.variantId === variantId ? { ...i, qty: clampQty(i.qty + qty) } : i)),
            };
          }
          return { items: [...s.items, { productId, variantId, qty: clampQty(qty) }] };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({ items: s.items.map((i) => (i.variantId === variantId ? { ...i, qty: clampQty(qty) } : i)) })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      replace: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    { name: STORAGE.cart, storage: createJSONStorage(() => localStorage) },
  ),
);
