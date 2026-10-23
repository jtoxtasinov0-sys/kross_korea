'use client';

// Ombor: barcha o'lchamlar qoldig'i bitta ro'yxatda, +/− va qo'lda kiritish, o'zgarganlar birdan saqlanadi
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminCategory, StockItem } from '@/types/admin';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { adminApi } from '@/lib/adminApi';
import { cx } from '@/lib/utils';
import { useAdmin } from '@/store/adminStore';
import { Switch, errorText, numOrEmpty } from './common';

type Filter = 'all' | 'low' | 'out';
const norm = (s: string | null) => (s || '').toLowerCase().replace(/[‘’'`]/g, '');

export function StockAdmin() {
  const notify = useAdmin((s) => s.notify);
  const [items, setItems] = useState<StockItem[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [visible, setVisible] = useState(false);
  const [visibleDraft, setVisibleDraft] = useState(false);
  const [low, setLow] = useState(3);
  const [edits, setEdits] = useState<Map<number, number | ''>>(new Map());
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.stock();
      setItems(res.items);
      setCategories(res.categories);
      setVisible(res.stockVisible);
      setVisibleDraft(res.stockVisible);
      setLow(res.lowStock);
      setEdits(new Map());
    } catch (err) {
      notify(errorText(err), 'error');
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const valueOf = (it: StockItem) => (edits.has(it.variantId) ? edits.get(it.variantId)! : it.stock);
  const setValue = (it: StockItem, v: number | '') =>
    setEdits((m) => {
      const next = new Map(m);
      if (v === it.stock) next.delete(it.variantId);
      else next.set(it.variantId, v);
      return next;
    });

  const groups = useMemo(() => {
    const needle = norm(q.trim());
    const map = new Map<number, StockItem[]>();
    for (const it of items ?? []) {
      if (categoryId && it.categoryId !== categoryId) continue;
      if (needle && !norm(`${it.brand} ${it.name} ${it.color} ${it.productId}`).includes(needle)) continue;
      if (!map.has(it.productId)) map.set(it.productId, []);
      map.get(it.productId)!.push(it);
    }
    return [...map.values()].filter((g) =>
      filter === 'all' ? true : g.some((it) => (filter === 'out' ? it.stock === 0 : it.stock < low)),
    );
  }, [items, q, categoryId, filter, low]);

  const changes = [...edits.entries()].filter(([, v]) => v !== '').map(([variantId, stock]) => ({ variantId, stock: Number(stock) }));
  const dirty = changes.length > 0 || visibleDraft !== visible;

  const save = async () => {
    setSaving(true);
    try {
      const res = await adminApi.saveStock(changes, visibleDraft !== visible ? visibleDraft : undefined);
      notify(`${res.updated} ta o‘zgarish saqlandi ✓`);
      await load();
    } catch (err) {
      notify(errorText(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="ahead">
        <h1 className="ahead__title">Ombor</h1>
      </div>
      <Switch
        checked={visibleDraft}
        onChange={setVisibleDraft}
        label="Mijozga qoldiq soni ko‘rinsin"
        hint={`O‘chiq bo‘lsa mijoz faqat “${low} tadan kam qoldi” ogohlantirishini ko‘radi`}
      />
      <div className="atool">
        <label className="search__box">
          <Icon name="search" size={18} />
          <input type="search" placeholder="Nomi, brend yoki ID" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} aria-label="Kategoriya">
          <option value={0}>Barcha kategoriyalar</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.nameUz}
            </option>
          ))}
        </select>
      </div>
      <div className="chips" style={{ padding: '0 0 12px' }}>
        {(
          [
            ['all', 'Hammasi'],
            ['low', 'Kam qolgan'],
            ['out', 'Tugagan'],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button key={key} type="button" className={cx('chip', filter === key && 'chip--on')} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="sgroup skel" style={{ height: 160 }} />
      ) : (
        <div className="sgroups">
          {groups.map((g) => (
            <section key={g[0].productId} className={cx('sgroup', !g[0].isActive && 'sgroup--off')}>
              <div className="sgroup__head">
                <span className="thumb">
                  <Img src={g[0].image} width={240} />
                </span>
                <span className="sgroup__name">
                  {g[0].brand} {g[0].name}
                  <span className="list-row__sub" style={{ display: 'block' }}>
                    #{g[0].productId}
                    {g[0].color ? ` · ${g[0].color}` : ''}
                  </span>
                </span>
              </div>
              <div className="scells">
                {g.map((it) => {
                  const v = valueOf(it);
                  const n = Number(v) || 0;
                  return (
                    <div
                      key={it.variantId}
                      className={cx('scell', n === 0 ? 'scell--out' : n < low && 'scell--low', edits.has(it.variantId) && 'scell--changed')}
                    >
                      <div className="scell__label">{it.label}</div>
                      <div className="scell__ctrl">
                        <button type="button" aria-label="Kamaytirish" onClick={() => setValue(it, Math.max(0, n - 1))}>
                          <Icon name="minus" size={14} strokeWidth={2.8} />
                        </button>
                        <input inputMode="numeric" value={v} onChange={(e) => setValue(it, numOrEmpty(e.target.value))} aria-label={`${it.label} zaxira`} />
                        <button type="button" aria-label="Ko‘paytirish" onClick={() => setValue(it, n + 1)}>
                          <Icon name="plus" size={14} strokeWidth={2.8} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {dirty && (
        <div className="savebar">
          <span>{changes.length} ta o‘zgarish</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn--soft btn--sm" onClick={load} disabled={saving}>
              Bekor
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={save} disabled={saving}>
              {saving ? '…' : 'Saqlash'}
            </button>
          </span>
        </div>
      )}
    </>
  );
}
