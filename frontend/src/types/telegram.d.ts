// Telegram WebApp obyektining ilova ishlatadigan qismi
// https://core.telegram.org/bots/webapps#initializing-mini-apps

interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramBackButton {
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

interface TelegramHaptic {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser; start_param?: string };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  enableClosingConfirmation?(): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  BackButton: TelegramBackButton;
  HapticFeedback: TelegramHaptic;
  onEvent(event: string, cb: () => void): void;
  offEvent(event: string, cb: () => void): void;
}

interface Window {
  Telegram?: { WebApp: TelegramWebApp };
}
