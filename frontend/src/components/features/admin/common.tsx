'use client';

// Admin panel umumiy qismlari: holat belgisi, modal, kalit, ikki bosqichli tasdiq, toast, xato matnlari
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { OrderStatus } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { AdminApiError } from '@/lib/adminApi';
import { cx } from '@/lib/utils';
import { useAdmin } from '@/store/adminStore';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "To'lov kutilmoqda",
  RECEIPT_SENT: 'Chek keldi',
  CONFIRMED: 'Tasdiqlandi',
  SHIPPED: "Yo'lda",
  DELIVERED: 'Yetkazildi',
  CANCELLED: 'Bekor qilindi',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cx('status', `status--${status}`)}>{STATUS_LABEL[status]}</span>;
}

/** Server xatosini o'zbekcha tushunarli matnga aylantirish */
export function errorText(err: unknown): string {
  if (!(err instanceof AdminApiError)) return 'Xatolik yuz berdi';
  switch (err.code) {
    case 'network':
      return 'Server bilan aloqa yo‘q. Internetni tekshirib, qayta urining';
    case 'validation':
      return 'Ba’zi maydonlar noto‘g‘ri to‘ldirilgan — qizil bilan belgilandi';
    case 'stock':
      return `Zaxira yetarli emas: ${String(err.data.name ?? '')} ${String(err.data.variant ?? '')}`;
    case 'not_found':
      return 'Topilmadi — sahifani yangilang';
    case 'file_too_large':
      return 'Rasm juda katta (8 MB dan oshmasin)';
    case 'not_image':
      return 'Faqat rasm yuklash mumkin (JPG, PNG, WEBP)';
    default:
      return err.status >= 500 ? 'Serverda xatolik. Birozdan keyin urining' : 'Xatolik yuz berdi';
  }
}

/** Server qaytargan xato maydonlar ro'yxati */
export const errorFields = (err: unknown) =>
  new Set(err instanceof AdminApiError && Array.isArray(err.data.fields) ? (err.data.fields as string[]) : []);

interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  right?: ReactNode;
}

export function Modal({ title, onClose, children, footer, right }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.classList.add('locked');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('locked');
    };
  }, [onClose]);

  return (
    <>
      <div className="amodal-back" onClick={onClose} />
      <div className="amodal" role="dialog" aria-modal="true">
        <header className="amodal__head">
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Yopish">
            <Icon name="close" size={20} />
          </button>
          <h2 className="amodal__title">{title}</h2>
          {right}
        </header>
        <div className="amodal__body">{children}</div>
        {footer && <footer className="amodal__foot">{footer}</footer>}
      </div>
    </>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}

export function Switch({ checked, onChange, label, hint }: SwitchProps) {
  return (
    <label className="toggle">
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

interface ConfirmProps {
  onConfirm: () => void;
  children: ReactNode;
  confirmText: string;
  className?: string;
  disabled?: boolean;
}

/** Ikki bosqichli tugma: birinchi bosish — so'rov, 4 soniya ichida ikkinchi bosish — bajariladi */
export function ConfirmButton({ onConfirm, children, confirmText, className, disabled }: ConfirmProps) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={cx('btn', armed ? 'btn--danger' : className)}
      disabled={disabled}
      onClick={() => {
        if (armed) {
          clearTimeout(timer.current);
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 4000);
      }}
    >
      {armed ? confirmText : children}
    </button>
  );
}

export function AdminToast() {
  const toast = useAdmin((s) => s.toast);
  const clear = useAdmin((s) => s.clearToast);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(clear, toast.tone === 'error' ? 5000 : 3000);
    return () => clearTimeout(id);
  }, [toast, clear]);
  if (!toast) return null;
  return (
    <div className={cx('toast toast--plain', toast.tone === 'error' && 'toast--error')} role="status" key={toast.id}>
      <span>{toast.text}</span>
    </div>
  );
}

/** Raqamli maydon qiymati: bo'sh — '', aks holda butun son */
export const numOrEmpty = (value: string): number | '' => {
  const digits = value.replace(/[^\d]/g, '');
  return digits === '' ? '' : Number(digits);
};
