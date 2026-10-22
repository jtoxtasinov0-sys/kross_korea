'use client';

// Savat: miqdor, o'chirish, yetkazish sharti, "yana bir juftlik" taklifi, jami va rasmiylashtirish
import { useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { Empty } from '@/components/ui/Empty';
import { Stepper } from '@/components/ui/Stepper';
import { ProductCard } from '@/components/features/product/ProductCard';
import { pick, useT } from '@/lib/i18n';
import { MAX_QTY } from '@/lib/constants';
import { haptic } from '@/lib/telegram';
import { cx, discountOf, formatMoney, priceOf } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';
import { Flag } from '@/components/ui/Flag';

export function CartView() {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const cart = useCart();
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const products = useCatalog((s) => s.catalog?.products ?? []);
  const isOpen = useCatalog((s) => s.catalog?.settings.isOpen ?? true);
  const openProduct = useUi((s) => s.openProduct);
  const openCatalog = useUi((s) => s.openCatalog);
  const push = useUi((s) => s.push);
  const { region, lines, rules } = cart;

  // Taklif: savatda yo'q, chegirmadagi eng arzon juftliklar (birinchi mahsulot kategoriyasidan avval)
  const upsell = useMemo(() => {
    const inCart = new Set(lines.map((l) => l.productId));
    const firstCategory = lines[0]?.product.categoryId;
    return products
      .filter((p) => p.inStock && !inCart.has(p.id) && discountOf(p, region) > 0)
      .sort(
        (a, b) =>
          Number(b.categoryId === firstCategory) - Number(a.categoryId === firstCategory) ||
          priceOf(a, region) - priceOf(b, region),
      )
      .slice(0, 6);
  }, [lines, products, region]);

  if (!lines.length) {
    return (
      <>
        <div className="page-head">
          <h1 className="page-title">{t('cart.title')}</h1>
        </div>
        <Empty
          emoji="👟"
          title={t('cart.empty')}
          action={
            <button type="button" className="btn btn--primary" onClick={() => openCatalog({ categoryId: null })}>
              {t('cart.go')} <Icon name="arrowRight" size={18} />
            </button>
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t('cart.title')}</h1>
        <span className="page-count">{cart.count}</span>
      </div>

      <div className="cart-list">
        {lines.map((l) => (
          <article key={l.variantId} className={cx('cline', !l.available && 'cline--bad')}>
            <button type="button" className="cline__img" onClick={() => openProduct(l.productId)} aria-label={pick(l.product, 'name', lang)}>
              <Img src={l.product.images} width={240} alt="" />
            </button>
            <div>
              <div className="cline__top">
                <div>
                  <p className="cline__brand">{l.product.brand}</p>
                  <p className="cline__name">{pick(l.product, 'name', lang)}</p>
                  <span className="cline__size">
                    {t('product.size')}: {l.variant.label} mm
                  </span>
                </div>
                <button
                  type="button"
                  className="cline__remove"
                  aria-label="O'chirish"
                  onClick={() => {
                    haptic.tap();
                    remove(l.variantId);
                  }}
                >
                  <Icon name="trash" size={19} />
                </button>
              </div>
              {!l.available && (
                <p className="cline__warn">
                  {l.variant.stock > 0 ? t('stock.left', { n: l.variant.stock }) : t('cart.unavailable')}
                </p>
              )}
              <div className="cline__bottom">
                <span className="cline__price">{formatMoney(l.total, region)}</span>
                <Stepper
                  value={l.qty}
                  max={Math.max(1, Math.min(MAX_QTY, l.variant.stock))}
                  onChange={(q) => {
                    haptic.select();
                    setQty(l.variantId, q);
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {rules && (
        <div className="delivery-box">
          <Icon name="truck" size={20} />
          <span>
            <Flag region={region} size={18} /> {t('cart.deliveryInfo', { region: t(`region.${region}`), days: rules.deliveryDays })}
            {cart.freeLeft > 0 && (
              <>
                <br />
                {t('cart.freeLeft', { amount: formatMoney(cart.freeLeft, region) })}
              </>
            )}
          </span>
        </div>
      )}

      <div className="summary">
        <div className="summary__row">
          <span>{t('cart.items')}</span>
          <span>{formatMoney(cart.subtotal, region)}</span>
        </div>
        <div className="summary__row">
          <span>{t('cart.delivery')}</span>
          <span>{cart.deliveryFee ? formatMoney(cart.deliveryFee, region) : t('cart.free')}</span>
        </div>
        {cart.prepayPercent < 100 && (
          <div className="summary__row summary__row--accent">
            <span>{t('cart.prepay', { percent: cart.prepayPercent })}</span>
            <span>{formatMoney(cart.prepay, region)}</span>
          </div>
        )}
        <div className="summary__row summary__total">
          <span>{t('cart.total')}</span>
          <span>{formatMoney(cart.total, region)}</span>
        </div>
      </div>

      {upsell.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">{t('cart.upsell')}</h2>
          </div>
          <div className="hscroll rail">
            {upsell.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="cart-spacer" />
      <div className="cart-cta">
        {!isOpen && <p className="form-error">{t('closed')}</p>}
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={cart.hasIssues || !isOpen}
          onClick={() => {
            haptic.tap();
            push({ kind: 'checkout' });
          }}
        >
          {t('cart.checkout')} · {formatMoney(cart.total, region)}
          <Icon name="arrowRight" size={18} />
        </button>
      </div>
    </>
  );
}
