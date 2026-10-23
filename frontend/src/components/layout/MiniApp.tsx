'use client';

// Ilova karkasi: yuklash → splash → bo'lim tanlash → tablar + ustma-ust oynalar
import { useEffect, useState } from 'react';
import { Splash } from './Splash';
import { RegionGate } from './RegionGate';
import { BottomNav } from './BottomNav';
import { BotOnly, LoadError } from './StatusScreens';
import { Toast } from '@/components/ui/Toast';
import { HomeView } from '@/components/features/home/HomeView';
import { CatalogView } from '@/components/features/catalog/CatalogView';
import { CartView } from '@/components/features/cart/CartView';
import { FavoritesView } from '@/components/features/favorites/FavoritesView';
import { ProfileView } from '@/components/features/profile/ProfileView';
import { ProductSheet } from '@/components/features/product/ProductSheet';
import { ImageViewer } from '@/components/features/product/ImageViewer';
import { CheckoutView } from '@/components/features/checkout/CheckoutView';
import { PaymentView } from '@/components/features/payment/PaymentView';
import { OrdersView } from '@/components/features/orders/OrdersView';
import { StoryViewer } from '@/components/features/story/StoryViewer';
import { ContactSheet } from '@/components/features/contact/ContactSheet';
import { useTelegram } from '@/hooks/useTelegram';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/lib/i18n';
import { scrollToTop } from '@/lib/utils';
import { useCatalog } from '@/store/catalogStore';
import { usePrefs } from '@/store/prefsStore';
import { useUi, type Layer } from '@/store/uiStore';

const MIN_SPLASH_MS = 900;

function renderLayer(layer: Layer, i: number) {
  switch (layer.kind) {
    case 'product':
      return <ProductSheet key={i} id={layer.id} />;
    case 'viewer':
      return <ImageViewer key={i} images={layer.images} index={layer.index} />;
    case 'checkout':
      return <CheckoutView key={i} />;
    case 'payment':
      return <PaymentView key={i} orderId={layer.orderId} fresh={layer.fresh} />;
    case 'orders':
      return <OrdersView key={i} />;
    case 'story':
      return <StoryViewer key={i} index={layer.index} />;
    case 'contact':
      return <ContactSheet key={i} />;
  }
}

function Shell() {
  const tab = useUi((s) => s.tab);
  const layers = useUi((s) => s.layers);
  useBackButton();

  // Tab almashganda — tepaga
  useEffect(() => {
    scrollToTop();
  }, [tab]);

  // Oyna ochiq bo'lsa orqadagi sahifa aylanmasin
  useEffect(() => {
    document.body.classList.toggle('locked', layers.length > 0);
  }, [layers.length]);

  return (
    <div className="app">
      <main key={tab} className="tab-view">
        {tab === 'home' && <HomeView />}
        {tab === 'catalog' && <CatalogView />}
        {tab === 'cart' && <CartView />}
        {tab === 'favorites' && <FavoritesView />}
        {tab === 'profile' && <ProfileView />}
      </main>
      <BottomNav />
      {layers.map(renderLayer)}
      <Toast />
    </div>
  );
}

export function MiniApp() {
  const t = useT();
  const tg = useTelegram();
  const status = useCatalog((s) => s.status);
  const session = useCatalog((s) => s.session);
  const region = usePrefs((s) => s.region);
  const [mounted, setMounted] = useState(false);
  const [minSplash, setMinSplash] = useState(true);
  const [handledLinks, setHandledLinks] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setTimeout(() => setMinSplash(false), MIN_SPLASH_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (tg.ready && status === 'idle') useCatalog.getState().load();
  }, [tg.ready, status]);

  // Til va bo'lim: foydalanuvchi o'zi tanlamagan bo'lsa — serverdagi (Telegram tilidan) qiymat
  useEffect(() => {
    if (!session) return;
    const prefs = usePrefs.getState();
    if (!prefs.langChosen) prefs.setLang(session.user.language, false);
    if (!prefs.region && session.user.region) prefs.setRegion(session.user.region);
  }, [session]);

  // Bot havolalari: ?order=<id> (buyurtmalar) va startapp=product_<id>
  useEffect(() => {
    if (status !== 'ready' || !region || handledLinks) return;
    setHandledLinks(true);
    const orderId = Number(new URLSearchParams(window.location.search).get('order'));
    const product = /^product_(\d+)$/.exec(tg.startParam)?.[1];
    if (orderId) useUi.getState().push({ kind: 'orders' });
    else if (product) useUi.getState().openProduct(Number(product));
  }, [status, region, handledLinks, tg.startParam]);

  // Ilovaga qaytilganda katalog jimgina yangilanadi.
  // Saytda: botga ulanib qaytgan bo'lishi mumkin — sessiya ham (Telegram kartasi "ulangan" bo'lsin)
  useEffect(() => {
    const onVisible = () => {
      const state = useCatalog.getState();
      if (document.visibilityState !== 'visible' || state.status !== 'ready') return;
      state.refresh();
      if (state.session?.telegram && !state.session.telegram.linked) state.refreshSession();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  if (!mounted) return <Splash />;
  if (status === 'botOnly') return <BotOnly />;
  if (status === 'error') return <LoadError />;
  if (status !== 'ready' || minSplash) return <Splash note={status === 'waking' ? t('load.waking') : undefined} />;
  if (!region) return <RegionGate />;
  return <Shell />;
}
