'use client';

// Story ko'ruvchi: to'liq ekran, 5 soniyalik progress, chap/o'ng bosish, bosib turish = pauza, "Xarid qilish"
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { markStorySeen } from '@/components/features/home/StoryStrip';
import { pick, useT } from '@/lib/i18n';
import { openLink } from '@/lib/telegram';
import { cx, thumb } from '@/lib/utils';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';

const DURATION = 5000;

export function StoryViewer({ index }: { index: number }) {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const stories = useCatalog((s) => s.catalog?.stories ?? []);
  const categories = useCatalog((s) => s.catalog?.categories ?? []);
  const pop = useUi((s) => s.pop);
  const [current, setCurrent] = useState(index);
  const [paused, setPaused] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const story = stories[current];

  useEffect(() => {
    if (story) markStorySeen(story.id);
  }, [story]);

  const go = (dir: number) => {
    const next = current + dir;
    if (next < 0) return setCurrent(0);
    if (next >= stories.length) return pop();
    setCurrent(next);
  };

  if (!story) return null;

  const openLinkTarget = () => {
    const link = story.link || '';
    pop();
    if (link.startsWith('product:')) useUi.getState().openProduct(Number(link.slice(8)));
    else if (link.startsWith('category:')) {
      const cat = categories.find((c) => c.slug === link.slice(9));
      useUi.getState().openCatalog({ categoryId: cat?.id ?? null });
    } else if (link.startsWith('http')) openLink(link);
  };

  const holdStart = () => {
    holdTimer.current = setTimeout(() => setPaused(true), 180);
  };
  const holdEnd = (dir: number) => {
    clearTimeout(holdTimer.current);
    if (paused) setPaused(false);
    else go(dir);
  };

  return (
    <div className={cx('story', paused && 'story--paused')} role="dialog" aria-modal="true">
      <div className="story__bg" style={{ backgroundImage: `url(${thumb(story.imageUrl, 480)})` }} />
      <div className="story__bars">
        {stories.map((s, i) => (
          <span key={s.id} className={cx('story__bar', i < current && 'story__bar--done', i === current && 'story__bar--on')}>
            <i key={i === current ? `on-${current}` : 'x'} onAnimationEnd={() => i === current && go(1)} style={{ animationDuration: `${DURATION}ms` }} />
          </span>
        ))}
      </div>
      <div className="story__top">
        <span className="story__shop">
          KROSS <span style={{ color: 'var(--accent)' }}>KOREA</span>
        </span>
        <button type="button" className="story__close" onClick={pop} aria-label="Yopish">
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="story__img">
        <img src={thumb(story.imageUrl, 1080)} alt="" draggable={false} />
      </div>
      <button
        type="button"
        className="story__tap story__tap--l"
        aria-label="Oldingi"
        onPointerDown={holdStart}
        onPointerUp={() => holdEnd(-1)}
        onPointerLeave={() => clearTimeout(holdTimer.current)}
      />
      <button
        type="button"
        className="story__tap story__tap--r"
        aria-label="Keyingi"
        onPointerDown={holdStart}
        onPointerUp={() => holdEnd(1)}
        onPointerLeave={() => clearTimeout(holdTimer.current)}
      />
      <div className="story__foot">
        <p className="story__title">{pick(story, 'title', lang)}</p>
        {story.link && (
          <button type="button" className="btn btn--primary btn--block" onClick={openLinkTarget}>
            <Icon name="bag" size={20} /> {story.link.startsWith('product:') ? t('story.buy') : t('story.view')}
          </button>
        )}
      </div>
    </div>
  );
}
