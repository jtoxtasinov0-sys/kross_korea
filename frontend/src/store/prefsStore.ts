// Foydalanuvchi tanlovlari — telefonda saqlanadi: til, bo'lim (O'zbekiston/Koreya), xush kelibsiz kartasi
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE } from '@/lib/constants';
import type { Lang, Region } from '@/types';

interface PrefsState {
  lang: Lang;
  langChosen: boolean;
  region: Region | null;
  welcomeDismissed: boolean;
  setLang: (lang: Lang, chosen?: boolean) => void;
  setRegion: (region: Region) => void;
  dismissWelcome: () => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      lang: 'uz',
      langChosen: false,
      region: null,
      welcomeDismissed: false,
      setLang: (lang, chosen = true) => set((s) => ({ lang, langChosen: s.langChosen || chosen })),
      setRegion: (region) => set({ region }),
      dismissWelcome: () => set({ welcomeDismissed: true }),
    }),
    { name: STORAGE.prefs, storage: createJSONStorage(() => localStorage) },
  ),
);

/** Bo'lim tanlanmagan bo'lsa ham hisob-kitob uchun xavfsiz qiymat */
export const useRegion = (): Region => usePrefs((s) => s.region) ?? 'uz';
