'use client';

// Maxsus holatlar: brauzer kirishi yopiq ("botni oching") va ulanish xatosi
import { Empty } from '@/components/ui/Empty';
import { Icon } from '@/components/ui/Icon';
import { useT } from '@/lib/i18n';
import { useCatalog } from '@/store/catalogStore';

export function BotOnly() {
  const t = useT();
  const botUrl = useCatalog((s) => s.botUrl);
  return (
    <main className="center-screen">
      <Empty
        emoji="🤖"
        title={t('bot.title')}
        hint={t('bot.sub')}
        action={
          botUrl ? (
            <a className="btn btn--primary" href={botUrl}>
              <Icon name="send" size={20} /> {t('bot.open')}
            </a>
          ) : undefined
        }
      />
    </main>
  );
}

export function LoadError() {
  const t = useT();
  const load = useCatalog((s) => s.load);
  return (
    <main className="center-screen">
      <Empty
        emoji="📡"
        title={t('load.error')}
        action={
          <button type="button" className="btn btn--primary" onClick={() => load()}>
            {t('load.retry')}
          </button>
        }
      />
    </main>
  );
}
