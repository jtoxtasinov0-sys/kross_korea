// Admin panel karkasi — o'z stillari bilan, qidiruv tizimlariga yopiq
import type { Metadata } from 'next';
import '@/styles/admin.css';

export const metadata: Metadata = {
  title: 'KROSS KOREA — Admin',
  robots: { index: false, follow: false },
  // Havola ulashilganda: brend rasmi + "Admin panel"
  openGraph: {
    type: 'website',
    siteName: 'KROSS KOREA',
    title: 'KROSS KOREA — Admin panel',
    description: "Buyurtmalar, mahsulotlar, ombor va sozlamalarni boshqarish",
    url: '/admin',
    images: [{ url: '/images/og.jpg?v=2', width: 1200, height: 630, alt: 'KROSS KOREA' }],
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
