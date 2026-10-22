'use client';

// To'liq ekranli oynalar sarlavhasi: orqaga tugmasi + nom
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useUi } from '@/store/uiStore';

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const pop = useUi((s) => s.pop);
  return (
    <header className="screen__head">
      <button type="button" className="icon-btn" onClick={pop} aria-label="Orqaga">
        <Icon name="chevronLeft" size={22} strokeWidth={2.6} />
      </button>
      <h1 className="screen__title">{title}</h1>
      {right && <span style={{ marginLeft: 'auto' }}>{right}</span>}
    </header>
  );
}
