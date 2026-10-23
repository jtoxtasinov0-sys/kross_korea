// PWA manifest — "Ilovani o'rnatish" uchun
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KROSS KOREA',
    short_name: 'KROSS',
    description: 'Koreyadan original krossovkalar',
    start_url: '/',
    display: 'standalone',
    background_color: '#eef0fb',
    theme_color: '#6c5ce7',
    icons: [
      { src: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
