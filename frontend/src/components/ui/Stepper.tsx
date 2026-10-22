'use client';

// Miqdor: − 2 +
import { Icon } from './Icon';

interface Props {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}

export function Stepper({ value, min = 1, max, onChange }: Props) {
  return (
    <div className="stepper">
      <button type="button" aria-label="Kamaytirish" disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Icon name="minus" size={16} strokeWidth={2.6} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Ko'paytirish" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Icon name="plus" size={16} strokeWidth={2.6} />
      </button>
    </div>
  );
}
