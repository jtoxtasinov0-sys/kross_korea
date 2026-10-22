'use client';

// Mahsulot oynasi: galereya, narx, o'lcham, tavsif va "Savatga"
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types';
import { Sheet } from '@/components/ui/Sheet';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { SizePicker } from './SizePicker';
import { api } from '@/lib/api';
import { pick, useT } from '@/lib/i18n';
import { colorDots } from '@/lib/colors';
import { haptic } from '@/lib/telegram';
import { LOW_STOCK } from '@/lib/constants';
import { cx, discountOf, formatMoney, oldPriceOf, priceOf } from '@/lib/utils';
import { useProduct, useCatalog } from '@/store/catalogStore';
import { usePrefs, useRegion } from '@/store/prefsStore';
import { useFavStore, useIsFav } from '@/store/favStore';
import { useUi } from '@/store/uiStore';
import { useAddToCart } from '@/hooks/useAddToCart';

export function ProductSheet({ id }: { id: number }) {
  const cached = useProduct(id);
  const [fresh, setFresh] = useState<Product | null>(null);
  const product = fresh ?? cached;

  const region = useRegion();
  const lang = usePrefs((s) => s.lang);
  const t = useT();
  const settings = useCatalog((s) => s.catalog?.settings);
  const pop = useUi((s) => s.pop);
  const push = useUi((s) => s.push);
  const fav = useIsFav(id);
  const toggleFav = useFavStore((s) => s.toggle);
  const addToCart = useAddToCart();

  const [variantId, setVariantId] = useState<number | null>(null);
  const [shake, setShake] = useState(0);
  const [slide, setSlide] = useState(0);
  const sizesRef = useRef<HTMLDivElement>(null);

  // Oyna ochilganda zaxirani yangidan olamiz (katalog keshi 1 daqiqagacha eski bo'lishi mumkin)
  useEffect(() => {
    setFresh(null);
    setVariantId(null);
    setSlide(0);
    api
      .product(id)
      .then((r) => setFresh(r.product))
      .catch(() => {});
  }, [id]);

  // Faqat bitta o'lcham qolgan bo'lsa — o'zi tanlansin
  useEffect(() => {
    const available = product?.variants.filter((v) => v.stock > 0) ?? [];
    if (available.length === 1) setVariantId((cur) => cur ?? available[0].id);
  }, [product]);

  if (!product) return null;

  const name = pick(product, 'name', lang);
  const color = pick(product, 'color', lang);
  const desc = pick(product, 'desc', lang).split('\n').filter(Boolean);
  const price = priceOf(product, region);
  const old = oldPriceOf(product, region);
  const off = discountOf(product, region);
  const rules = settings?.regions[region];
  const lowStock = settings?.lowStock ?? LOW_STOCK;
  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const closed = settings && !settings.isOpen;

  const onAdd = () => {
    if (!variant) {
      haptic.error();
      setShake((n) => n + 1);
      sizesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    pop();
    addToCart(product, variant);
  };

  return (
    <Sheet onClose={pop} label={name} floatingGrip showClose>
      <div className="ps__media">
        <div
          className="ps__gallery"
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {product.images.map((src, i) => (
            <button
              key={src}
              type="button"
              className="ps__slide"
              onClick={() => push({ kind: 'viewer', images: product.images, index: i })}
              aria-label={`${name} — ${i + 1}`}
            >
              <Img src={src} width={1080} alt="" eager={i === 0} />
            </button>
          ))}
        </div>
        <span className="pcard__badges">
          {off > 0 && <span className="badge-off">−{off}%</span>}
          {product.isNew && <span className="sticker">NEW</span>}
        </span>
        {product.images.length > 1 && (
          <span className="ps__count">
            {slide + 1}/{product.images.length}
          </span>
        )}
      </div>

      <div className="ps__body">
        <p className="ps__brand">{product.brand}</p>
        <h2 className="ps__name">{name}</h2>
        {color && (
          <p className="ps__color">
            <span className="color-dots" aria-hidden="true">
              {colorDots(product.colorUz).map((c, i) => (
                <i key={`${c}${i}`} style={{ background: c }} />
              ))}
            </span>
            {color}
          </p>
        )}

        <div className="ps__price">
          <span className="ps__now">{formatMoney(price, region)}</span>
          {old && <span className="old">{formatMoney(old, region)}</span>}
          {off > 0 && <span className="badge-off">−{off}%</span>}
        </div>
        {old && <span className="ps__save">{t('product.save', { amount: formatMoney(old - price, region) })}</span>}

        <div ref={sizesRef}>
          <SizePicker
            variants={product.variants}
            value={variantId}
            onChange={setVariantId}
            lowStock={lowStock}
            shake={shake}
          />
        </div>

        {desc.length > 0 && (
          <>
            <div className="ps__row">
              <span className="ps__label">{t('product.details')}</span>
            </div>
            <ul className="details">
              {desc.map((line) => (
                <li key={line}>
                  <Icon name="check" size={18} strokeWidth={2.6} />
                  {line}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="info-chips">
          {rules && (
            <span className="info-chip">
              <Icon name="truck" size={16} /> {t('product.delivery', { days: rules.deliveryDays })}
            </span>
          )}
          <span className="info-chip">
            <Icon name="card" size={16} /> {t('product.payCard')}
          </span>
          <span className="info-chip">
            <Icon name="ban" size={16} /> {t('product.noReturn')}
          </span>
        </div>
      </div>

      <div className="ps__foot">
        <button
          type="button"
          className={cx('fav-btn', fav && 'fav-btn--on')}
          aria-label={t('fav.title')}
          aria-pressed={fav}
          onClick={() => {
            haptic.select();
            toggleFav(product.id);
          }}
        >
          <Icon name="heart" size={22} filled={fav} />
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onAdd}
          disabled={!product.inStock || !!closed}
        >
          {!product.inStock ? (
            t('card.soldOut')
          ) : variant ? (
            <>
              <Icon name="bag" size={20} /> {t('product.add')} · {variant.label}
            </>
          ) : (
            t('product.pickSize')
          )}
        </button>
      </div>
    </Sheet>
  );
}
