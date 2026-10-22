// Bo'sh holat: stiker-emoji, sarlavha, izoh va tugma
import type { ReactNode } from 'react';

interface Props {
  emoji: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function Empty({ emoji, title, hint, action }: Props) {
  return (
    <div className="empty">
      <div className="empty__art" aria-hidden="true">
        {emoji}
      </div>
      <p className="empty__title">{title}</p>
      {hint && <p className="empty__hint">{hint}</p>}
      {action}
    </div>
  );
}
