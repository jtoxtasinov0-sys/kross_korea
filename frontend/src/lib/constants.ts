// Ilova doimiylari: localStorage kalitlari, aloqa, viloyatlar, o'lcham jadvali

export const APP_VERSION = '0.1.0';

// Barcha localStorage kalitlari "kross-" bilan boshlanadi
export const STORAGE = {
  prefs: 'kross-prefs',
  cart: 'kross-cart',
  fav: 'kross-fav',
  guestId: 'kross-guest-id',
  storiesSeen: 'kross-stories-seen',
} as const;

export const CONTACT = {
  admins: ['krosss_korea', 'bilolkhank'],
};

export const LOW_STOCK = 3;
export const MAX_QTY = 5;

// O'zbekiston viloyatlari (manzil uchun)
export const UZ_PROVINCES: { uz: string; ru: string }[] = [
  { uz: 'Toshkent shahri', ru: 'г. Ташкент' },
  { uz: 'Toshkent viloyati', ru: 'Ташкентская обл.' },
  { uz: 'Andijon', ru: 'Андижан' },
  { uz: 'Buxoro', ru: 'Бухара' },
  { uz: "Farg'ona", ru: 'Фергана' },
  { uz: 'Jizzax', ru: 'Джизак' },
  { uz: 'Xorazm', ru: 'Хорезм' },
  { uz: 'Namangan', ru: 'Наманган' },
  { uz: 'Navoiy', ru: 'Навои' },
  { uz: 'Qashqadaryo', ru: 'Кашкадарья' },
  { uz: "Qoraqalpog'iston", ru: 'Каракалпакстан' },
  { uz: 'Samarqand', ru: 'Самарканд' },
  { uz: 'Sirdaryo', ru: 'Сырдарья' },
  { uz: 'Surxondaryo', ru: 'Сурхандарья' },
];

// Taxminiy o'lcham jadvali: oyoq uzunligi (mm) → EU / US (erkaklar)
export const SIZE_TABLE: Record<string, { eu: string; us: string }> = {
  '230': { eu: '36.5', us: '5' },
  '235': { eu: '37.5', us: '5.5' },
  '240': { eu: '38.5', us: '6' },
  '245': { eu: '39', us: '6.5' },
  '250': { eu: '40', us: '7' },
  '255': { eu: '40.5', us: '7.5' },
  '260': { eu: '41', us: '8' },
  '265': { eu: '42', us: '8.5' },
  '270': { eu: '42.5', us: '9' },
  '275': { eu: '43', us: '9.5' },
  '280': { eu: '44', us: '10' },
  '285': { eu: '44.5', us: '10.5' },
  '290': { eu: '45', us: '11' },
};

// Profil darajasi — xaridlar soniga qarab (faqat ko'rinish)
export const TIERS = [
  { key: 'bronze', name: 'BRONZE', from: 0 },
  { key: 'silver', name: 'SILVER', from: 2 },
  { key: 'gold', name: 'GOLD', from: 5 },
] as const;

export const trackingUrl = (number: string) =>
  `https://m.search.naver.com/search.naver?query=${encodeURIComponent(`${number} 택배조회`)}`;
