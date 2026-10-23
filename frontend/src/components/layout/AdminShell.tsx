'use client';

// Admin panel karkasi: kirish (parol / Telegram), chap sidebar (kompyuter), pastki menyu (telefon), bo'limlar
import { useEffect, useState } from 'react';
import type { AdminSection } from '@/types/admin';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Splash } from './Splash';
import { AdminToast } from '@/components/features/admin/common';
import { LoginView } from '@/components/features/admin/LoginView';
import { DashboardView } from '@/components/features/admin/DashboardView';
import { OrdersAdmin } from '@/components/features/admin/OrdersAdmin';
import { ProductsAdmin } from '@/components/features/admin/ProductsAdmin';
import { StockAdmin } from '@/components/features/admin/StockAdmin';
import { SettingsAdmin } from '@/components/features/admin/SettingsAdmin';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { cx, scrollToTop } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';
import { useAdmin } from '@/store/adminStore';

const NAV: { section: AdminSection; icon: IconName; label: string }[] = [
  { section: 'dashboard', icon: 'home', label: 'Boshqaruv' },
  { section: 'orders', icon: 'box', label: 'Buyurtmalar' },
  { section: 'products', icon: 'bag', label: 'Mahsulotlar' },
  { section: 'stock', icon: 'layers', label: 'Ombor' },
  { section: 'settings', icon: 'settings', label: 'Sozlamalar' },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Shell() {
  const section = useAdmin((s) => s.section);
  const pending = useAdmin((s) => s.pending);
  const go = useAdmin((s) => s.go);
  const logout = useAdmin((s) => s.logout);

  // Kutilayotgan buyurtmalar soni — menyudagi belgi uchun, har 30 soniyada
  useEffect(() => {
    const refresh = () =>
      adminApi
        .stats()
        .then((s) => useAdmin.getState().setPending(s.orders.pending))
        .catch(() => {});
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [section]);

  return (
    <div className="admin">
      <aside className="aside">
        <div className="aside__brand">
          <img className="brand__logo" src="/images/icon-192.png" alt="" width={38} height={38} />
          <span className="brand__name">
            KROSS <span>KOREA</span>
            <br />
            <span className="aside__tag">ADMIN</span>
          </span>
        </div>
        {NAV.map((n) => (
          <button
            key={n.section}
            type="button"
            className={cx('aside__link', section === n.section && 'aside__link--on')}
            onClick={() => go(n.section, n.section === 'orders' ? '' : undefined)}
          >
            <Icon name={n.icon} size={20} />
            {n.label}
            {n.section === 'orders' && pending > 0 && <span className="badge-count">{pending}</span>}
          </button>
        ))}
        <span className="aside__spacer" />
        <a className="aside__link" href="/" target="_blank" rel="noreferrer">
          <Icon name="external" size={20} /> Do‘konni ochish
        </a>
        <button type="button" className="aside__link" onClick={logout}>
          <Icon name="logout" size={20} /> Chiqish
        </button>
      </aside>

      <main className="amain">
        {section === 'dashboard' && <DashboardView />}
        {section === 'orders' && <OrdersAdmin />}
        {section === 'products' && <ProductsAdmin />}
        {section === 'stock' && <StockAdmin />}
        {section === 'settings' && <SettingsAdmin />}
      </main>

      <nav className="anav" aria-label="Admin menyu">
        {NAV.map((n) => (
          <button
            key={n.section}
            type="button"
            className={cx('anav__item', section === n.section && 'anav__item--on')}
            onClick={() => go(n.section, n.section === 'orders' ? '' : undefined)}
          >
            <Icon name={n.icon} size={22} />
            {n.label}
            {n.section === 'orders' && pending > 0 && <span className="badge-count">{pending}</span>}
          </button>
        ))}
      </nav>
      <AdminToast />
    </div>
  );
}

export function AdminApp() {
  const token = useAdmin((s) => s.token);
  const tg = useTelegram();
  const [mounted, setMounted] = useState(false);
  const [tgState, setTgState] = useState<'idle' | 'trying' | 'notAdmin' | 'failed'>('idle');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Telegram ichida token bo'lmasa — parolsiz kirish; server uxlayotgan bo'lsa qayta urinadi
  useEffect(() => {
    if (!tg.ready || !tg.isTelegram || token || tgState !== 'idle') return;
    setTgState('trying');
    (async () => {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          const res = await adminApi.telegram();
          useAdmin.getState().login(res.token, res.name);
          setTgState('idle');
          return;
        } catch (err) {
          if (err instanceof AdminApiError && err.code === 'not_admin') return setTgState('notAdmin');
          if (err instanceof AdminApiError && err.status > 0 && err.status < 500) return setTgState('failed');
          await wait(2500);
        }
      }
      setTgState('failed');
    })();
  }, [tg.ready, tg.isTelegram, token, tgState]);

  if (!mounted) return <Splash />;
  if (!token) return tgState === 'trying' ? <Splash note="Kirilmoqda…" /> : <LoginView notAdmin={tgState === 'notAdmin'} />;
  return <Shell />;
}
