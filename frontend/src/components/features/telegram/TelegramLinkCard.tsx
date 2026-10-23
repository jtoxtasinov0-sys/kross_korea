'use client';

// Saytda (Telegramsiz) — botga ulash kartasi: bosilsa bot ochiladi, buyurtma xabarlari o'sha chatga keladi.
// Telegram ichida session.telegram yo'q — karta ko'rinmaydi.
import { Icon } from '@/components/ui/Icon';
import { useT } from '@/lib/i18n';
import { haptic } from '@/lib/telegram';
import { cx } from '@/lib/utils';
import { useCatalog } from '@/store/catalogStore';

export function TelegramLinkCard() {
  const t = useT();
  const link = useCatalog((s) => s.session?.telegram);
  if (!link) return null;

  return (
    <section className={cx('tg-link', link.linked && 'tg-link--on')}>
      <span className="tg-link__ico" aria-hidden="true">
        <Icon name={link.linked ? 'check' : 'send'} size={22} strokeWidth={link.linked ? 3 : 2.2} />
      </span>
      <div className="tg-link__body">
        <p className="tg-link__title">{t(link.linked ? 'tg.onTitle' : 'tg.title')}</p>
        <p className="tg-link__sub">{t(link.linked ? 'tg.onSub' : 'tg.sub')}</p>
      </div>
      <a
        className={cx('btn btn--sm', link.linked ? 'btn--soft' : 'btn--primary')}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic.tap()}
      >
        {t(link.linked ? 'tg.open' : 'tg.connect')}
      </a>
    </section>
  );
}
