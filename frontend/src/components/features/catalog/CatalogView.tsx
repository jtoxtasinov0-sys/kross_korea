'use client';

// Katalog: qidiruv (350 ms), saralash, kategoriya tasmasi, brend filtrlari, bo'lak-bo'lak ro'yxat
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Product, Region } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { Empty } from '@/components/ui/Empty';
import { Sheet } from '@/components/ui/Sheet';
import { ProductGrid } from '@/components/features/product/ProductGrid';
import { pick, useT, type Key } from '@/lib/i18n';
import { cx, priceOf } from '@/lib/utils';
import { haptic } from '@/lib/telegram';
import { useDebounce } from '@/hooks/useDebounce';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs, useRegion } from '@/store/prefsStore';
import { useUi, type Sort } from '@/store/uiStore';

const SORTS: { key: Sort; label: Key }[] = [
  { key: 'default', label: 'sort.default' },
  { key: 'new', label: 'sort.new' },
  { key: 'cheap', label: 'sort.cheap' },
  { key: 'expensive', label: 'sort.expensive' },
];

const norm = (s: string | null | undefined) => (s || '').toLowerCase().replace(/[‘’'`ʻʼ]/g, '');

function sortProducts(list: Product[], sort: Sort, region: Region) {
  const sorted = [...list];
  if (sort === 'new') sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.sortOrder - b.sortOrder);
  if (sort === 'cheap') sorted.sort((a, b) => priceOf(a, region) - priceOf(b, region));
  if (sort === 'expensive') sorted.sort((a, b) => priceOf(b, region) - priceOf(a, region));
  // Tugaganlar har doim pastda
  return sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock));
}

export function CatalogView() {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const region = useRegion();
  const products = useCatalog((s) => s.catalog?.products ?? []);
  const categories = useCatalog((s) => s.catalog?.categories ?? []);
  const categoryId = useUi((s) => s.categoryId);
  const brand = useUi((s) => s.brand);
  const sort = useUi((s) => s.sort);
  const query = useUi((s) => s.query);
  const focusSearch = useUi((s) => s.focusSearch);
  const setCategory = useUi((s) => s.setCategory);
  const setBrand = useUi((s) => s.setBrand);
  const setSort = useUi((s) => s.setSort);
  const setQuery = useUi((s) => s.setQuery);
  const consumeFocus = useUi((s) => s.consumeFocus);

  const [text, setText] = useState(query);
  const debounced = useDebounce(text, 350);
  const [sortOpen, setSortOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipRefs = useRef(new Map<number | 'all', HTMLButtonElement>());

  useEffect(() => {
    setQuery(debounced.trim());
  }, [debounced, setQuery]);

  // Bosh sahifadagi qidiruv bosilgan bo'lsa — darhol fokus
  useEffect(() => {
    if (focusSearch) {
      inputRef.current?.focus();
      consumeFocus();
    }
  }, [focusSearch, consumeFocus]);

  // Tanlangan kategoriya ko'rinmasa tasma o'sha tomonga suriladi
  useEffect(() => {
    chipRefs.current.get(categoryId ?? 'all')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [categoryId]);

  const inCategory = useMemo(
    () => products.filter((p) => !categoryId || p.categoryId === categoryId),
    [products, categoryId],
  );
  const brands = useMemo(() => [...new Set(inCategory.map((p) => p.brand))].sort(), [inCategory]);

  const filtered = useMemo(() => {
    const q = norm(query);
    const list = inCategory.filter((p) => {
      if (brand && p.brand !== brand) return false;
      if (!q) return true;
      return norm(`${p.brand} ${p.nameUz} ${p.nameRu} ${p.colorUz} ${p.colorRu}`).includes(q);
    });
    return sortProducts(list, sort, region);
  }, [inCategory, brand, query, sort, region]);

  const category = categories.find((c) => c.id === categoryId);
  const note = category ? pick(category, 'note', lang) : '';
  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? 'sort.default';

  return (
    <>
      <div className="catalog-head">
        <div className="search">
          <label className="search__box">
            <Icon name="search" size={20} />
            <span className="visually-hidden">{t('search.placeholder')}</span>
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder={t('search.placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {text && (
              <button type="button" className="search__clear" aria-label="Tozalash" onClick={() => setText('')}>
                <Icon name="close" size={14} strokeWidth={2.8} />
              </button>
            )}
          </label>
          <button type="button" className="sort-btn" onClick={() => setSortOpen(true)}>
            <Icon name="sort" size={16} /> {t(sortLabel)}
          </button>
        </div>

        <div className="chips">
          <button
            type="button"
            ref={(el) => {
              if (el) chipRefs.current.set('all', el);
            }}
            className={cx('chip', !categoryId && 'chip--on')}
            onClick={() => setCategory(null)}
          >
            {t('catalog.all')} <span className="chip__count">{products.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              ref={(el) => {
                if (el) chipRefs.current.set(c.id, el);
              }}
              className={cx('chip', categoryId === c.id && 'chip--on')}
              onClick={() => {
                haptic.select();
                setCategory(c.id);
              }}
            >
              {c.emoji} {pick(c, 'name', lang)} <span className="chip__count">{c.count}</span>
            </button>
          ))}
        </div>

        {brands.length > 1 && (
          <div className="chips chips--sub">
            <button type="button" className={cx('chip', !brand && 'chip--on')} onClick={() => setBrand(null)}>
              {t('catalog.allBrands')}
            </button>
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                className={cx('chip', brand === b && 'chip--on')}
                onClick={() => setBrand(brand === b ? null : b)}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {note && <p className="cat-note">{note}</p>}

      <div className="results">
        <span>{t('catalog.count', { n: filtered.length })}</span>
      </div>

      {filtered.length ? (
        <ProductGrid products={filtered} />
      ) : (
        <Empty emoji="🔍" title={t('catalog.empty')} hint={t('catalog.emptyHint')} />
      )}

      {sortOpen && (
        <Sheet onClose={() => setSortOpen(false)} label={t('sort.default')}>
          <div className="option-list">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={cx('option', sort === s.key && 'option--on')}
                onClick={() => {
                  haptic.select();
                  setSort(s.key);
                  setSortOpen(false);
                }}
              >
                {t(s.label)}
                {sort === s.key && <Icon name="check" size={20} strokeWidth={2.6} />}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}
