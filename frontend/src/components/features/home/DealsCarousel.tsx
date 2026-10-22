'use client';

// Avtomatik aylanuvchi takliflar karuseli — eng katta chegirmalar, har kategoriyadan aralash
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types';
import { Img } from '@/components/ui/Img';
import { pick } from '@/lib/i18n';
import { discountOf, formatMoney, oldPriceOf, priceOf } from '@/lib/utils';
import { usePrefs, useRegion } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';

export function DealsCarousel({ products }: { products: Product[] }) {
  const region = useRegion();
  const lang = usePrefs((s) => s.lang);
  const openProduct = useUi((s) => s.openProduct);
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const touched = useRef(0);

  // Har 4 soniyada keyingisiga — foydalanuvchi o'zi surgan bo'lsa 8 soniya tegmaymiz
  useEffect(() => {
    const id = setInterval(() => {
      const el = ref.current;
      if (!el || Date.now() - touched.current < 8000 || document.hidden) return;
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const stepWidth = card.offsetWidth + 12;
      const next = (Math.round(el.scrollLeft / stepWidth) + 1) % products.length;
      el.scrollTo({ left: next * stepWidth, behavior: 'smooth' });
    }, 4000);
    return () => clearInterval(id);
  }, [products.length]);

  if (!products.length) return null;
  return (
    <>
      <div
        ref={ref}
        className="hscroll"
        style={{ gap: 12 }}
        onTouchStart={() => (touched.current = Date.now())}
        onScroll={(e) => {
          const el = e.currentTarget;
          const card = el.firstElementChild as HTMLElement | null;
          if (card) setActive(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
        }}
      >
        {products.map((p) => {
          const old = oldPriceOf(p, region);
          return (
            <button key={p.id} type="button" className="deal" onClick={() => openProduct(p.id)}>
              <span className="deal__media">
                <Img src={p.images} width={480} alt="" />
              </span>
              <span className="deal__body">
                <span className="deal__pct">−{discountOf(p, region)}%</span>
                <span>
                  <span className="deal__brand">{p.brand}</span>
                  <br />
                  <span className="deal__name">{pick(p, 'name', lang)}</span>
                </span>
                <span>
                  <span className="deal__price">{formatMoney(priceOf(p, region), region)}</span>{' '}
                  {old && <span className="old">{formatMoney(old, region)}</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="carousel-dots" aria-hidden="true">
        {products.map((p, i) => (
          <i key={p.id} className={i === active ? 'on' : ''} />
        ))}
      </div>
    </>
  );
}
