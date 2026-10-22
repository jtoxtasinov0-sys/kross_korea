// window.Telegram.WebApp ga xavfsiz murojaat (Telegramsiz brauzerda ham yiqilmaydi)

export const tg = (): TelegramWebApp | undefined =>
  typeof window === 'undefined' ? undefined : window.Telegram?.WebApp;

/** Telegram ichida ochilganmi — initData bo'lsa ha */
export const isTelegram = () => !!tg()?.initData;

export const getInitData = () => tg()?.initData || '';

const supports = (version: string) => !!tg()?.isVersionAtLeast?.(version);

export const haptic = {
  tap: () => supports('6.1') && tg()?.HapticFeedback.impactOccurred('light'),
  select: () => supports('6.1') && tg()?.HapticFeedback.selectionChanged(),
  success: () => supports('6.1') && tg()?.HapticFeedback.notificationOccurred('success'),
  error: () => supports('6.1') && tg()?.HapticFeedback.notificationOccurred('error'),
};

export function openLink(url: string) {
  const app = tg();
  if (app?.initData) {
    if (url.startsWith('https://t.me/')) return app.openTelegramLink(url);
    if (url.startsWith('http')) return app.openLink(url);
  }
  if (url.startsWith('tel:')) {
    window.location.href = url;
    return;
  }
  window.open(url, '_blank', 'noopener');
}

/** Ilova ranglarini Telegram sarlavha va fon rangiga moslash */
export function paintTelegram(header: string, background: string) {
  const app = tg();
  if (!app) return;
  try {
    if (supports('6.1')) {
      app.setHeaderColor(header);
      app.setBackgroundColor(background);
    }
    if (supports('7.10')) app.setBottomBarColor?.(background);
  } catch {
    // eski Telegram versiyalari — e'tiborsiz
  }
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Telegram WebView'da clipboard API ishlamasa — eski usul
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  }
}
