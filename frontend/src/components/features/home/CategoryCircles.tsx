'use client';

// Kategoriyalar — doira ikonkalar tasmasi, mahsulotlar soni bilan
import { Img } from '@/components/ui/Img';
import { pick } from '@/lib/i18n';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';

export function CategoryCircles() {
  const categories = useCatalog((s) => s.catalog?.categories ?? []);
  const lang = usePrefs((s) => s.lang);
  const openCatalog = useUi((s) => s.openCatalog);

  return (
    <div className="cats">
      {categories.map((c) => (
        <button key={c.id} type="button" className="cat" onClick={() => openCatalog({ categoryId: c.id })}>
          <span className="cat__ring">
            <span className="cat__img">
              <Img src={c.imageUrl} width={240} alt="" />
            </span>
            {c.emoji && <span className="cat__emoji">{c.emoji}</span>}
          </span>
          <span className="cat__name">{pick(c, 'name', lang)}</span>
          <span className="cat__count">{c.count}</span>
        </button>
      ))}
    </div>
  );
}
