'use client';

// Bosh sahifa tepasi — bento: 1 katta (eng katta chegirma) + 2 kichik blok
import type { Product } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { useT } from '@/lib/i18n';
import { useUi } from '@/store/uiStore';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs, useRegion } from '@/store/prefsStore';

interface Props {
  top: Product | undefined;
  maxOff: number;
}

export function HeroBento({ top, maxOff }: Props) {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const region = useRegion();
  const openProduct = useUi((s) => s.openProduct);
  const openCatalog = useUi((s) => s.openCatalog);
  const push = useUi((s) => s.push);
  const days = useCatalog((s) => s.catalog?.settings.regions[region].deliveryDays ?? '');

  return (
    <section className="bento" aria-label={t('hero.title')}>
      <button
        type="button"
        className="bento__big"
        onClick={() => (top ? openProduct(top.id) : openCatalog({ categoryId: null }))}
      >
        <span className="bento__title">{t('hero.title')}</span>
        {maxOff > 0 && (
          <>
            {/* uz: "−60% gacha", ru: "до −60%" */}
            {lang === 'ru' && <span className="bento__upto">{t('hero.upto')}</span>}
            <span className="bento__pct">−{maxOff}%</span>
            {lang === 'uz' && <span className="bento__upto">{t('hero.upto')}</span>}
          </>
        )}
        {top && (
          <span className="bento__img">
            <Img src={top.images} width={480} alt="" eager />
          </span>
        )}
      </button>

      <button type="button" className="bento__tile bento__tile--a" onClick={() => openCatalog({ categoryId: null })}>
        <Icon name="shield" size={22} className="bento__tile-icon" />
        <span className="bento__tile-big">100%</span>
        <span className="bento__tile-sub">
          {t('hero.original')}
          <br />
          {t('hero.originalSub')}
        </span>
      </button>

      <button type="button" className="bento__tile bento__tile--b" onClick={() => push({ kind: 'contact' })}>
        <Icon name="truck" size={22} className="bento__tile-icon" />
        <span className="bento__tile-big">{days}</span>
        <span className="bento__tile-sub">
          {t('hero.days')} · {t('hero.delivery')}
        </span>
      </button>
    </section>
  );
}
