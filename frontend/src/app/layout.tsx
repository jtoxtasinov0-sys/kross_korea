// Asosiy karkas: shrift (Manrope), Telegram SDK, stillar
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Manrope } from 'next/font/google';
import { TelegramProvider } from '@/providers/TelegramProvider';
import '@/styles/globals.css';
import '@/styles/features.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KROSS KOREA',
  description: "Koreyadan original krossovkalar — O'zbekiston va Koreya bo'ylab yetkazib berish",
  applicationName: 'KROSS KOREA',
  icons: {
    icon: [
      { url: '/images/icon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/images/icon-180.png',
  },
  appleWebApp: { capable: true, title: 'KROSS KOREA', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#eef0fb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Telegram SDK yuklanishi bilan <html> ga o'z CSS o'zgaruvchilarini yozadi — bu farq kutilgan
    <html lang="uz" className={manrope.variable} suppressHydrationWarning>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}
