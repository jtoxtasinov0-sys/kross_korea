'use client';

// Mahsulotlar ro'yxati: qidiruv, kategoriya va holat filtri, yaratish / tahrirlash
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminCategory, AdminProduct } from '@/types/admin';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { Empty } from '@/components/ui/Empty';
import { adminApi } from '@/lib/adminApi';
import { cx, formatMoney } from '@/lib/utils';
import { useAdmin } from '@/store/adminStore';
import { ProductEditor } from './ProductEditor';
import { errorText } from './common';

type Filter = 'all' | 'active' | 'off' | 'out';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Hammasi' },
  { key: 'active', label: 'Faol' },
  { key: 'off', label: 'Nofaol' },
  { key: 'out', label: 'Tugagan' },
];

const norm = (s: string | null) => (s || '').toLowerCase().replace(/[‘’'`]/g, '');

export function ProductsAdmin() {
  const notify = useAdmin((s) => s.notify);
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<AdminProduct | 'new' | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.products();
      setProducts(res.products);
      setCategories(res.categories);
    } catch (err) {
      notify(errorText(err), 'error');
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const brands = useMemo(() => [...new Set((products ?? []).map((p) => p.brand))].sort(), [products]);

  const visible = useMemo(() => {
    const needle = norm(q.trim());
    return (products ?? []).filter((p) => {
      if (categoryId && p.categoryId !== categoryId) return false;
      if (filter === 'active' && !p.isActive) return false;
      if (filter === 'off' && p.isActive) return false;
      if (filter === 'out' && p.totalStock > 0) return false;
      return !needle || norm(`${p.brand} ${p.nameUz} ${p.nameRu} ${p.colorUz} ${p.id}`).includes(needle);
    });
  }, [products, q, categoryId, filter]);

  return (
    <>
      <div className="ahead">
        <div>
          <h1 className="ahead__title">Mahsulotlar</h1>
          <p className="ahead__sub">{products ? `${visible.length} / ${products.length} ta` : '…'}</p>
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => setEditing('new')} disabled={!categories.length}>
          <Icon name="plus" size={18} /> Yangi mahsulot
        </button>
      </div>

      <div className="atool">
        <label className="search__box">
          <Icon name="search" size={18} />
          <input type="search" placeholder="Nomi, brend, rang yoki ID" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} aria-label="Kategoriya">
          <option value={0}>Barcha kategoriyalar</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.nameUz} ({c.count})
            </option>
          ))}
        </select>
      </div>
      <div className="chips" style={{ padding: '0 0 12px' }}>
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className={cx('chip', filter === f.key && 'chip--on')} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {products === null ? (
        <div className="plist">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="prow skel" style={{ height: 76 }} />
          ))}
        </div>
      ) : visible.length ? (
        <div className="plist">
          {visible.map((p) => (
            <button key={p.id} type="button" className={cx('prow', !p.isActive && 'prow--off')} onClick={() => setEditing(p)}>
              <span className="thumb thumb--lg">
                <Img src={p.images} width={240} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="prow__name" style={{ display: 'block' }}>
                  {p.brand} {p.nameUz}
                </span>
                <span className="prow__sub">
                  #{p.id}
                  {p.colorUz ? ` · ${p.colorUz}` : ''}
                </span>
                <span className="prow__prices">
                  <span>{formatMoney(p.priceUsd, 'uz')}</span>
                  <span className="muted">·</span>
                  <span>{formatMoney(p.priceKrw, 'kr')}</span>
                </span>
              </span>
              <span className="prow__end">
                <span className={cx('pill', p.totalStock === 0 && 'pill--hot', p.totalStock > 0 && p.totalStock < 5 && 'pill--warn')}>
                  {p.totalStock} ta
                </span>
                {!p.isActive && <span className="pill">Nofaol</span>}
                {p.isNew && <span className="pill pill--sun">NEW</span>}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <Empty emoji="🔍" title="Hech narsa topilmadi" />
      )}

      {editing && (
        <ProductEditor
          product={editing === 'new' ? null : editing}
          categories={categories}
          brands={brands}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setProducts((list) => {
              if (!list) return list;
              const exists = list.some((p) => p.id === saved.id);
              return exists ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list];
            });
            setEditing(null);
          }}
          onDeleted={(id) => {
            setProducts((list) => list?.filter((p) => p.id !== id) ?? null);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
