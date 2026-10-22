'use client';

// Aloqa oynasi — ilovaning istalgan joyidan: WhatsApp, Telegram, qo'ng'iroq, raqamni nusxalash
import { Sheet } from '@/components/ui/Sheet';
import { Icon } from '@/components/ui/Icon';
import { useT } from '@/lib/i18n';
import { CONTACT } from '@/lib/constants';
import { copyText, haptic, openLink } from '@/lib/telegram';
import { useCatalog } from '@/store/catalogStore';
import { useUi } from '@/store/uiStore';

export function ContactSheet() {
  const t = useT();
  const pop = useUi((s) => s.pop);
  const settings = useCatalog((s) => s.catalog?.settings);
  if (!settings) return null;

  const digits = settings.phone.replace(/\D/g, '');
  const admins = [...new Set([settings.supportUsername, ...CONTACT.admins])];

  return (
    <Sheet onClose={pop} label={t('contact.title')}>
      <div className="contact">
        <h2 className="contact__title">{t('contact.title')}</h2>
        <p className="contact__sub">{t('contact.sub')}</p>
        <p className="contact__phone">{settings.phone}</p>

        <div className="contact__grid">
          <button type="button" className="contact__btn contact__btn--wa" onClick={() => openLink(`https://wa.me/${digits}`)}>
            <Icon name="chat" size={24} />
            {t('contact.whatsapp')}
          </button>
          <button type="button" className="contact__btn contact__btn--call" onClick={() => openLink(`tel:+${digits}`)}>
            <Icon name="phone" size={24} />
            {t('contact.call')}
          </button>
          {admins.map((u) => (
            <button key={u} type="button" className="contact__btn contact__btn--tg" onClick={() => openLink(`https://t.me/${u}`)}>
              <Icon name="send" size={24} />
              {t('contact.telegram')}
              <small>@{u}</small>
            </button>
          ))}
          <button
            type="button"
            className="contact__btn"
            onClick={async () => {
              if (await copyText(settings.phone)) {
                haptic.success();
                useUi.getState().showToast(t('toast.copied'));
              }
            }}
          >
            <Icon name="copy" size={24} />
            {t('contact.copy')}
          </button>
          <button type="button" className="contact__btn" onClick={() => openLink(settings.channelUrl)}>
            <Icon name="send" size={24} />
            {t('contact.channel')}
          </button>
          <button type="button" className="contact__btn" onClick={() => openLink(settings.instagramUrl)}>
            <Icon name="instagram" size={24} />
            {t('contact.instagram')}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
