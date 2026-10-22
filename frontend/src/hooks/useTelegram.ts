'use client';

// window.Telegram.WebApp obyekti uchun hook: foydalanuvchi, haptic, havolalar
import { useTelegramContext } from '@/providers/TelegramProvider';
import { haptic, openLink, tg } from '@/lib/telegram';

export function useTelegram() {
  const ctx = useTelegramContext();
  return { ...ctx, webApp: tg(), haptic, openLink };
}
