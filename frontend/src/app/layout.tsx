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

// Havola ko'rinishi (og:image) to'liq manzil talab qiladi: Vercel'da loyiha domeni avtomatik olinadi
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

const TITLE = 'KROSS KOREA — Koreyadan original krossovkalar';
const DESCRIPTION =
  "Nike, Adidas, New Balance, Puma — Koreyaning rasmiy do'konlaridan 100% original. O'zbekiston va Koreya bo'ylab yetkazib berish.";
const OG_IMAGE = { url: '/images/og.jpg', width: 1200, height: 630, alt: 'KROSS KOREA — Original · Korea' };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'KROSS KOREA',
  description: DESCRIPTION,
  applicationName: 'KROSS KOREA',
  // Havola ulashilganda (Telegram, WhatsApp, Instagram) rasm va ma'lumot chiqadi
  openGraph: {
    type: 'website',
    siteName: 'KROSS KOREA',
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    locale: 'uz_UZ',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
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
