'use client';

// Bosh sahifa tepasi: logo, bo'lim ($ / ₩) va til tugmalari
import { api } from '@/lib/api';
import { haptic } from '@/lib/telegram';
import { usePrefs, useRegion } from '@/store/prefsStore';
import { Flag } from '@/components/ui/Flag';

export function Header() {
  const region = useRegion();
  const lang = usePrefs((s) => s.lang);
  const setLang = usePrefs((s) => s.setLang);

  const toggleLang = () => {
    const next = lang === 'uz' ? 'ru' : 'uz';
    haptic.select();
    setLang(next);
    api.updateMe({ language: next }).catch(() => {});
  };

  // Bo'limni almashtirish — tanlash ekrani qaytadan ochiladi
  const changeRegion = () => {
    haptic.tap();
    usePrefs.setState({ region: null });
  };

  return (
    <header className="topbar">
      <div className="brand">
        <img className="brand__logo" src="/images/icon-192.png" alt="" width={38} height={38} />
        <span className="brand__name">
          KROSS
          <br />
          <span>KOREA</span>
        </span>
      </div>
      <div className="topbar__actions">
        <button type="button" className="pill-btn" onClick={changeRegion} aria-label="Bo'lim">
          <Flag region={region} size={20} /> {region === 'uz' ? '$' : '₩'}
        </button>
        <button type="button" className="pill-btn" onClick={toggleLang} aria-label="Til">
          {lang === 'uz' ? 'UZ' : 'RU'}
        </button>
      </div>
    </header>
  );
}
