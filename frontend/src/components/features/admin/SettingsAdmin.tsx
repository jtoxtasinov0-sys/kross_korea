'use client';

// Sozlamalar: bo'limlar bo'yicha karta rekvizitlari va yetkazish, do'kon ma'lumotlari, panelga kirish
import { useCallback, useEffect, useState } from 'react';
import type { AdminSettings } from '@/types/admin';
import { Icon } from '@/components/ui/Icon';
import { Flag } from '@/components/ui/Flag';
import { TextArea, TextField } from '@/components/ui/Field';
import { adminApi } from '@/lib/adminApi';
import { copyText } from '@/lib/telegram';
import { useAdmin } from '@/store/adminStore';
import { Switch, errorFields, errorText, numOrEmpty } from './common';

type Key = Exclude<keyof AdminSettings, 'testCards' | 'updatedAt'>;
const NUMBER_KEYS: Key[] = ['prepayUz', 'deliveryUzFee', 'uzsRate', 'prepayKr', 'deliveryKrFee', 'deliveryKrFreeFrom'];

export function SettingsAdmin() {
  const notify = useAdmin((s) => s.notify);
  const logout = useAdmin((s) => s.logout);
  const [original, setOriginal] = useState<AdminSettings | null>(null);
  const [draft, setDraft] = useState<AdminSettings | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [envPassword, setEnvPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.settings();
      setOriginal(res.settings);
      setDraft(res.settings);
      setEnvPassword(res.envPasswordSet);
    } catch (err) {
      notify(errorText(err), 'error');
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  if (!draft || !original) return <div className="panel skel" style={{ height: 400 }} />;

  const changed = (Object.keys(draft) as (keyof AdminSettings)[]).filter(
    (k) => k !== 'testCards' && k !== 'updatedAt' && (draft[k] ?? '') !== (original[k] ?? ''),
  ) as Key[];

  const set = (key: Key, value: string | number | boolean | null) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const text = (key: Key, label: string, extra: Record<string, string> = {}) => (
    <TextField
      label={label}
      value={String(draft[key] ?? '')}
      inputMode={NUMBER_KEYS.includes(key) ? 'numeric' : undefined}
      onChange={(e) => set(key, NUMBER_KEYS.includes(key) ? numOrEmpty(e.target.value) : e.target.value)}
      error={errors.has(key) && 'Noto‘g‘ri qiymat'}
      {...extra}
    />
  );

  const save = async () => {
    setSaving(true);
    try {
      const patch = Object.fromEntries(changed.map((k) => [k, draft[k] === '' ? null : draft[k]]));
      const res = await adminApi.saveSettings(patch);
      if (res.token) useAdmin.getState().login(res.token, useAdmin.getState().name);
      setOriginal(res.settings);
      setDraft(res.settings);
      setErrors(new Set());
      notify('Sozlamalar saqlandi ✓');
    } catch (err) {
      setErrors(errorFields(err));
      notify(errorText(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const adminUrl = draft.adminUrl || `${window.location.origin}/admin`;

  return (
    <>
      <div className="ahead">
        <h1 className="ahead__title">Sozlamalar</h1>
        <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
          <Icon name="logout" size={16} /> Chiqish
        </button>
      </div>

      {(original.testCards.uz || original.testCards.kr) && (
        <p className="alert alert--warn">
          <Icon name="card" size={18} /> Karta raqamlari hali test qiymatda — haqiqiy kartani kiriting.
        </p>
      )}

      <div className="cols" style={{ marginTop: 0 }}>
        <section className="panel">
          <h2 className="panel__title">
            <Flag region="uz" size={22} /> O‘zbekiston bo‘limi ($)
          </h2>
          {text('payUzBank', 'Bank / karta turi', { placeholder: 'Uzcard / Humo' })}
          {text('payUzCard', 'Karta raqami')}
          {text('payUzHolder', 'Qabul qiluvchi (ism)')}
          <div className="form-grid form-grid--2">
            {text('prepayUz', 'Oldindan to‘lov, %')}
            {text('deliveryUzFee', 'Yetkazish narxi, $ (0 — bepul)')}
            {text('deliveryUzDays', 'Yetkazish muddati, kun')}
            {text('uzsRate', '1 $ = … so‘m (0 — ko‘rsatilmaydi)')}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">
            <Flag region="kr" size={22} /> Koreya bo‘limi (₩)
          </h2>
          {text('payKrBank', 'Bank')}
          {text('payKrCard', 'Karta / hisob raqami')}
          {text('payKrHolder', 'Qabul qiluvchi (예금주)')}
          <div className="form-grid form-grid--2">
            {text('prepayKr', 'Oldindan to‘lov, %')}
            {text('deliveryKrFee', 'Yetkazish narxi, ₩ (0 — bepul)')}
            {text('deliveryKrFreeFrom', 'Shu summadan bepul, ₩ (0 — yo‘q)')}
            {text('deliveryKrDays', 'Yetkazish muddati, kun')}
          </div>
        </section>
      </div>

      <div className="cols">
        <section className="panel">
          <h2 className="panel__title">
            <Icon name="bag" size={18} /> Do‘kon
          </h2>
          <Switch checked={draft.isOpen} onChange={(v) => set('isOpen', v)} label="Do‘kon ochiq" hint="Yopiq bo‘lsa mijozlar buyurtma bera olmaydi" />
          {text('shopName', 'Do‘kon nomi')}
          {text('phone', 'Aloqa telefoni (Telegram / WhatsApp)')}
          {text('supportUsername', 'Yordam uchun Telegram username')}
          {text('instagramUrl', 'Instagram havolasi')}
          {text('channelUrl', 'Telegram kanal havolasi')}
          <TextArea label="Biz haqimizda (o‘zbekcha)" rows={3} value={draft.aboutUz ?? ''} onChange={(e) => set('aboutUz', e.target.value)} />
          <TextArea label="Biz haqimizda (ruscha)" rows={3} value={draft.aboutRu ?? ''} onChange={(e) => set('aboutRu', e.target.value)} />
        </section>

        <section className="panel">
          <h2 className="panel__title">
            <Icon name="shield" size={18} /> Panelga kirish
          </h2>
          <p className="panel__hint">
            {draft.panelPassword ? 'Panel paroli o‘rnatilgan.' : envPassword ? 'Hozir .env dagi ADMIN_PASSWORD ishlatilmoqda.' : 'Parol o‘rnatilmagan!'}
          </p>
          {text('panelPassword', 'Yangi panel paroli (kamida 10 belgi)', { type: 'password', autoComplete: 'new-password' })}
          {text('webAppUrl', 'Mini ilova manzili (https://…)')}
          {text('adminUrl', 'Admin panel manzili (https://…)')}
          <button
            type="button"
            className="btn btn--soft btn--sm"
            onClick={async () => {
              const body = draft.panelPassword ? `${adminUrl}\nParol: ${draft.panelPassword}` : adminUrl;
              if (await copyText(body)) notify('Nusxalandi ✓');
            }}
          >
            <Icon name="copy" size={16} /> Manzil{draft.panelPassword ? ' va parolni' : 'ni'} nusxalash
          </button>
        </section>
      </div>

      {changed.length > 0 && (
        <div className="savebar">
          <span>{changed.length} ta o‘zgarish</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn--soft btn--sm" onClick={() => setDraft(original)} disabled={saving}>
              Bekor
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={save} disabled={saving}>
              {saving ? '…' : 'Saqlash'}
            </button>
          </span>
        </div>
      )}
    </>
  );
}
