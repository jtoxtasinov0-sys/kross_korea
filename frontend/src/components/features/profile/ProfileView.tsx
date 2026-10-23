'use client';

// Profil: KROSS CLUB darajasi (xaridlar soniga qarab), statistika, bo'lim, til, aloqa, ma'lumotlar
import { useState, type ReactNode } from 'react';
import type { Lang, Region } from '@/types';
import { Icon, type IconName } from '@/components/ui/Icon';
import { api } from '@/lib/api';
import { pick, useT } from '@/lib/i18n';
import { APP_VERSION, TIERS } from '@/lib/constants';
import { haptic } from '@/lib/telegram';
import { cx } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';
import { useTelegram } from '@/hooks/useTelegram';
import { useCatalog } from '@/store/catalogStore';
import { useFavStore } from '@/store/favStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';
import { Flag } from '@/components/ui/Flag';
import { TelegramLinkCard } from '@/components/features/telegram/TelegramLinkCard';

function TierCard({ name, purchases }: { name: string; purchases: number }) {
  const t = useT();
  // Eski Telegram WebView'larda findLastIndex yo'q — oddiy hisob
  const index = TIERS.reduce((found, tier, i) => (purchases >= tier.from ? i : found), 0);
  const tier = TIERS[index];
  const next = TIERS[index + 1];
  const progress = next ? (purchases - tier.from) / (next.from - tier.from) : 1;

  return (
    <section className={cx('tier', `tier--${tier.key}`)}>
      <div className="tier__top">
        <div>
          <p className="tier__club">{t('profile.club')}</p>
          <p className="tier__name">{tier.name}</p>
        </div>
        <span className="tier__badge" aria-hidden="true">
          {tier.key === 'gold' ? '👑' : tier.key === 'silver' ? '⚡' : '👟'}
        </span>
      </div>
      <div>
        <p className="tier__user">{name}</p>
        <div className="tier__bar" aria-hidden="true">
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="tier__hint">
          {next ? t('profile.next', { tier: next.name, n: next.from - purchases }) : t('profile.max')}
        </p>
      </div>
    </section>
  );
}

/** Statistika soni — 0 dan sanab chiqadi */
function Num({ n, delay }: { n: number; delay: number }) {
  return <b>{useCountUp(n, 900, delay)}</b>;
}

function MenuItem({ icon, label, value, onClick, children }: { icon: IconName; label: string; value?: ReactNode; onClick?: () => void; children?: ReactNode }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} className="menu__item" onClick={onClick}>
      <span className="menu__icon">
        <Icon name={icon} size={18} />
      </span>
      {label}
      {children ?? (
        <span className="menu__value">
          {value}
          {onClick && <Icon name="chevronRight" size={16} strokeWidth={2.6} />}
        </span>
      )}
    </Tag>
  );
}

export function ProfileView() {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const region = usePrefs((s) => s.region) ?? 'uz';
  const setLang = usePrefs((s) => s.setLang);
  const setRegion = usePrefs((s) => s.setRegion);
  const session = useCatalog((s) => s.session);
  const settings = useCatalog((s) => s.catalog?.settings);
  const favCount = useFavStore((s) => s.ids.length);
  const push = useUi((s) => s.push);
  const setTab = useUi((s) => s.setTab);
  const { user: tgUser } = useTelegram();
  const [open, setOpen] = useState<'delivery' | 'about' | null>(null);

  const user = session?.user;
  const name =
    [user?.firstName ?? tgUser?.first_name, user?.lastName ?? tgUser?.last_name].filter(Boolean).join(' ') ||
    t('profile.guest');
  const purchases = session?.stats.total ?? 0;

  const changeLang = (l: Lang) => {
    haptic.select();
    setLang(l);
    api.updateMe({ language: l }).catch(() => {});
  };
  const changeRegion = (r: Region) => {
    haptic.select();
    setRegion(r);
    api.updateMe({ region: r }).catch(() => {});
  };

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t('nav.profile')}</h1>
        {user?.username && <span className="page-count">@{user.username}</span>}
      </div>

      <TierCard name={name} purchases={purchases} />

      <div className="stats">
        <div className="stat">
          <Num n={purchases} delay={250} />
          <span>{t('profile.orders')}</span>
        </div>
        <div className="stat">
          <Num n={favCount} delay={320} />
          <span>{t('profile.favorites')}</span>
        </div>
        <div className="stat">
          <Num n={session?.stats.delivered ?? 0} delay={390} />
          <span>{t('profile.delivered')}</span>
        </div>
      </div>

      <TelegramLinkCard />

      <div className="menu">
        <MenuItem icon="box" label={t('orders.title')} onClick={() => push({ kind: 'orders' })} />
        <MenuItem icon="heart" label={t('profile.favorites')} value={favCount || undefined} onClick={() => setTab('favorites')} />
        <MenuItem icon="pin" label={t('profile.region')}>
          <span className="seg">
            {(['uz', 'kr'] as const).map((r) => (
              <button key={r} type="button" className={cx(region === r && 'on')} onClick={() => changeRegion(r)}>
                <Flag region={r} size={16} /> {r === 'uz' ? '$' : '₩'}
              </button>
            ))}
          </span>
        </MenuItem>
        <MenuItem icon="globe" label={t('profile.lang')}>
          <span className="seg">
            {(['uz', 'ru'] as const).map((l) => (
              <button key={l} type="button" className={cx(lang === l && 'on')} onClick={() => changeLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </span>
        </MenuItem>
      </div>

      <div className="menu">
        <MenuItem icon="chat" label={t('profile.contact')} onClick={() => push({ kind: 'contact' })} />
        <MenuItem
          icon="truck"
          label={t('profile.delivery')}
          onClick={() => setOpen(open === 'delivery' ? null : 'delivery')}
        />
        {open === 'delivery' && settings && (
          <p className="menu__text">
            {t('profile.deliveryText', {
              uzDays: settings.regions.uz.deliveryDays,
              uzPrepay: settings.regions.uz.prepay,
              krDays: settings.regions.kr.deliveryDays,
            })}
          </p>
        )}
        <MenuItem icon="info" label={t('profile.about')} onClick={() => setOpen(open === 'about' ? null : 'about')} />
        {open === 'about' && settings && <p className="menu__text">{pick(settings, 'about', lang)}</p>}
      </div>

      <p className="version">
        KROSS KOREA · {t('profile.version')} {APP_VERSION}
      </p>
    </>
  );
}
