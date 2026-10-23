// Admin panel karkasi — o'z stillari bilan, qidiruv tizimlariga yopiq
import type { Metadata } from 'next';
import '@/styles/admin.css';

export const metadata: Metadata = {
  title: 'KROSS KOREA — Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
