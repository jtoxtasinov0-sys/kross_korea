// Forma maydonlari: yorliq + input/select/textarea + xato matni
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cx } from '@/lib/utils';

interface Base {
  label: string;
  error?: string | false;
}

export function TextField({ label, error, className, ...props }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className={cx('input', error && 'input--error', className)} aria-invalid={!!error} {...props} />
      {error && <p className="field__error">{error}</p>}
    </label>
  );
}

export function SelectField({
  label,
  error,
  children,
  className,
  ...props
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select className={cx('input', error && 'input--error', className)} aria-invalid={!!error} {...props}>
        {children}
      </select>
      {error && <p className="field__error">{error}</p>}
    </label>
  );
}

export function TextArea({ label, error, className, ...props }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <textarea className={cx('input', error && 'input--error', className)} aria-invalid={!!error} {...props} />
      {error && <p className="field__error">{error}</p>}
    </label>
  );
}
