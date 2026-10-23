'use client';

// Buyurtma oynasi: mijoz, manzil, mahsulotlar, chek, kuzatuv raqami, holatni o'zgartirish (mijozga avtomatik xabar)
import { useEffect, useState } from 'react';
import type { OrderStatus } from '@/types';
import type { AdminOrder } from '@/types/admin';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { Flag } from '@/components/ui/Flag';
import { TextArea, TextField } from '@/components/ui/Field';
import { adminApi } from '@/lib/adminApi';
import { copyText, openLink } from '@/lib/telegram';
import { formatDate, formatMoney, thumb } from '@/lib/utils';
import { useAdmin } from '@/store/adminStore';
import { ConfirmButton, Modal, STATUS_LABEL, StatusBadge, errorText } from './common';

interface Props {
  id: number;
  onClose: () => void;
  onChanged: (order: AdminOrder) => void;
}

// Har holatdan keyingi asosiy qadam
const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string; className: string }>> = {
  PENDING_PAYMENT: { status: 'CONFIRMED', label: '✅ Tasdiqlash', className: 'btn--ok' },
  RECEIPT_SENT: { status: 'CONFIRMED', label: '✅ Tasdiqlash', className: 'btn--ok' },
  CONFIRMED: { status: 'SHIPPED', label: '🚚 Jo‘natildi', className: 'btn--primary' },
  SHIPPED: { status: 'DELIVERED', label: '🎉 Yetkazildi', className: 'btn--ok' },
  CANCELLED: { status: 'PENDING_PAYMENT', label: '↩ Qayta tiklash', className: 'btn--ghost' },
};

export function OrderDetail({ id, onClose, onChanged }: Props) {
  const notify = useAdmin((s) => s.notify);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [tracking, setTracking] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState('');

  useEffect(() => {
    adminApi
      .order(id)
      .then(({ order: o }) => {
        setOrder(o);
        setTracking(o.trackingNumber || '');
        setNote(o.adminNote || '');
      })
      .catch((err) => notify(errorText(err), 'error'));
  }, [id, notify]);

  const apply = async (patch: { status?: OrderStatus }) => {
    if (!order) return;
    setBusy(true);
    try {
      const res = await adminApi.updateOrder(order.id, { ...patch, trackingNumber: tracking, adminNote: note });
      setOrder(res.order);
      onChanged(res.order);
      if (!patch.status) notify('Saqlandi ✓');
      else if (res.delivered) notify(`${STATUS_LABEL[res.order.status]} — mijozga xabar ketdi ✓`);
      else if (res.delivered === false) notify(`Mijozga bot orqali yetmadi — telefon qiling: ${res.order.phone}`, 'error');
      else notify(`Holat: ${STATUS_LABEL[res.order.status]}`);
    } catch (err) {
      notify(errorText(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    if (await copyText(text)) notify('Nusxalandi ✓');
  };

  if (!order) {
    return (
      <Modal title="Buyurtma" onClose={onClose}>
        <div className="panel skel" style={{ height: 320 }} />
      </Modal>
    );
  }

  const r = order.region;
  const address = [order.city, order.street, order.detail, order.zipCode].filter(Boolean).join(', ');
  const next = NEXT[order.status];
  const canCancel = order.status !== 'CANCELLED' && order.status !== 'DELIVERED';

  return (
    <Modal
      title={order.orderNumber}
      onClose={onClose}
      right={<StatusBadge status={order.status} />}
      footer={
        <>
          {next && (
            <button type="button" className={`btn ${next.className}`} disabled={busy} onClick={() => apply({ status: next.status })}>
              {next.label}
            </button>
          )}
          {canCancel && (
            <ConfirmButton
              className="btn--ghost"
              confirmText="Rostdan bekor qilinsinmi?"
              disabled={busy}
              onConfirm={() => apply({ status: 'CANCELLED' })}
            >
              Bekor qilish
            </ConfirmButton>
          )}
        </>
      }
    >
      {order.isWeb && (
        <p className="alert alert--warn">
          <Icon name="info" size={18} /> Saytdan berilgan buyurtma — bot xabari mijozga yetmaydi. Telefon qiling.
        </p>
      )}
      {order.isBlocked && !order.isWeb && (
        <p className="alert alert--warn">
          <Icon name="ban" size={18} /> Mijoz botni bloklagan — xabarlar yetmaydi, telefon qiling.
        </p>
      )}
      {order.status === 'RECEIPT_SENT' && (
        <p className="alert alert--info">
          <Icon name="receipt" size={18} /> Chek keldi — summani tekshirib, “Tasdiqlash”ni bosing.
        </p>
      )}

      <section className="panel">
        <h3 className="panel__title">
          <Icon name="user" size={18} /> Mijoz
        </h3>
        <dl className="kv">
          <dt>Ism</dt>
          <dd>{order.customerName}</dd>
          <dt>Telefon</dt>
          <dd>
            <a href={`tel:${order.phone.replace(/[^\d+]/g, '')}`}>{order.phone}</a>
            <button type="button" className="mini-copy" onClick={() => copy(order.phone)}>
              nusxa
            </button>
          </dd>
          {order.username && (
            <>
              <dt>Telegram</dt>
              <dd>
                <button type="button" className="link-btn" onClick={() => openLink(`https://t.me/${order.username}`)}>
                  @{order.username} <Icon name="external" size={14} />
                </button>
              </dd>
            </>
          )}
          <dt>Bo‘lim</dt>
          <dd>
            <Flag region={r} size={18} /> {r === 'uz' ? "O'zbekiston" : 'Koreya'}
          </dd>
          <dt>Manzil</dt>
          <dd>
            {address}
            <button type="button" className="mini-copy" onClick={() => copy(address)}>
              nusxa
            </button>
          </dd>
          {order.comment && (
            <>
              <dt>Izoh</dt>
              <dd>{order.comment}</dd>
            </>
          )}
          <dt>Sana</dt>
          <dd>{formatDate(order.createdAt)}</dd>
        </dl>
      </section>

      <section className="panel">
        <h3 className="panel__title">
          <Icon name="bag" size={18} /> Mahsulotlar
        </h3>
        {order.items.map((i) => (
          <div key={i.variantId} className="list-row">
            <button type="button" className="thumb thumb--lg" onClick={() => i.image && setZoom(i.image)}>
              <Img src={i.image} width={240} />
            </button>
            <div className="list-row__main">
              {i.brand} {i.name}
              <div className="list-row__sub">
                O‘lcham: {i.variant} mm · {i.qty} ta × {formatMoney(i.price, r)}
              </div>
            </div>
            <span className="list-row__end">{formatMoney(i.price * i.qty, r)}</span>
          </div>
        ))}
        <dl className="kv" style={{ marginTop: 12 }}>
          <dt>Yetkazish</dt>
          <dd>{order.deliveryFee ? formatMoney(order.deliveryFee, r) : 'Bepul'}</dd>
          <dt>Jami</dt>
          <dd>
            <b>{formatMoney(order.total, r)}</b>
          </dd>
          {order.prepayAmount < order.total && (
            <>
              <dt>Oldindan</dt>
              <dd>{formatMoney(order.prepayAmount, r)}</dd>
            </>
          )}
        </dl>
      </section>

      <section className="panel">
        <h3 className="panel__title">
          <Icon name="receipt" size={18} /> Chek
        </h3>
        {order.receiptUrl ? (
          <button type="button" onClick={() => setZoom(order.receiptUrl!)} aria-label="Chekni kattalashtirish">
            <img className="receipt-img" src={thumb(order.receiptUrl, 720)} alt="To‘lov cheki" />
          </button>
        ) : (
          <p className="muted">Hali chek yuklanmagan</p>
        )}
      </section>

      <section className="panel">
        <h3 className="panel__title">
          <Icon name="truck" size={18} /> Jo‘natish
        </h3>
        <TextField
          label={r === 'kr' ? 'Kuzatuv raqami (택배)' : 'Kuzatuv raqami'}
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Masalan: 6894 1234 5678"
        />
        <TextArea label="Admin izohi (mijozga ko‘rinmaydi)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="button" className="btn btn--soft btn--sm" disabled={busy} onClick={() => apply({})}>
          Saqlash
        </button>
        <p className="panel__hint" style={{ margin: '12px 0 0' }}>
          “Jo‘natildi” bosilganda kuzatuv raqami ham mijozga yuboriladi.
        </p>
      </section>

      {zoom && (
        <div className="viewer" role="dialog" aria-modal="true" onClick={() => setZoom('')}>
          <img src={thumb(zoom, 1080)} alt="" />
          <button type="button" className="viewer__close" aria-label="Yopish">
            <Icon name="close" size={22} />
          </button>
        </div>
      )}
    </Modal>
  );
}
