'use client';

// Bosh sahifa tepasi: 3 ta shisha statistika kartasi + gradient "eng katta chegirma" kartasi
import type { CSSProperties } from 'react';
import type { Product } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { Img } from '@/components/ui/Img';
import { pick, useT } from '@/lib/i18n';
import { useCountUp } from '@/hooks/useCountUp';
import { useUi } from '@/store/uiStore';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs, useRegion } from '@/store/prefsStore';

interface Props {
  top: Product | undefined;
  maxOff: number;
  total: number;
}

const delay = (i: number) => ({ ['--i' as string]: i }) as CSSProperties;

export function HeroBento({ top, maxOff, total }: Props) {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const region = useRegion();
  const openProduct = useUi((s) => s.openProduct);
  const openCatalog = useUi((s) => s.openCatalog);
  const push = useUi((s) => s.push);
  const days = useCatalog((s) => s.catalog?.settings.regions[region].deliveryDays ?? '');
  const hundred = useCountUp(100, 1000, 200);
  const pct = useCountUp(maxOff, 1200, 380);
  const models = useCountUp(total, 1000, 260);

  return (
    <>
      <section className="qstats" aria-label={t('hero.title')}>
        <button type="button" className="qstat" style={delay(0)} onClick={() => openCatalog({ categoryId: null })}>
          <span className="qstat__ico qstat__ico--violet">
            <Icon name="shield" size={18} />
          </span>
          <span className="qstat__big">{hundred}%</span>
          <span className="qstat__sub">{t('hero.orig')}</span>
        </button>
        <button type="button" className="qstat" style={delay(1)} onClick={() => push({ kind: 'contact' })}>
          <span className="qstat__ico qstat__ico--blue">
            <Icon name="truck" size={18} />
          </span>
          <span className="qstat__big">{days}</span>
          <span className="qstat__sub">
            {t('hero.days')} · {t('hero.delivery')}
          </span>
        </button>
        <button type="button" className="qstat" style={delay(2)} onClick={() => openCatalog({ categoryId: null })}>
          <span className="qstat__ico qstat__ico--peach">
            <Icon name="fire" size={18} />
          </span>
          <span className="qstat__big">{maxOff > 0 ? `−${pct}%` : models}</span>
          <span className="qstat__sub">{maxOff > 0 ? t('hero.sale') : t('hero.models')}</span>
        </button>
      </section>

      <button
        type="button"
        className="hero"
        onClick={() => (top ? openProduct(top.id) : openCatalog({ categoryId: null }))}
      >
        <svg className="hero__hills" viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 140 70 88l46 30 78-70 70 64 96-52v120H0z" />
          <path d="M0 168 92 118l64 36 84-52 58 34 62-24v68H0z" />
        </svg>
        <span className="hero__chip">
          <i>
            <Icon name="bolt" size={12} strokeWidth={2.6} />
          </i>
          {t('hero.title')}
        </span>
        {maxOff > 0 ? (
          <span className="hero__title">
            {/* uz: "−60% gacha", ru: "до −60%" */}
            {lang === 'ru' && <small>{t('hero.upto')} </small>}−{pct}%
            {lang === 'uz' && <small> {t('hero.upto')}</small>}
          </span>
        ) : (
          <span className="hero__title">{t('section.new')}</span>
        )}
        {top && (
          <span className="hero__sub">
            {top.brand} · {pick(top, 'name', lang)}
          </span>
        )}
        {maxOff > 0 && (
          <span className="hero__bar">
            <span className="hero__track">
              <i style={{ width: `${maxOff}%` }} />
            </span>
            <b>{pct}%</b>
          </span>
        )}
        <span className="hero__go" aria-hidden="true">
          <Icon name="chevronRight" size={20} strokeWidth={2.6} />
        </span>
        {top && (
          <span className="hero__img">
            <Img src={top.images} width={480} alt="" eager />
          </span>
        )}
      </button>
    </>
  );
}
