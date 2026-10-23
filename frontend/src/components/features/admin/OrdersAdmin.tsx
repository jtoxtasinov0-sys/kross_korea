'use client';

// Buyurtmalar: holat filtri (soni bilan), bo'lim, qidiruv; har 20 soniyada yangilanadi
import { useCallback, useEffect, useState } from 'react';
import type { OrderStatus } from '@/types';
import type { AdminOrder } from '@/types/admin';
import { Icon } from '@/components/ui/Icon';
import { Flag } from '@/components/ui/Flag';
import { Empty } from '@/components/ui/Empty';
import { adminApi } from '@/lib/adminApi';
import { cx, formatDate, formatMoney } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdmin } from '@/store/adminStore';
import { OrderDetail } from './OrderDetail';
import { STATUS_LABEL, StatusBadge, errorText } from './common';

const FILTERS: { key: string; label: string }[] = [
  { key: '', label: 'Hammasi' },
  { key: 'PENDING', label: 'Kutilmoqda' },
  { key: 'RECEIPT_SENT', label: STATUS_LABEL.RECEIPT_SENT },
  { key: 'CONFIRMED', label: STATUS_LABEL.CONFIRMED },
  { key: 'SHIPPED', label: STATUS_LABEL.SHIPPED },
  { key: 'DELIVERED', label: STATUS_LABEL.DELIVERED },
  { key: 'CANCELLED', label: STATUS_LABEL.CANCELLED },
];

export function OrdersAdmin() {
  const initialFilter = useAdmin((s) => s.ordersFilter);
  const notify = useAdmin((s) => s.notify);
  const [status, setStatus] = useState(initialFilter);
  const [region, setRegion] = useState('');
  const [text, setText] = useState('');
  const q = useDebounce(text.trim(), 350);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [counts, setCounts] = useState<Partial<Record<OrderStatus, number>>>({});
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        const res = await adminApi.orders({ status, region, q });
        setOrders(res.orders);
        setCounts(res.counts);
        useAdmin.getState().setPending((res.counts.PENDING_PAYMENT ?? 0) + (res.counts.RECEIPT_SENT ?? 0));
      } catch (err) {
        if (!silent) notify(errorText(err), 'error');
      }
    },
    [status, region, q, notify],
  );

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 20_000);
    return () => clearInterval(id);
  }, [load]);

  const countOf = (key: string) => {
    if (!key) return Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
    if (key === 'PENDING') return (counts.PENDING_PAYMENT ?? 0) + (counts.RECEIPT_SENT ?? 0);
    return counts[key as OrderStatus] ?? 0;
  };

  return (
    <>
      <div className="ahead">
        <h1 className="ahead__title">Buyurtmalar</h1>
        <span className="seg">
          {[
            ['', 'Hammasi'],
            ['uz', '$'],
            ['kr', '₩'],
          ].map(([key, label]) => (
            <button key={key} type="button" className={cx(region === key && 'on')} onClick={() => setRegion(key)}>
              {key ? <Flag region={key as 'uz' | 'kr'} size={16} /> : null} {label}
            </button>
          ))}
        </span>
      </div>

      <div className="atool">
        <label className="search__box">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Raqam, ism, telefon yoki @username"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
      </div>

      <div className="chips" style={{ padding: '0 0 12px' }}>
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className={cx('chip', status === f.key && 'chip--on')} onClick={() => setStatus(f.key)}>
            {f.label} <span className="chip__count">{countOf(f.key)}</span>
          </button>
        ))}
      </div>

      {orders === null ? (
        <div className="olist">
          {[0, 1, 2].map((i) => (
            <div key={i} className="orow skel" style={{ height: 68 }} />
          ))}
        </div>
      ) : orders.length ? (
        <div className="olist">
          {orders.map((o) => (
            <button
              key={o.id}
              type="button"
              className={cx('orow', o.status === 'RECEIPT_SENT' && 'orow--receipt')}
              onClick={() => setOpenId(o.id)}
            >
              <span className="orow__no">
                <Flag region={o.region} size={16} /> {o.orderNumber}
                {o.receiptUrl && o.status === 'RECEIPT_SENT' && <Icon name="receipt" size={15} />}
              </span>
              <span className="orow__total">{formatMoney(o.total, o.region)}</span>
              <span className="orow__who">
                {o.customerName} · {o.phone} · {formatDate(o.createdAt)}
              </span>
              <span className="orow__meta">
                <StatusBadge status={o.status} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <Empty emoji="📦" title="Bu filtr bo‘yicha buyurtma yo‘q" />
      )}

      {openId && (
        <OrderDetail
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={(updated) => {
            setOrders((list) => list?.map((o) => (o.id === updated.id ? updated : o)) ?? null);
            load(true);
          }}
        />
      )}
    </>
  );
}
