'use client';

// Mahsulot muharriri: rasmlar (yuklash, tartib, asosiy), nomlar uz/ru, narxlar ($ va ₩), o'lchamlar, tavsif
import { useState, type ChangeEvent } from 'react';
import type { AdminCategory, AdminProduct, ProductInput } from '@/types/admin';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { Flag } from '@/components/ui/Flag';
import { SelectField, TextArea, TextField } from '@/components/ui/Field';
import { adminApi } from '@/lib/adminApi';
import { compressImage, cx, formatMoney } from '@/lib/utils';
import { useAdmin } from '@/store/adminStore';
import { ConfirmButton, Modal, Switch, errorFields, errorText, numOrEmpty } from './common';

const SIZE_RUN = ['240', '245', '250', '255', '260', '265', '270', '275', '280', '285'];

function toInput(p: AdminProduct | null, categories: AdminCategory[]): ProductInput {
  if (!p) {
    return {
      nameUz: '',
      nameRu: '',
      brand: 'Nike',
      colorUz: '',
      colorRu: '',
      descUz: '',
      descRu: '',
      priceUsd: '',
      oldPriceUsd: '',
      priceKrw: '',
      oldPriceKrw: '',
      categoryId: categories[0]?.id ?? '',
      isActive: true,
      isNew: true,
      sortOrder: 0,
      images: [],
      variants: SIZE_RUN.map((label) => ({ label, stock: 0 })),
    };
  }
  return {
    nameUz: p.nameUz,
    nameRu: p.nameRu,
    brand: p.brand,
    colorUz: p.colorUz ?? '',
    colorRu: p.colorRu ?? '',
    descUz: p.descUz ?? '',
    descRu: p.descRu ?? '',
    priceUsd: p.priceUsd,
    oldPriceUsd: p.oldPriceUsd ?? '',
    priceKrw: p.priceKrw,
    oldPriceKrw: p.oldPriceKrw ?? '',
    categoryId: p.categoryId,
    isActive: p.isActive,
    isNew: p.isNew,
    sortOrder: p.sortOrder,
    images: [...p.images],
    variants: p.variants.map((v) => ({ id: v.id, label: v.label, stock: v.stock })),
  };
}

const offPercent = (price: number | '', old: number | '') =>
  price && old && old > price ? Math.round((1 - price / old) * 100) : 0;

interface Props {
  product: AdminProduct | null; // null — yangi mahsulot
  categories: AdminCategory[];
  brands: string[];
  onClose: () => void;
  onSaved: (product: AdminProduct) => void;
  onDeleted: (id: number) => void;
}

export function ProductEditor({ product, categories, brands, onClose, onSaved, onDeleted }: Props) {
  const notify = useAdmin((s) => s.notify);
  const [form, setForm] = useState<ProductInput>(() => toInput(product, categories));
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [fillValue, setFillValue] = useState<number | ''>(3);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e.has(key)) return e;
      const next = new Set(e);
      next.delete(key);
      return next;
    });
  };

  // ---------- Rasmlar ----------
  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])];
    e.target.value = '';
    for (const file of files) {
      setUploading((n) => n + 1);
      try {
        const blob = await compressImage(file, 1800, 0.88);
        const { url } = await adminApi.upload(blob, file.name);
        setForm((f) => ({ ...f, images: [...f.images, url] }));
        setErrors((er) => {
          const next = new Set(er);
          next.delete('images');
          return next;
        });
      } catch (err) {
        notify(errorText(err), 'error');
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const moveImage = (from: number, to: number) =>
    setForm((f) => {
      const images = [...f.images];
      const [item] = images.splice(from, 1);
      images.splice(to, 0, item);
      return { ...f, images };
    });

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!/^https:\/\/\S+$/.test(url)) return notify('Havola https:// bilan boshlanishi kerak', 'error');
    set('images', [...form.images, url]);
    setImageUrl('');
  };

  // ---------- O'lchamlar ----------
  const setVariant = (i: number, patch: Partial<ProductInput['variants'][number]>) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, k) => (k === i ? { ...v, ...patch } : v)) }));

  const addSizeRun = () =>
    setForm((f) => {
      const have = new Set(f.variants.map((v) => v.label));
      const added = SIZE_RUN.filter((s) => !have.has(s)).map((label) => ({ label, stock: 0 as number | '' }));
      const variants = [...f.variants, ...added].sort((a, b) => Number(a.label) - Number(b.label) || a.label.localeCompare(b.label));
      return { ...f, variants };
    });

  // ---------- Saqlash ----------
  const save = async () => {
    setSaving(true);
    try {
      const res = product ? await adminApi.updateProduct(product.id, form) : await adminApi.createProduct(form);
      notify(product ? 'Mahsulot saqlandi ✓' : 'Yangi mahsulot qo‘shildi ✓');
      onSaved(res.product);
    } catch (err) {
      setErrors(errorFields(err));
      notify(errorText(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!product) return;
    try {
      await adminApi.deleteProduct(product.id);
      notify('Mahsulot o‘chirildi');
      onDeleted(product.id);
    } catch (err) {
      notify(errorText(err), 'error');
    }
  };

  const err = (key: string, text: string) => errors.has(key) && text;
  const totalStock = form.variants.reduce((n, v) => n + (Number(v.stock) || 0), 0);

  return (
    <Modal
      title={product ? `${product.brand} ${product.nameUz}` : 'Yangi mahsulot'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--primary" onClick={save} disabled={saving || uploading > 0}>
            {saving ? '…' : uploading > 0 ? 'Rasm yuklanmoqda…' : 'Saqlash'}
          </button>
          {product && (
            <ConfirmButton className="btn--ghost" confirmText="Rostdan o‘chirilsinmi?" onConfirm={remove}>
              <Icon name="trash" size={18} /> O‘chirish
            </ConfirmButton>
          )}
        </>
      }
    >
      <section className={cx('panel', errors.has('images') && 'err-box')}>
        <h3 className="panel__title">
          <Icon name="image" size={18} /> Rasmlar
        </h3>
        <p className="panel__hint">Birinchi rasm — asosiy (katalogda shu ko‘rinadi). Tartibni strelkalar bilan o‘zgartiring.</p>
        <div className="img-grid">
          {form.images.map((url, i) => (
            <div key={`${url}-${i}`} className="img-cell">
              <Img src={url} width={240} />
              {i === 0 && <span className="img-cell__main">ASOSIY</span>}
              <div className="img-cell__tools">
                <button type="button" aria-label="Chapga" disabled={i === 0} onClick={() => moveImage(i, i - 1)}>
                  <Icon name="chevronLeft" size={16} strokeWidth={2.8} />
                </button>
                <button type="button" aria-label="Asosiy qilish" disabled={i === 0} onClick={() => moveImage(i, 0)}>
                  <Icon name="star" size={15} />
                </button>
                <button
                  type="button"
                  aria-label="O‘chirish"
                  onClick={() => set('images', form.images.filter((_, k) => k !== i))}
                >
                  <Icon name="trash" size={15} />
                </button>
                <button
                  type="button"
                  aria-label="O‘ngga"
                  disabled={i === form.images.length - 1}
                  onClick={() => moveImage(i, i + 1)}
                >
                  <Icon name="chevronRight" size={16} strokeWidth={2.8} />
                </button>
              </div>
            </div>
          ))}
          <label className="img-add">
            <Icon name="plus" size={24} />
            {uploading > 0 ? `Yuklanmoqda (${uploading})…` : 'Rasm qo‘shish'}
            <input type="file" accept="image/*" multiple onChange={onFiles} />
          </label>
        </div>
        <div className="url-row">
          <input
            className="input"
            placeholder="yoki rasm havolasi: https://…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button type="button" className="btn btn--soft btn--sm" onClick={addImageUrl}>
            <Icon name="link" size={16} /> Qo‘shish
          </button>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel__title">
          <Icon name="edit" size={18} /> Asosiy ma’lumot
        </h3>
        <div className="form-grid form-grid--2">
          <TextField label="Nomi (o‘zbekcha)" value={form.nameUz} onChange={(e) => set('nameUz', e.target.value)} error={err('nameUz', 'Nomini kiriting')} />
          <TextField label="Nomi (ruscha)" value={form.nameRu} onChange={(e) => set('nameRu', e.target.value)} placeholder="Bo‘sh bo‘lsa — o‘zbekchasi" />
          <TextField label="Brend" list="brand-list" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
          <SelectField
            label="Kategoriya"
            value={form.categoryId}
            onChange={(e) => set('categoryId', Number(e.target.value))}
            error={err('categoryId', 'Kategoriyani tanlang')}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.nameUz}
              </option>
            ))}
          </SelectField>
          <TextField label="Rangi (o‘zbekcha)" value={form.colorUz} onChange={(e) => set('colorUz', e.target.value)} placeholder="oq/qora" />
          <TextField label="Rangi (ruscha)" value={form.colorRu} onChange={(e) => set('colorRu', e.target.value)} placeholder="белый/чёрный" />
        </div>
        <datalist id="brand-list">
          {brands.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
        <TextField
          label="Tartib raqami (kichigi oldinda)"
          inputMode="numeric"
          value={form.sortOrder}
          onChange={(e) => set('sortOrder', numOrEmpty(e.target.value))}
        />
        <Switch checked={form.isActive} onChange={(v) => set('isActive', v)} label="Faol" hint="O‘chirilsa mijozlarga ko‘rinmaydi" />
        <Switch checked={form.isNew} onChange={(v) => set('isNew', v)} label="NEW belgisi" />
      </section>

      <section className="panel">
        <h3 className="panel__title">
          <Icon name="card" size={18} /> Narxlar
        </h3>
        <div className="form-grid form-grid--2">
          <div className="price-box">
            <p className="price-box__title">
              <Flag region="uz" size={20} /> O‘zbekiston, $
              {offPercent(form.priceUsd, form.oldPriceUsd) > 0 && (
                <span className="price-box__off">−{offPercent(form.priceUsd, form.oldPriceUsd)}%</span>
              )}
            </p>
            <TextField label="Narx, $" inputMode="numeric" value={form.priceUsd} onChange={(e) => set('priceUsd', numOrEmpty(e.target.value))} error={err('priceUsd', 'Narxni kiriting')} />
            <TextField label="Eski narx, $ (ixtiyoriy)" inputMode="numeric" value={form.oldPriceUsd} onChange={(e) => set('oldPriceUsd', numOrEmpty(e.target.value))} />
          </div>
          <div className="price-box">
            <p className="price-box__title">
              <Flag region="kr" size={20} /> Koreya, ₩
              {offPercent(form.priceKrw, form.oldPriceKrw) > 0 && (
                <span className="price-box__off">−{offPercent(form.priceKrw, form.oldPriceKrw)}%</span>
              )}
            </p>
            <TextField label="Narx, ₩" inputMode="numeric" value={form.priceKrw} onChange={(e) => set('priceKrw', numOrEmpty(e.target.value))} error={err('priceKrw', 'Narxni kiriting')} />
            <TextField label="Eski narx, ₩ (ixtiyoriy)" inputMode="numeric" value={form.oldPriceKrw} onChange={(e) => set('oldPriceKrw', numOrEmpty(e.target.value))} />
            {form.priceKrw !== '' && <p className="field-hint">Mijozga: {formatMoney(Number(form.priceKrw), 'kr')}</p>}
          </div>
        </div>
      </section>

      <section className={cx('panel', errors.has('variants') && 'err-box')}>
        <h3 className="panel__title">
          <Icon name="ruler" size={18} /> O‘lchamlar va zaxira
          <span className="pill" style={{ marginLeft: 'auto' }}>
            Jami: {totalStock} ta
          </span>
        </h3>
        <div className="vlist">
          <div className="vrow vrow__head">
            <span>O‘lcham (mm)</span>
            <span>Zaxira, ta</span>
            <span />
          </div>
          {form.variants.map((v, i) => (
            <div key={v.id ?? `new-${i}`} className="vrow">
              <input className="input" value={v.label} onChange={(e) => setVariant(i, { label: e.target.value })} aria-label="O‘lcham" />
              <input
                className="input"
                inputMode="numeric"
                value={v.stock}
                onChange={(e) => setVariant(i, { stock: numOrEmpty(e.target.value) })}
                aria-label="Zaxira"
              />
              <button
                type="button"
                className="icon-btn"
                aria-label="O‘lchamni o‘chirish"
                onClick={() => set('variants', form.variants.filter((_, k) => k !== i))}
              >
                <Icon name="trash" size={17} />
              </button>
            </div>
          ))}
        </div>
        {errors.has('variants') && <p className="field__error">Kamida bitta o‘lcham; o‘lchamlar takrorlanmasin, zaxira — son</p>}
        <div className="quick">
          <button type="button" className="chip" onClick={() => set('variants', [...form.variants, { label: '', stock: 0 }])}>
            <Icon name="plus" size={14} /> O‘lcham
          </button>
          <button type="button" className="chip" onClick={addSizeRun}>
            240–285 mm
          </button>
          <span className="quick__fill">
            <button
              type="button"
              className="chip"
              onClick={() => fillValue !== '' && set('variants', form.variants.map((v) => ({ ...v, stock: fillValue })))}
            >
              Hammasiga
            </button>
            <input className="input" inputMode="numeric" value={fillValue} onChange={(e) => setFillValue(numOrEmpty(e.target.value))} aria-label="Hammasiga zaxira" />
            ta
          </span>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel__title">
          <Icon name="info" size={18} /> Tavsif
        </h3>
        <p className="panel__hint">Har bir qator — mijozga alohida band bo‘lib ko‘rinadi.</p>
        <TextArea label="O‘zbekcha" rows={4} value={form.descUz} onChange={(e) => set('descUz', e.target.value)} />
        <TextArea label="Ruscha" rows={4} value={form.descRu} onChange={(e) => set('descRu', e.target.value)} />
      </section>
    </Modal>
  );
}
