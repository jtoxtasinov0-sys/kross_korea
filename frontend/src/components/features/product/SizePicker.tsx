'use client';

// O'lcham tanlash (mm + EU) va o'lcham jadvali
import { useState } from 'react';
import type { Variant } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { SIZE_TABLE } from '@/lib/constants';
import { useT } from '@/lib/i18n';
import { haptic } from '@/lib/telegram';
import { cx } from '@/lib/utils';

interface Props {
  variants: Variant[];
  value: number | null;
  onChange: (id: number) => void;
  lowStock: number;
  shake: number; // o'zgarsa — "o'lcham tanlang" silkinishi
}

export function SizePicker({ variants, value, onChange, lowStock, shake }: Props) {
  const t = useT();
  const [table, setTable] = useState(false);
  const selected = variants.find((v) => v.id === value);

  return (
    <div>
      <div className="ps__row">
        <span className="ps__label">{t('product.size')}, mm</span>
        <button type="button" className="link-btn" onClick={() => setTable((x) => !x)} aria-expanded={table}>
          <Icon name="ruler" size={16} /> {t('product.sizeTable')}
        </button>
      </div>

      <div className={cx('sizes', shake > 0 && 'sizes--shake')} key={shake} role="radiogroup" aria-label={t('product.size')}>
        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={v.id === value}
            disabled={v.stock <= 0}
            className={cx('size', v.id === value && 'size--on')}
            onClick={() => {
              haptic.select();
              onChange(v.id);
            }}
          >
            {v.label}
            {SIZE_TABLE[v.label] && <small>EU {SIZE_TABLE[v.label].eu}</small>}
            {v.stock > 0 && v.stock < lowStock && <span className="size__low" aria-hidden="true" />}
          </button>
        ))}
      </div>

      {selected && selected.stock > 0 && selected.stock < lowStock && (
        <p className="warn-line">🔥 {t('stock.left', { n: selected.stock })}</p>
      )}

      {table && (
        <>
          <table className="size-table">
            <thead>
              <tr>
                <th>mm</th>
                <th>EU</th>
                <th>US</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id}>
                  <td>{v.label}</td>
                  <td>{SIZE_TABLE[v.label]?.eu ?? '—'}</td>
                  <td>{SIZE_TABLE[v.label]?.us ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="size-note">{t('product.sizeNote')}</p>
        </>
      )}
    </div>
  );
}
