// Asosiy karkas: shriftlar (Unbounded + Inter), Telegram SDK, stillar
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Unbounded } from 'next/font/google';
import { TelegramProvider } from '@/providers/TelegramProvider';
import '@/styles/globals.css';
import '@/styles/features.css';

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700', '800', '900'],
  variable: '--font-unbounded',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
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
  themeColor: '#f1f2f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Telegram SDK yuklanishi bilan <html> ga o'z CSS o'zgaruvchilarini yozadi — bu farq kutilgan
    <html lang="uz" className={`${unbounded.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}
