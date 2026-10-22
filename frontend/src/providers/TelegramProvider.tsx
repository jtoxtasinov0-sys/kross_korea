'use client';

// Mini App yuklanganini tekshiruvchi provayder: Telegram'ni sozlaydi va foydalanuvchini beradi
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { tg, paintTelegram } from '@/lib/telegram';

interface TelegramContextValue {
  ready: boolean;
  isTelegram: boolean;
  user: TelegramWebAppUser | null;
  startParam: string;
  platform: string;
}

const TelegramContext = createContext<TelegramContextValue>({
  ready: false,
  isTelegram: false,
  user: null,
  startParam: '',
  platform: 'web',
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<TelegramContextValue>({
    ready: false,
    isTelegram: false,
    user: null,
    startParam: '',
    platform: 'web',
  });

  useEffect(() => {
    const app = tg();
    if (app?.initData) {
      app.ready();
      app.expand();
      if (app.isVersionAtLeast('7.7')) app.disableVerticalSwipes?.();
      paintTelegram('#F1F2F6', '#F1F2F6');
    }
    setValue({
      ready: true,
      isTelegram: !!app?.initData,
      user: app?.initDataUnsafe?.user ?? null,
      startParam: app?.initDataUnsafe?.start_param ?? '',
      platform: app?.platform ?? 'web',
    });
  }, []);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export const useTelegramContext = () => useContext(TelegramContext);
