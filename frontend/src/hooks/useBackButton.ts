'use client';

// Telegram BackButton: oyna ochiq yoki asosiy bo'lmagan tab tanlangan bo'lsa ko'rinadi.
// Bosilganda: story → ekran → oyna → tab tartibida yopiladi (uiStore.back).
import { useEffect } from 'react';
import { tg } from '@/lib/telegram';
import { useUi } from '@/store/uiStore';

export function useBackButton() {
  const visible = useUi((s) => s.layers.length > 0 || s.tab !== 'home');

  useEffect(() => {
    const app = tg();
    if (!app?.initData || !app.isVersionAtLeast('6.1')) return;
    const onClick = () => useUi.getState().back();
    app.BackButton.onClick(onClick);
    return () => app.BackButton.offClick(onClick);
  }, []);

  useEffect(() => {
    const app = tg();
    if (!app?.initData || !app.isVersionAtLeast('6.1')) return;
    if (visible) app.BackButton.show();
    else app.BackButton.hide();
  }, [visible]);

  // Brauzerda Escape tugmasi ham orqaga qaytaradi
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useUi.getState().back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
