'use client';

// Birinchi kirishda bosh sahifadagi yopiladigan "Xush kelibsiz" kartasi (alohida tanishtiruv yo'q)
import { Icon } from '@/components/ui/Icon';
import { useT } from '@/lib/i18n';
import { usePrefs } from '@/store/prefsStore';

export function WelcomeCard() {
  const t = useT();
  const dismissed = usePrefs((s) => s.welcomeDismissed);
  const dismiss = usePrefs((s) => s.dismissWelcome);
  if (dismissed) return null;

  return (
    <section className="welcome">
      <p className="welcome__title">{t('welcome.title')}</p>
      <div className="welcome__steps">
        {(['welcome.1', 'welcome.2', 'welcome.3'] as const).map((key, i) => (
          <div key={key} className="welcome__step">
            <span className="welcome__num">{i + 1}</span>
            {t(key)}
          </div>
        ))}
      </div>
      <button type="button" className="welcome__close" onClick={dismiss} aria-label="Yopish">
        <Icon name="close" size={16} strokeWidth={2.6} />
      </button>
    </section>
  );
}
