'use client';

// Qisqa xabar: "Savatda! 👟 · Ko'rish"
import { useEffect } from 'react';
import { useUi } from '@/store/uiStore';
import { useT } from '@/lib/i18n';
import { cx } from '@/lib/utils';

export function Toast() {
  const toast = useUi((s) => s.toast);
  const hide = useUi((s) => s.hideToast);
  const setTab = useUi((s) => s.setTab);
  const t = useT();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(hide, 2400);
    return () => clearTimeout(id);
  }, [toast, hide]);

  if (!toast) return null;
  return (
    <div className={cx('toast', !toast.action && 'toast--plain')} role="status" key={toast.id}>
      <span>{toast.text}</span>
      {toast.action === 'cart' && (
        <button
          type="button"
          className="toast__btn"
          onClick={() => {
            hide();
            setTab('cart');
          }}
        >
          {t('toast.open')}
        </button>
      )}
    </div>
  );
}
