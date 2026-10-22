'use client';

// Mahsulot kartasi: 1:1 rasm, narx rasm ustida teg, chegirma/NEW belgilari, sevimli va tezkor "+"
import { memo } from 'react';
import type { Product } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { useRegion, usePrefs } from '@/store/prefsStore';
import { useFavStore, useIsFav } from '@/store/favStore';
import { useUi } from '@/store/uiStore';
import { useCatalog } from '@/store/catalogStore';
import { useAddToCart } from '@/hooks/useAddToCart';
import { pick, useT } from '@/lib/i18n';
import { colorDots } from '@/lib/colors';
import { haptic } from '@/lib/telegram';
import { LOW_STOCK } from '@/lib/constants';
import { cx, discountOf, formatMoney, oldPriceOf, priceOf } from '@/lib/utils';

interface Props {
  product: Product;
  eager?: boolean;
}

function ProductCardBase({ product, eager }: Props) {
  const region = useRegion();
  const lang = usePrefs((s) => s.lang);
  const t = useT();
  const fav = useIsFav(product.id);
  const toggleFav = useFavStore((s) => s.toggle);
  const openProduct = useUi((s) => s.openProduct);
  const lowStock = useCatalog((s) => s.catalog?.settings.lowStock ?? LOW_STOCK);
  const addToCart = useAddToCart();

  const name = pick(product, 'name', lang);
  const price = priceOf(product, region);
  const old = oldPriceOf(product, region);
  const off = discountOf(product, region);
  const left = product.variants.reduce((n, v) => n + v.stock, 0);
  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const dots = colorDots(product.colorUz);
  const open = () => openProduct(product.id);

  // Bitta o'lcham qolgan bo'lsa — darhol savatga, aks holda o'lcham tanlash oynasi
  const quickAdd = () => {
    haptic.tap();
    if (inStockVariants.length === 1) addToCart(product, inStockVariants[0]);
    else open();
  };

  return (
    <article className={cx('pcard', !product.inStock && 'pcard--out')}>
      <div className="pcard__mediawrap">
        <button type="button" className="pcard__media" onClick={open} aria-label={`${product.brand} ${name}`}>
          <Img src={product.images} width={480} alt="" eager={eager} />
          <span className="pcard__badges">
            {off > 0 && <span className="badge-off">−{off}%</span>}
            {product.isNew && <span className="sticker">NEW</span>}
            {!product.inStock && <span className="badge-out">{t('card.soldOut')}</span>}
          </span>
          <span className="price-tag">{formatMoney(price, region)}</span>
        </button>
        <button
          type="button"
          className={cx('pcard__fav', fav && 'pcard__fav--on')}
          aria-label={t('fav.title')}
          aria-pressed={fav}
          onClick={() => {
            haptic.select();
            toggleFav(product.id);
          }}
        >
          <Icon name="heart" size={18} filled={fav} />
        </button>
        {product.inStock && (
          <button type="button" className="pcard__plus" aria-label={t('product.add')} onClick={quickAdd}>
            <Icon name="plus" size={18} strokeWidth={2.8} />
          </button>
        )}
      </div>
      <button type="button" className="pcard__body" onClick={open} tabIndex={-1}>
        <span className="pcard__brand">{product.brand}</span>
        <span className="pcard__name">{name}</span>
        <span className="pcard__meta">
          <span className="color-dots" aria-hidden="true">
            {dots.map((c, i) => (
              <i key={`${c}${i}`} style={{ background: c }} />
            ))}
          </span>
          {product.inStock && left < lowStock ? (
            <span className="low">{t('stock.left', { n: left })}</span>
          ) : old ? (
            <span className="old">{formatMoney(old, region)}</span>
          ) : null}
        </span>
      </button>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);

export function ProductCardSkeleton() {
  return (
    <div className="pcard pcard--skel" aria-hidden="true">
      <div className="pcard__media skel" />
      <div className="pcard__body">
        <span className="skel skel-line" style={{ width: '40%' }} />
        <span className="skel skel-line" style={{ width: '85%' }} />
        <span className="skel skel-line" style={{ width: '55%' }} />
      </div>
    </div>
  );
}
