'use client';

// Savatga qo'shish: savat + haptic + savat tugmasi sakrashi + zarrachalar + toast
import { useCartStore } from '@/store/cartStore';
import { useUi } from '@/store/uiStore';
import { useT } from '@/lib/i18n';
import { haptic } from '@/lib/telegram';
import { burstAtCart } from '@/lib/fx';
import type { Product, Variant } from '@/types';

export function useAddToCart() {
  const add = useCartStore((s) => s.add);
  const t = useT();

  return (product: Product, variant: Variant) => {
    add(product.id, variant.id);
    haptic.success();
    const ui = useUi.getState();
    ui.bumpCart();
    ui.showToast(`${t('toast.added')} · ${variant.label} mm`, 'cart');
    // Oyna yopilgach effekt savat tugmasida ko'rinsin
    requestAnimationFrame(() => burstAtCart());
  };
}
