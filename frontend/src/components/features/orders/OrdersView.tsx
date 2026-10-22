'use client';

// Buyurtmalarim: holat, 4 qadamli jarayon, rasmlar, kuzatuv, "To'lash" va "Yana olish"
import { useEffect } from 'react';
import type { Order, OrderStatus } from '@/types';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { Empty } from '@/components/ui/Empty';
import { useT, type Key } from '@/lib/i18n';
import { trackingUrl } from '@/lib/constants';
import { copyText, haptic, openLink } from '@/lib/telegram';
import { cx, formatDate, formatMoney } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useCatalog } from '@/store/catalogStore';
import { useOrders } from '@/store/ordersStore';
import { useUi } from '@/store/uiStore';
import { Flag } from '@/components/ui/Flag';

// Nechta qadam bajarilgan: To'lov → Tasdiq → Yo'lda → Yetdi
const REACHED: Record<OrderStatus, number> = {
  PENDING_PAYMENT: 0,
  RECEIPT_SENT: 1,
  CONFIRMED: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 0,
};
const STEPS: Key[] = ['orders.step.pay', 'orders.step.confirm', 'orders.step.ship', 'orders.step.done'];

function OrderCard({ order }: { order: Order }) {
  const t = useT();
  const byId = useCatalog((s) => s.byId);
  const push = useUi((s) => s.push);
  const setTab = useUi((s) => s.setTab);
  const replaceCart = useCartStore((s) => s.replace);
  const reached = REACHED[order.status];

  // Yana olish: hali bor mahsulotlarni savatga qaytaradi
  const again = () => {
    const items = order.items
      .filter((i) => byId.get(i.productId)?.variants.some((v) => v.id === i.variantId && v.stock > 0))
      .map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty }));
    haptic.tap();
    if (items.length) replaceCart(items);
    setTab('cart');
  };

  return (
    <article className="ocard">
      <div className="ocard__head">
        <div>
          <p className="ocard__no">№ {order.orderNumber}</p>
          <p className="ocard__date">
            {formatDate(order.createdAt)} · <Flag region={order.region} size={16} />
          </p>
        </div>
        <span className={cx('status', `status--${order.status}`)}>{t(`status.${order.status}`)}</span>
      </div>

      {order.status !== 'CANCELLED' && (
        <div className="track" style={{ ['--p' as string]: Math.max(0, reached - 1) / 3 }}>
          {STEPS.map((key, i) => (
            <span key={key} className={cx('track__step', i < reached && 'track__step--on')}>
              <span className="track__dot" />
              {t(key)}
            </span>
          ))}
        </div>
      )}

      <div className="ocard__thumbs">
        {order.items.map((i) => (
          <span key={i.variantId} className="ocard__thumb">
            <Img src={i.image} width={240} alt="" />
            {i.qty > 1 && <span className="ocard__qty">×{i.qty}</span>}
          </span>
        ))}
      </div>

      {order.trackingNumber && (
        <div className="ocard__track">
          <span>
            {t('orders.tracking')}: <b>{order.trackingNumber}</b>
          </span>
          {order.region === 'kr' ? (
            <button type="button" className="link-btn" onClick={() => openLink(trackingUrl(order.trackingNumber!))}>
              {t('orders.track')} <Icon name="external" size={14} />
            </button>
          ) : (
            <button type="button" className="link-btn" onClick={() => copyText(order.trackingNumber!)}>
              <Icon name="copy" size={14} />
            </button>
          )}
        </div>
      )}

      <div className="ocard__foot">
        <span className="ocard__total">{formatMoney(order.total, order.region)}</span>
        <span className="ocard__actions">
          {order.status === 'PENDING_PAYMENT' ? (
            <button type="button" className="btn btn--primary btn--sm" onClick={() => push({ kind: 'payment', orderId: order.id })}>
              {t('orders.pay')}
            </button>
          ) : order.status === 'RECEIPT_SENT' ? (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => push({ kind: 'payment', orderId: order.id })}>
              <Icon name="receipt" size={16} />
            </button>
          ) : null}
          <button type="button" className="btn btn--ghost btn--sm" onClick={again}>
            {t('orders.again')}
          </button>
        </span>
      </div>
    </article>
  );
}

export function OrdersView() {
  const t = useT();
  const orders = useOrders((s) => s.orders);
  const loaded = useOrders((s) => s.loaded);
  const openCatalog = useUi((s) => s.openCatalog);

  useEffect(() => {
    useOrders.getState().load().catch(() => {});
  }, []);

  return (
    <div className="screen" role="dialog" aria-modal="true" aria-label={t('orders.title')}>
      <ScreenHeader title={t('orders.title')} />
      {!loaded && !orders.length ? (
        <div className="ocard skel" style={{ height: 180 }} />
      ) : orders.length ? (
        orders.map((o) => <OrderCard key={o.id} order={o} />)
      ) : (
        <Empty
          emoji="📦"
          title={t('orders.empty')}
          action={
            <button type="button" className="btn btn--primary" onClick={() => openCatalog({ categoryId: null })}>
              {t('cart.go')}
            </button>
          }
        />
      )}
    </div>
  );
}
