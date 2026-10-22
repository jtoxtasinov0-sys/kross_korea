'use client';

// Savat logikasi: savatdagi ID'larni katalog bilan birlashtirib narx, yetkazish va jamini hisoblaydi
import { useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useCatalog } from '@/store/catalogStore';
import { useRegion } from '@/store/prefsStore';
import { priceOf } from '@/lib/utils';
import type { Product, Variant } from '@/types';

export interface CartLine {
  productId: number;
  variantId: number;
  qty: number;
  product: Product;
  variant: Variant;
  price: number;
  total: number;
  available: boolean; // o'lcham hali bormi va soni yetadimi
}

export function useCart() {
  const items = useCartStore((s) => s.items);
  const byId = useCatalog((s) => s.byId);
  const settings = useCatalog((s) => s.catalog?.settings);
  const region = useRegion();

  return useMemo(() => {
    const lines: CartLine[] = [];
    for (const item of items) {
      const product = byId.get(item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (!product || !variant) continue;
      const price = priceOf(product, region);
      lines.push({
        ...item,
        product,
        variant,
        price,
        total: price * item.qty,
        available: variant.stock >= item.qty,
      });
    }
    const rules = settings?.regions[region];
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.total, 0);
    const deliveryFee = !rules || (rules.freeFrom && subtotal >= rules.freeFrom) ? 0 : rules.deliveryFee;
    const total = subtotal + deliveryFee;
    const prepayPercent = Math.min(Math.max(rules?.prepay ?? 100, 1), 100);
    const prepay = Math.ceil((total * prepayPercent) / 100);
    const freeLeft = rules?.freeFrom && rules.deliveryFee && subtotal < rules.freeFrom ? rules.freeFrom - subtotal : 0;
    return {
      lines,
      count,
      subtotal,
      deliveryFee,
      total,
      prepay,
      prepayPercent,
      freeLeft,
      rules,
      region,
      hasIssues: lines.some((l) => !l.available),
    };
  }, [items, byId, settings, region]);
}

/** Navigatsiyadagi savat belgisi uchun — faqat soni */
export const useCartCount = () => useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
