'use client';

// Pastki navigatsiya: suzuvchi shisha panel, 4 tugma + o'rtada gradient savat tugmasi (soni bilan)
import type { Tab } from '@/types';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useT, type Key } from '@/lib/i18n';
import { haptic } from '@/lib/telegram';
import { cx } from '@/lib/utils';
import { useCartCount } from '@/hooks/useCart';
import { useUi } from '@/store/uiStore';

const SIDE: { tab: Tab; icon: IconName; label: Key }[][] = [
  [
    { tab: 'home', icon: 'home', label: 'nav.home' },
    { tab: 'catalog', icon: 'grid', label: 'nav.catalog' },
  ],
  [
    { tab: 'favorites', icon: 'heart', label: 'nav.favorites' },
    { tab: 'profile', icon: 'user', label: 'nav.profile' },
  ],
];

export function BottomNav() {
  const t = useT();
  const tab = useUi((s) => s.tab);
  const setTab = useUi((s) => s.setTab);
  const bump = useUi((s) => s.cartBump);
  const count = useCartCount();

  const go = (next: Tab) => {
    if (next !== tab) haptic.select();
    setTab(next);
  };

  const item = (i: (typeof SIDE)[number][number]) => (
    <button
      key={i.tab}
      type="button"
      className={cx('nav__item', tab === i.tab && 'nav__item--on')}
      aria-current={tab === i.tab ? 'page' : undefined}
      onClick={() => go(i.tab)}
    >
      <span className="nav__ico">
        <Icon name={i.icon} size={22} filled={i.tab === 'favorites' && tab === 'favorites'} />
      </span>
      {t(i.label)}
    </button>
  );

  return (
    <nav className="nav" aria-label="Navigatsiya">
      {SIDE[0].map(item)}
      <div className="nav__center">
        <button
          key={bump}
          type="button"
          className={cx('nav__cart', tab === 'cart' && 'nav__cart--on', bump > 0 && 'nav__cart--bump')}
          aria-label={`${t('nav.cart')}: ${count}`}
          onClick={() => go('cart')}
        >
          <Icon name="bag" size={26} strokeWidth={2.3} />
          {count > 0 && (
            <span key={count} className="nav__badge">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </div>
      {SIDE[1].map(item)}
    </nav>
  );
}
