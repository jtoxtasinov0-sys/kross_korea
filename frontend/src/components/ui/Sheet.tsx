'use client';

// Pastdan chiquvchi oyna: fonni bosish yoki pastga sudrash bilan yopiladi
import { useRef, type ReactNode, type TouchEvent } from 'react';
import { cx } from '@/lib/utils';
import { Icon } from './Icon';

interface Props {
  onClose: () => void;
  children: ReactNode;
  label: string;
  className?: string;
  floatingGrip?: boolean; // tutqich rasm ustida turadi
  showClose?: boolean;
}

const CLOSE_AT = 110;

export function Sheet({ onClose, children, label, className, floatingGrip, showClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; dy: number; active: boolean } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    if ((ref.current?.scrollTop ?? 0) > 0) return;
    const t = e.touches[0];
    drag.current = { x: t.clientX, y: t.clientY, dy: 0, active: false };
  };

  const onTouchMove = (e: TouchEvent) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    const t = e.touches[0];
    const dx = t.clientX - d.x;
    const dy = t.clientY - d.y;
    if (!d.active) {
      // Gorizontal surish (galereya) yoki yuqoriga — sudrash emas
      if (Math.abs(dx) > Math.abs(dy) || dy <= 0) {
        drag.current = null;
        return;
      }
      d.active = true;
    }
    d.dy = Math.max(0, dy);
    el.style.transition = 'none';
    el.style.transform = `translateY(${d.dy}px)`;
  };

  const onTouchEnd = () => {
    const d = drag.current;
    const el = ref.current;
    drag.current = null;
    if (!d?.active || !el) return;
    if (d.dy > CLOSE_AT) {
      el.style.transition = 'transform 140ms ease-in';
      el.style.transform = 'translateY(100%)';
      setTimeout(onClose, 130);
    } else {
      el.style.transition = 'transform 160ms ease-out';
      el.style.transform = '';
    }
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        ref={ref}
        className={cx('sheet', className)}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={cx('sheet__grip', floatingGrip && 'sheet__grip--float')} />
        {showClose && (
          <button type="button" className="icon-btn sheet__close" onClick={onClose} aria-label="Yopish">
            <Icon name="close" size={20} />
          </button>
        )}
        {children}
      </div>
    </>
  );
}
