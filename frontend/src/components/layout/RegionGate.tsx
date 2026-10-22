'use client';

// Birinchi kirishda bo'lim tanlash: O'zbekiston ($) yoki Koreya (₩) — narx va to'lov shunga qarab
import type { Region } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { haptic } from '@/lib/telegram';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';
import { Flag } from '@/components/ui/Flag';

export function RegionGate() {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const setLang = usePrefs((s) => s.setLang);
  const setRegion = usePrefs((s) => s.setRegion);
  const regions = useCatalog((s) => s.catalog?.settings.regions);

  const choose = (region: Region) => {
    haptic.success();
    setRegion(region);
    useUi.getState().setTab('home');
    window.scrollTo(0, 0);
    api.updateMe({ region }).catch(() => {});
  };

  const cards: { region: Region; cur: string; lines: string[] }[] = [
    {
      region: 'uz',
      cur: '$',
      lines: [t('gate.uz.1'), t('gate.uz.2', { days: regions?.uz.deliveryDays ?? '10–20' }), t('gate.uz.3')],
    },
    {
      region: 'kr',
      cur: '₩',
      lines: [t('gate.kr.1'), t('gate.kr.2', { days: regions?.kr.deliveryDays ?? '1–3' }), t('gate.kr.3')],
    },
  ];

  return (
    <main className="gate">
      <div className="gate__top">
        <div className="brand">
          <img className="brand__logo" src="/images/icon-192.png" alt="" width={38} height={38} />
          <span className="brand__name">
            KROSS
            <br />
            <span>KOREA</span>
          </span>
        </div>
        <span className="seg">
          {(['uz', 'ru'] as const).map((l) => (
            <button key={l} type="button" className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </span>
      </div>

      <h1 className="gate__title">{t('gate.title')}</h1>
      <p className="gate__sub">{t('gate.sub')}</p>

      {cards.map((c) => (
        <button key={c.region} type="button" className={`gate__card gate__card--${c.region}`} onClick={() => choose(c.region)}>
          <span className="gate__cur" aria-hidden="true">
            {c.cur}
          </span>
          <span className="gate__name">
            <Flag region={c.region} size={36} />
            {t(`region.${c.region}`)}
          </span>
          <ul className="gate__list">
            {c.lines.map((line) => (
              <li key={line}>
                <Icon name="check" size={16} strokeWidth={3} /> {line}
              </li>
            ))}
          </ul>
          <span className="gate__go" aria-label={t('gate.go')}>
            <Icon name="arrowRight" size={22} strokeWidth={2.6} />
          </span>
        </button>
      ))}
    </main>
  );
}
