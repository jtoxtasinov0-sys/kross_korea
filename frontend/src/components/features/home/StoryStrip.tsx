'use client';

// Storylar — yumaloq burchakli vertikal mini-kartalar (9:16)
import { useEffect, useState } from 'react';
import { Img } from '@/components/ui/Img';
import { pick } from '@/lib/i18n';
import { STORAGE } from '@/lib/constants';
import { cx } from '@/lib/utils';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';

export function readSeenStories(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.storiesSeen) || '[]');
  } catch {
    return [];
  }
}

export function markStorySeen(id: number) {
  try {
    const seen = new Set(readSeenStories());
    seen.add(id);
    localStorage.setItem(STORAGE.storiesSeen, JSON.stringify([...seen].slice(-100)));
  } catch {
    // saqlab bo'lmasa — muhim emas
  }
}

export function StoryStrip() {
  const stories = useCatalog((s) => s.catalog?.stories ?? []);
  const lang = usePrefs((s) => s.lang);
  const layers = useUi((s) => s.layers);
  const push = useUi((s) => s.push);
  const [seen, setSeen] = useState<number[]>([]);

  // Story yopilganda ko'rilganlar yangilansin
  useEffect(() => {
    setSeen(readSeenStories());
  }, [layers.length]);

  if (!stories.length) return null;
  return (
    <div className="stories" role="list">
      {stories.map((s, i) => (
        <button
          key={s.id}
          type="button"
          role="listitem"
          className={cx('story-card', seen.includes(s.id) && 'story-card--seen')}
          onClick={() => push({ kind: 'story', index: i })}
        >
          <Img src={s.imageUrl} width={240} alt="" />
          <span className="story-card__title">{pick(s, 'title', lang)}</span>
        </button>
      ))}
    </div>
  );
}
