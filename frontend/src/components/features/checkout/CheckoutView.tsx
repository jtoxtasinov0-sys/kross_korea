'use client';

// Rasmiylashtirish: bosqich indikatori, ism, telefon (avtomatik format), bo'limga mos manzil, izoh
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { CustomerForm, Region } from '@/types';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { SelectField, TextArea, TextField } from '@/components/ui/Field';
import { api, ApiError } from '@/lib/api';
import { pick, useT, type Key } from '@/lib/i18n';
import { UZ_PROVINCES } from '@/lib/constants';
import { haptic } from '@/lib/telegram';
import { formatMoney, formatPhoneInput, isFullAddress, isValidPhone } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useTelegram } from '@/hooks/useTelegram';
import { useCartStore } from '@/store/cartStore';
import { useCatalog } from '@/store/catalogStore';
import { useOrders } from '@/store/ordersStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';
import { Flag } from '@/components/ui/Flag';

type Errors = Partial<Record<keyof CustomerForm, string>>;

const errorKey = (field: keyof CustomerForm, region: Region): Key =>
  ({
    name: 'err.name',
    phone: region === 'kr' ? 'err.phone.kr' : 'err.phone.uz',
    city: 'err.city',
    street: 'err.street',
    detail: 'err.street',
    zipCode: 'err.zip',
  })[field] as Key;

function validate(f: CustomerForm, region: Region, t: (k: Key) => string): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = t(errorKey('name', region));
  if (!isValidPhone(f.phone, region)) e.phone = t(errorKey('phone', region));
  if (region === 'uz' && !f.city) e.city = t(errorKey('city', region));
  if (!isFullAddress(f.street)) e.street = t(errorKey('street', region));
  if (f.zipCode && !/^\d{5,6}$/.test(f.zipCode.trim())) e.zipCode = t(errorKey('zipCode', region));
  return e;
}

export function CheckoutView() {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const cart = useCart();
  const region = cart.region;
  const session = useCatalog((s) => s.session);
  const { user: tgUser } = useTelegram();
  const clearCart = useCartStore((s) => s.clear);
  const replaceTop = useUi((s) => s.replaceTop);
  const pop = useUi((s) => s.pop);
  const push = useUi((s) => s.push);

  const [form, setForm] = useState<CustomerForm>(() => {
    const saved = session?.addresses[region];
    const user = session?.user;
    const fullName = [user?.firstName ?? tgUser?.first_name, user?.lastName ?? tgUser?.last_name].filter(Boolean).join(' ');
    const knownPhone = saved?.phone || user?.phone || '';
    return {
      name: saved?.name || fullName,
      phone: isValidPhone(knownPhone, region) ? formatPhoneInput(knownPhone, region) : region === 'uz' ? '+998 ' : '',
      city: saved?.city || '',
      street: saved?.street || '',
      detail: saved?.detail || '',
      zipCode: saved?.zipCode || '',
    };
  });
  const [comment, setComment] = useState('');
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);

  const clientErrors = useMemo(() => validate(form, region, t), [form, region, t]);
  const errors: Errors = touched ? { ...serverErrors, ...clientErrors } : serverErrors;

  const set = (key: keyof CustomerForm) => (value: string) => {
    setForm((f) => ({ ...f, [key]: key === 'phone' ? formatPhoneInput(value, region) : value }));
    setServerErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFormError('');
    if (Object.keys(clientErrors).length) {
      haptic.error();
      document.querySelector('.input--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSending(true);
    try {
      const { order } = await api.createOrder({
        region,
        items: cart.lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
        customer: form,
        comment,
        saveAddress: remember,
      });
      haptic.success();
      useOrders.getState().upsert(order);
      replaceTop({ kind: 'payment', orderId: order.id, fresh: true });
      clearCart();
      // Zaxira va manzil yangilansin
      useCatalog.getState().refresh();
      useCatalog.getState().refreshSession();
    } catch (err) {
      haptic.error();
      if (!(err instanceof ApiError)) return setFormError(t('err.generic'));
      if (err.code === 'validation') {
        const fields = (err.data.fields as (keyof CustomerForm)[]) || [];
        setServerErrors(Object.fromEntries(fields.map((f) => [f, t(errorKey(f, region))])));
      } else if (err.code === 'stock') {
        const line = cart.lines.find((l) => l.variantId === err.data.variantId);
        setFormError(
          t('err.stock', {
            name: line ? pick(line.product, 'name', lang) : '',
            size: line?.variant.label ?? '',
            left: Number(err.data.left ?? 0),
          }),
        );
        useCatalog.getState().refresh();
      } else if (err.code === 'unavailable') {
        setFormError(t('err.unavailable'));
        useCatalog.getState().refresh();
      } else if (err.code === 'closed') setFormError(t('err.closed'));
      else if (err.code === 'too_many') setFormError(t('err.tooMany'));
      else setFormError(t('err.generic'));
    } finally {
      setSending(false);
    }
  };

  // Savat bo'shab qolsa (boshqa oynada o'chirilgan) — orqaga
  useEffect(() => {
    if (!cart.lines.length && !sending) pop();
  }, [cart.lines.length, sending, pop]);

  if (!cart.lines.length) return null;

  return (
    <div className="screen" role="dialog" aria-modal="true" aria-label={t('checkout.title')}>
      <ScreenHeader title={t('checkout.title')} />

      <div className="steps" aria-hidden="true">
        <span className="step step--done">
          <span className="step__dot">
            <Icon name="check" size={13} strokeWidth={3} />
          </span>
          {t('checkout.step1')}
        </span>
        <span className="step__line" />
        <span className="step step--on">
          <span className="step__dot">2</span>
          {t('checkout.step2')}
        </span>
        <span className="step__line" />
        <span className="step">
          <span className="step__dot">3</span>
          {t('checkout.step3')}
        </span>
      </div>

      <form onSubmit={submit} noValidate>
        <section className="form-card">
          <h2 className="form-card__title">
            <Icon name="user" size={18} /> {t('checkout.contact')}
          </h2>
          <TextField
            label={t('field.name')}
            autoComplete="name"
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            error={errors.name}
          />
          <TextField
            label={t('field.phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={region === 'kr' ? '010-1234-5678' : '+998 90 123 45 67'}
            value={form.phone}
            onChange={(e) => set('phone')(e.target.value)}
            error={errors.phone}
          />
        </section>

        <section className="form-card">
          <h2 className="form-card__title">
            <Icon name="pin" size={18} /> {t('checkout.address')} · <Flag region={region} size={18} /> {t(`region.${region}`)}
          </h2>
          {region === 'uz' ? (
            <>
              <SelectField
                label={t('field.city')}
                value={form.city}
                onChange={(e) => set('city')(e.target.value)}
                error={errors.city}
              >
                <option value="">{t('field.cityPick')}</option>
                {UZ_PROVINCES.map((p) => (
                  <option key={p.uz} value={p.uz}>
                    {lang === 'ru' ? p.ru : p.uz}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={t('field.street.uz')}
                autoComplete="street-address"
                value={form.street}
                onChange={(e) => set('street')(e.target.value)}
                error={errors.street}
              />
              <TextField
                label={t('field.detail.uz')}
                value={form.detail}
                onChange={(e) => set('detail')(e.target.value)}
              />
            </>
          ) : (
            <>
              <TextField
                label={t('field.street.kr')}
                autoComplete="street-address"
                placeholder="서울특별시 강남구 테헤란로 123"
                value={form.street}
                onChange={(e) => set('street')(e.target.value)}
                error={errors.street}
              />
              <div className="form-row">
                <TextField
                  label={t('field.detail.kr')}
                  placeholder="101동 1203호"
                  value={form.detail}
                  onChange={(e) => set('detail')(e.target.value)}
                />
                <TextField
                  label={t('field.zip')}
                  inputMode="numeric"
                  maxLength={6}
                  value={form.zipCode}
                  onChange={(e) => set('zipCode')(e.target.value.replace(/\D/g, ''))}
                  error={errors.zipCode}
                />
              </div>
            </>
          )}
          <TextArea
            label={t('field.comment')}
            rows={2}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <label className="check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            {t('field.save')}
          </label>
        </section>

        <section className="form-card">
          <div className="mini-items">
            {cart.lines.map((l) => (
              <div key={l.variantId} className="mini-item">
                <span className="mini-item__img">
                  <Img src={l.product.images} width={240} alt="" />
                </span>
                <span>
                  {pick(l.product, 'name', lang)}
                  <br />
                  <span className="mini-item__sub">
                    {l.variant.label} mm × {l.qty}
                  </span>
                </span>
                <span>{formatMoney(l.total, region)}</span>
              </div>
            ))}
          </div>
          <div className="summary__row summary__total" style={{ marginTop: 14 }}>
            <span>{t('cart.total')}</span>
            <span>{formatMoney(cart.total, region)}</span>
          </div>
        </section>

        <p className="note note--info">
          <Icon name="card" size={18} /> {t('checkout.note')}
        </p>
        <p className="note note--warn">
          <Icon name="info" size={18} /> {t('checkout.noReturn')}
        </p>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <div className="ask-link">
          <button type="button" className="link-btn" onClick={() => push({ kind: 'contact' })}>
            <Icon name="chat" size={16} /> {t('checkout.ask')}
          </button>
        </div>

        <div className="screen__foot">
          <button type="submit" className="btn btn--primary btn--block" disabled={sending || cart.hasIssues}>
            {sending ? '…' : `${t('checkout.submit')} · ${formatMoney(cart.total, region)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
