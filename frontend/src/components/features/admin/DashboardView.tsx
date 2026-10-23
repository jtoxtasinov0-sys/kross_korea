'use client';

// Boshqaruv: ogohlantirishlar, buyurtmalar, tushum ($ va ₩ alohida), mijozlar, top-5, tugayotgan zaxira
import { useCallback, useEffect, useState } from 'react';
import type { Stats } from '@/types/admin';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { Flag } from '@/components/ui/Flag';
import { adminApi } from '@/lib/adminApi';
import { formatMoney } from '@/lib/utils';
import { useAdmin } from '@/store/adminStore';
import { errorText } from './common';

export function DashboardView() {
  const go = useAdmin((s) => s.go);
  const name = useAdmin((s) => s.name);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setStats(await adminApi.stats());
      setError('');
    } catch (err) {
      setError(errorText(err));
    }
  }, []);

  // Statistika kelmasa — avtomatik qayta urinish; kelsa har 30 soniyada yangilanadi
  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const o = stats?.orders;

  return (
    <>
      <div className="ahead">
        <div>
          <h1 className="ahead__title">Boshqaruv</h1>
          <p className="ahead__sub">Salom, {name || 'Admin'} 👋</p>
        </div>
        <button type="button" className="btn btn--soft btn--sm" onClick={load}>
          <Icon name="refresh" size={16} /> Yangilash
        </button>
      </div>

      {error && (
        <p className="alert alert--hot">
          <Icon name="info" size={18} /> {error}
        </p>
      )}
      {stats && (stats.testCards.uz || stats.testCards.kr) && (
        <p className="alert alert--warn">
          <Icon name="card" size={18} />
          Karta rekvizitlari hali test qiymatda ({[stats.testCards.uz && "O'zbekiston", stats.testCards.kr && 'Koreya'].filter(Boolean).join(', ')}).
          Mijozlar noto‘g‘ri kartaga pul o‘tkazmasin!
          <button type="button" className="link-btn" onClick={() => go('settings')}>
            Sozlash
          </button>
        </p>
      )}
      {stats && !stats.isOpen && (
        <p className="alert alert--hot">
          <Icon name="ban" size={18} /> Do‘kon yopiq — mijozlar buyurtma bera olmaydi.
          <button type="button" className="link-btn" onClick={() => go('settings')}>
            Ochish
          </button>
        </p>
      )}

      <div className="tiles">
        <button type="button" className="tile tile--accent" onClick={() => go('orders', 'PENDING')}>
          <Icon name="clock" size={20} className="tile__icon" />
          <b>{o?.pending ?? '—'}</b>
          <span>Kutilayotgan buyurtmalar</span>
        </button>
        <button type="button" className="tile tile--dark" onClick={() => go('orders', 'RECEIPT_SENT')}>
          <Icon name="receipt" size={20} className="tile__icon" />
          <b>{o?.receipts ?? '—'}</b>
          <span>Chek keldi — tekshiring</span>
        </button>
        <div className="tile">
          <b>{o?.today ?? '—'}</b>
          <span>Bugungi buyurtmalar</span>
        </div>
        <div className="tile">
          <b>{o?.total ?? '—'}</b>
          <span>Jami buyurtmalar</span>
        </div>
      </div>

      <div className="cols">
        <section className="panel">
          <h2 className="panel__title">
            <Icon name="card" size={18} /> Tushum (to‘langan buyurtmalar)
          </h2>
          {(['uz', 'kr'] as const).map((r) => (
            <div key={r} className="list-row">
              <Flag region={r} size={24} />
              <div className="list-row__main">
                {r === 'uz' ? "O'zbekiston" : 'Koreya'}
                <div className="list-row__sub">Bugun: {o ? formatMoney(o.revenueToday[r], r) : '—'}</div>
              </div>
              <span className="list-row__end">{o ? formatMoney(o.revenue[r], r) : '—'}</span>
            </div>
          ))}
          <div className="list-row">
            <Icon name="user" size={22} />
            <div className="list-row__main">
              Mijozlar
              <div className="list-row__sub">Telegram orqali: {stats?.customers.telegram ?? '—'}</div>
            </div>
            <span className="list-row__end">{stats?.customers.total ?? '—'}</span>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">
            <Icon name="fire" size={18} /> Eng ko‘p sotilgan
          </h2>
          {stats?.top.length ? (
            stats.top.map((p, i) => (
              <div key={p.productId} className="list-row">
                <span className="thumb">
                  <Img src={p.image} width={240} />
                </span>
                <div className="list-row__main">
                  {i + 1}. {p.brand} {p.name}
                </div>
                <span className="list-row__end">{p.qty} ta</span>
              </div>
            ))
          ) : (
            <p className="empty-line">Hali sotuv yo‘q</p>
          )}
        </section>
      </div>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2 className="panel__title">
          <Icon name="layers" size={18} /> Tugayotgan zaxira
        </h2>
        <p className="panel__hint">
          {stats ? `${stats.lowStockThreshold} tadan kam qolgan o‘lchamlar` : ''}
        </p>
        {stats?.lowStock.length ? (
          <>
            {stats.lowStock.map((v) => (
              <div key={v.variantId} className="list-row">
                <span className="thumb">
                  <Img src={v.image} width={240} />
                </span>
                <div className="list-row__main">
                  {v.brand} {v.name}
                  <div className="list-row__sub">O‘lcham: {v.label} mm</div>
                </div>
                <span className={v.stock === 0 ? 'pill pill--hot' : 'pill pill--warn'}>
                  {v.stock === 0 ? 'Tugagan' : `${v.stock} ta`}
                </span>
              </div>
            ))}
            <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 12 }} onClick={() => go('stock')}>
              Omborga o‘tish <Icon name="arrowRight" size={16} />
            </button>
          </>
        ) : (
          <p className="empty-line">Hamma o‘lchamlar yetarli ✓</p>
        )}
      </section>
    </>
  );
}
