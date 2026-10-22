// Sevimlilar — telefonda saqlanadi
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE } from '@/lib/constants';

interface FavState {
  ids: number[];
  toggle: (id: number) => boolean; // qo'shildimi
}

export const useFavStore = create<FavState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [id, ...get().ids] });
        return !has;
      },
    }),
    { name: STORAGE.fav, storage: createJSONStorage(() => localStorage) },
  ),
);

export const useIsFav = (id: number) => useFavStore((s) => s.ids.includes(id));
