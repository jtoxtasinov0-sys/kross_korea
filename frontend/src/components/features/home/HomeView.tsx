'use client';

// Bosh sahifa: salomlashish, qidiruv, bento, storylar, kategoriyalar, afzalliklar va tavsiyalar
import { useMemo } from 'react';
import type { Product, Region } from '@/types';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ProductCard } from '@/components/features/product/ProductCard';
import { ProductGrid } from '@/components/features/product/ProductGrid';
import { HeroBento } from './HeroBento';
import { StoryStrip } from './StoryStrip';
import { CategoryCircles } from './CategoryCircles';
import { DealsCarousel } from './DealsCarousel';
import { WelcomeCard } from './WelcomeCard';
import { useT } from '@/lib/i18n';
import { reveal } from '@/lib/reveal';
import { discountOf } from '@/lib/utils';
import { useCatalog } from '@/store/catalogStore';
import { useRegion } from '@/store/prefsStore';
import { useUi } from '@/store/uiStore';
import { useTelegram } from '@/hooks/useTelegram';

function greetingKey() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'greet.morning' as const;
  if (h >= 18 || h < 5) return 'greet.evening' as const;
  return 'greet.day' as const;
}

/** Eng katta chegirmalar — kategoriyalardan navbatma-navbat */
function pickDeals(products: Product[], region: Region, limit = 8) {
  const byCategory = new Map<number, Product[]>();
  products
    .filter((p) => p.inStock && discountOf(p, region) > 0)
    .sort((a, b) => discountOf(b, region) - discountOf(a, region))
    .forEach((p) => {
      if (!byCategory.has(p.categoryId)) byCategory.set(p.categoryId, []);
      byCategory.get(p.categoryId)!.push(p);
    });
  const queues = [...byCategory.values()];
  const result: Product[] = [];
  while (result.length < limit && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && result.length < limit) result.push(next);
    }
  }
  return result;
}

function Rail({ title, products, onMore }: { title: string; products: Product[]; onMore?: () => void }) {
  const t = useT();
  if (!products.length) return null;
  return (
    <section className="section rv" ref={reveal}>
      <div className="section__head">
        <h2 className="section__title">{title}</h2>
        {onMore && (
          <button type="button" className="link-btn" onClick={onMore}>
            {t('section.seeAll')} <Icon name="chevronRight" size={14} strokeWidth={2.8} />
          </button>
        )}
      </div>
      <div className="hscroll rail">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export function HomeView() {
  const t = useT();
  const region = useRegion();
  const catalog = useCatalog((s) => s.catalog);
  const session = useCatalog((s) => s.session);
  const openCatalog = useUi((s) => s.openCatalog);
  const { user: tgUser } = useTelegram();

  const products = catalog?.products ?? [];
  const firstName = session?.user.firstName || tgUser?.first_name || '';

  const data = useMemo(() => {
    const inStock = products.filter((p) => p.inStock);
    const deals = pickDeals(products, region);
    const top = deals[0];
    const maxOff = top ? discountOf(top, region) : 0;
    const fresh = inStock.filter((p) => p.isNew).slice(0, 10);
    const best = (catalog?.bestsellerIds ?? [])
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => !!p && p.inStock)
      .slice(0, 10);
    const sale = inStock
      .filter((p) => discountOf(p, region) > 0 && !deals.includes(p))
      .sort((a, b) => discountOf(b, region) - discountOf(a, region))
      .slice(0, 12);
    return { deals, top, maxOff, fresh, best, sale };
  }, [products, catalog?.bestsellerIds, region]);

  return (
    <>
      <Header />
      <div className="greet">
        <div>
          {firstName && <p className="greet__small">{t(greetingKey())}</p>}
          <h1 className="greet__hi">
            {firstName || t(greetingKey())} <span className="greet__wave">👋</span>
          </h1>
          <p className="greet__sub">{t('greet.sub')}</p>
        </div>
        <Avatar name={firstName} photo={tgUser?.photo_url} />
      </div>

      <button type="button" className="searchbar" onClick={() => openCatalog({ search: true })}>
        <Icon name="search" size={20} />
        {t('search.placeholder')}
      </button>

      {catalog && !catalog.settings.isOpen && <p className="closed-banner">{t('closed')}</p>}
      <WelcomeCard />
      <HeroBento top={data.top} maxOff={data.maxOff} total={products.length} />

      <section className="section" style={{ marginTop: 22 }}>
        <StoryStrip />
      </section>

      <section className="section rv" ref={reveal}>
        <div className="section__head">
          <h2 className="section__title">{t('section.categories')}</h2>
        </div>
        <CategoryCircles />
      </section>

      <section className="section rv" ref={reveal} style={{ marginTop: 18 }}>
        <div className="perks">
          <span className="perk">
            <Icon name="shield" size={18} /> {t('perk.original')}
          </span>
          <span className="perk">
            <Icon name="card" size={18} /> {t('perk.card')}
          </span>
          <span className="perk">
            <Icon name="chat" size={18} /> {t('perk.help')}
          </span>
        </div>
      </section>

      {data.deals.length > 0 && (
        <section className="section rv" ref={reveal}>
          <div className="section__head">
            <h2 className="section__title">{t('section.deals')}</h2>
          </div>
          <DealsCarousel products={data.deals} />
        </section>
      )}

      <Rail title={t('section.new')} products={data.fresh} onMore={() => openCatalog({ categoryId: null, sort: 'new' })} />
      <Rail title={t('section.best')} products={data.best} />

      {data.sale.length > 0 && (
        <section className="section">
          <div className="section__head rv" ref={reveal}>
            <h2 className="section__title">{t('section.sale')}</h2>
            <button type="button" className="link-btn" onClick={() => openCatalog({ categoryId: null, sort: 'default' })}>
              {t('section.seeAll')} <Icon name="chevronRight" size={14} strokeWidth={2.8} />
            </button>
          </div>
          <ProductGrid products={data.sale} />
        </section>
      )}
    </>
  );
}
