'use client';

// To'lov — qog'oz chek ko'rinishi: buyurtma, karta rekvizitlari (nusxa olish bilan), chek yuklash
import { useEffect, useState, type ChangeEvent } from 'react';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Icon } from '@/components/ui/Icon';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { copyText, haptic } from '@/lib/telegram';
import { compressImage, cx, formatDate, formatMoney } from '@/lib/utils';
import { useCatalog } from '@/store/catalogStore';
import { useOrder, useOrders } from '@/store/ordersStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';
import { Flag } from '@/components/ui/Flag';
import { TelegramLinkCard } from '@/components/features/telegram/TelegramLinkCard';

function CopyRow({ label, value, copy, sub }: { label: string; value: string; copy?: string; sub?: string }) {
  const t = useT();
  const [done, setDone] = useState(false);
  return (
    <div className="copy-row">
      <div>
        <p className="copy-row__label">{label}</p>
        <p className="copy-row__value">{value}</p>
        {sub && <p className="copy-row__sub">{sub}</p>}
      </div>
      {copy !== undefined && (
        <button
          type="button"
          className={cx('copy-btn', done && 'copy-btn--done')}
          onClick={async () => {
            if (await copyText(copy)) {
              haptic.success();
              setDone(true);
              useUi.getState().showToast(t('toast.copied'));
              setTimeout(() => setDone(false), 1600);
            }
          }}
        >
          {done ? <Icon name="check" size={16} strokeWidth={3} /> : t('pay.copy')}
        </button>
      )}
    </div>
  );
}

export function PaymentView({ orderId, fresh }: { orderId: number; fresh?: boolean }) {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const order = useOrder(orderId);
  const settings = useCatalog((s) => s.catalog?.settings);
  const isWeb = useCatalog((s) => !!s.session?.user.isGuest);
  const replaceTop = useUi((s) => s.replaceTop);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    useOrders.getState().fetchOne(orderId);
  }, [orderId]);

  if (!order || !settings) {
    return (
      <div className="screen">
        <ScreenHeader title={t('pay.title')} />
        <div className="receipt-wrap">
          <div className="receipt skel" style={{ height: 420 }} />
        </div>
      </div>
    );
  }

  const region = order.region;
  const rules = settings.regions[region];
  const partial = order.prepayAmount < order.total;
  // Oldindan to'lov yuqoriga yaxlitlanadi (ceil), shuning uchun foiz pastga — 50% ko'rinsin, 51% emas
  const percent = Math.floor((order.prepayAmount / order.total) * 100);
  const uzs = region === 'uz' && rules.uzsRate ? Math.round(order.prepayAmount * rules.uzsRate) : 0;
  const unpaid = order.status === 'PENDING_PAYMENT' || order.status === 'RECEIPT_SENT';

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const blob = await compressImage(file);
      const { order: updated } = await api.uploadReceipt(order.id, blob);
      useOrders.getState().upsert(updated);
      haptic.success();
    } catch {
      haptic.error();
      setError(t('err.generic'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="screen" role="dialog" aria-modal="true" aria-label={t('pay.title')}>
      <ScreenHeader title={t('pay.title')} />

      {fresh && (
        <div className="pay-hero">
          <div className="pay-check">
            <Icon name="check" size={38} strokeWidth={3.2} />
          </div>
          <h1>{t('pay.success')}</h1>
        </div>
      )}

      <div className="receipt-wrap">
        <div className="receipt">
          <p className="receipt__brand">
            KROSS <span>KOREA</span>
          </p>
          <p className="receipt__no">№ {order.orderNumber}</p>
          <p className="receipt__date">
            {formatDate(order.createdAt)} · <Flag region={region} size={16} /> {t(`region.${region}`)}
          </p>

          <div className="receipt__cut" />
          {order.items.map((i) => (
            <div key={i.variantId} className="receipt__item">
              <span>
                {i.brand} {lang === 'ru' ? i.nameRu || i.name : i.name} · {i.variant} × {i.qty}
              </span>
              <span>{formatMoney(i.price * i.qty, region)}</span>
            </div>
          ))}
          <div className="receipt__item receipt__muted">
            <span>{t('cart.delivery')}</span>
            <span>{order.deliveryFee ? formatMoney(order.deliveryFee, region) : t('cart.free')}</span>
          </div>
          <div className="receipt__cut" />
          <div className="receipt__total">
            <span>{t('pay.total')}</span>
            <b>{formatMoney(order.total, region)}</b>
          </div>

          <div className="receipt__cut" />
          <p className="receipt__label">💳 {t('pay.toCard')}</p>
          <CopyRow label={t('pay.bank')} value={rules.bank} />
          <CopyRow label={t('pay.card')} value={rules.card} copy={rules.card.replace(/[\s-]/g, '')} />
          <CopyRow label={t('pay.holder')} value={rules.holder} copy={rules.holder} />
          <CopyRow
            label={t('pay.amount')}
            value={formatMoney(order.prepayAmount, region)}
            copy={String(order.prepayAmount)}
            sub={[partial && t('pay.prepayNote', { percent }), uzs && t('pay.uzs', { sum: uzs.toLocaleString('ru-RU') })]
              .filter(Boolean)
              .join(' · ')}
          />
          <div className="barcode" aria-hidden="true" />
        </div>
      </div>

      <div className="pay-actions">
        {error && <p className="form-error" style={{ margin: 0 }}>{error}</p>}
        {order.status === 'RECEIPT_SENT' && <p className="pay-done">{t('pay.sent')}</p>}
        {!unpaid && order.status !== 'CANCELLED' && <p className="pay-done">{t('pay.paid')}</p>}
        {unpaid && (
          <label className={cx('btn upload btn--block', order.status === 'RECEIPT_SENT' ? 'btn--ghost' : 'btn--primary')} aria-disabled={uploading}>
            <Icon name="upload" size={20} /> {uploading ? t('pay.uploading') : t('pay.upload')}
            <input type="file" accept="image/*" onChange={onFile} disabled={uploading} />
          </label>
        )}
        {order.status === 'PENDING_PAYMENT' && (
          <button type="button" className="btn btn--soft btn--block" onClick={() => replaceTop({ kind: 'orders' })}>
            {t('pay.later')}
          </button>
        )}
        {/* Saytda — botga ulash kartasi (chekni botga yuborish ham shundan keyin ishlaydi) */}
        {isWeb ? <TelegramLinkCard /> : unpaid && <p className="hint">{t('pay.botHint')}</p>}
      </div>
    </div>
  );
}
