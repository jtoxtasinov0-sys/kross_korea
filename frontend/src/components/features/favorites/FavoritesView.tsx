'use client';

// Sevimlilar — telefonda saqlangan yurakchali juftliklar
import { useMemo } from 'react';
import type { Product } from '@/types';
import { Empty } from '@/components/ui/Empty';
import { ProductGrid } from '@/components/features/product/ProductGrid';
import { useT } from '@/lib/i18n';
import { useCatalog } from '@/store/catalogStore';
import { useFavStore } from '@/store/favStore';
import { useUi } from '@/store/uiStore';

export function FavoritesView() {
  const t = useT();
  const ids = useFavStore((s) => s.ids);
  const byId = useCatalog((s) => s.byId);
  const openCatalog = useUi((s) => s.openCatalog);
  const products = useMemo(() => ids.map((id) => byId.get(id)).filter((p): p is Product => !!p), [ids, byId]);

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t('fav.title')}</h1>
        {products.length > 0 && <span className="page-count">{products.length}</span>}
      </div>
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <Empty
          emoji="💛"
          title={t('fav.empty')}
          action={
            <button type="button" className="btn btn--primary" onClick={() => openCatalog({ categoryId: null })}>
              {t('fav.go')}
            </button>
          }
        />
      )}
    </>
  );
}
