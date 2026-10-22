// Boshlang'ich ma'lumotlar: kategoriyalar, mahsulot nomlari (uz/ru), tavsiflar, storylar.
// Narx va rasmlar MAHSULOTLAR/products.json dan olinadi.

export const CATEGORIES = [
  { slug: 'lifestyle', nameUz: 'Kundalik', nameRu: 'На каждый день', emoji: '👟', sortOrder: 1 },
  { slug: 'running', nameUz: 'Yugurish', nameRu: 'Бег', emoji: '🏃', sortOrder: 2 },
  { slug: 'airmax', nameUz: 'Air Max', nameRu: 'Air Max', emoji: '💨', sortOrder: 3 },
  { slug: 'football', nameUz: 'Futbol', nameRu: 'Футбол', emoji: '⚽', sortOrder: 4 },
];

// products.json dagi id → kategoriya
export const PRODUCT_CATEGORY = {
  running: ['01', '03', '05', '06', '07', '08', '09', '30', '31', '41', '49', '50', '51', '52', '53'],
  airmax: ['04', '10', '11', '12', '13', '18', '22', '39', '40', '44', '45', '46', '47'],
  football: ['34', '35', '36'],
  // qolganlari — lifestyle
};

// Model nomi o'zbekchada yozilgan bo'lsa — qisqa nom va ruschasi
export const MODEL_NAMES = {
  'ZoomX poyga krossovkasi': ['ZoomX poyga', 'ZoomX гоночные'],
  'ZoomX yugurish': ['ZoomX', 'ZoomX'],
  Yugurish: ['Yugurish krossovkasi', 'Беговые кроссовки'],
  'Futbol butsasi': ['Futbol butsasi', 'Бутсы'],
  'Alphafly 3 (taxminiy)': ['Alphafly 3', 'Alphafly 3'],
};

// Model nomi yo'q mahsulotlar uchun kategoriya bo'yicha umumiy nom
export const GENERIC_NAMES = {
  lifestyle: ['Kundalik krossovka', 'Повседневные кроссовки'],
  running: ['Yugurish krossovkasi', 'Беговые кроссовки'],
  airmax: ['Air Max', 'Air Max'],
  football: ['Futbol butsasi', 'Бутсы'],
};

export const COLOR_RU = {
  oq: 'белый',
  qora: 'чёрный',
  yashil: 'зелёный',
  "ko'k": 'синий',
  "to'q ko'k": 'тёмно-синий',
  sariq: 'жёлтый',
  "to'q sariq": 'оранжевый',
  salatrang: 'салатовый',
  kulrang: 'серый',
  havorang: 'голубой',
  jigarrang: 'коричневый',
  pushti: 'розовый',
  qizil: 'красный',
  kumush: 'серебристый',
};

const ORIGINAL_UZ = "100% original — Koreyadagi rasmiy do'kondan";
const ORIGINAL_RU = '100% оригинал — из официального магазина в Корее';
const SIZE_UZ = "O'lchamni tanlashdan oldin jadvalga qarang";
const SIZE_RU = 'Перед заказом сверьтесь с таблицей размеров';

export const DESCRIPTIONS = {
  lifestyle: {
    uz: [ORIGINAL_UZ, 'Har kunlik obraz uchun klassik dizayn', 'Jinsi, shim va shortik bilan mos tushadi', SIZE_UZ],
    ru: [ORIGINAL_RU, 'Классический дизайн на каждый день', 'Сочетаются с джинсами, брюками и шортами', SIZE_RU],
  },
  running: {
    uz: [ORIGINAL_UZ, "Yengil va yumshoq taglik — yugurish va mashg'ulot uchun", "Nafas oladigan to'r material", SIZE_UZ],
    ru: [ORIGINAL_RU, 'Лёгкая мягкая подошва — для бега и тренировок', 'Дышащий сетчатый верх', SIZE_RU],
  },
  airmax: {
    uz: [ORIGINAL_UZ, 'Air yostiqchasi — har qadamda yumshoqlik', "Kun bo'yi kiyish uchun qulay", SIZE_UZ],
    ru: [ORIGINAL_RU, 'Амортизация Air — мягкость на каждом шаге', 'Удобны, чтобы носить весь день', SIZE_RU],
  },
  football: {
    uz: [ORIGINAL_UZ, 'Maysa maydon uchun shipli taglik', "To'pni yaxshi his qilish uchun yupqa ust qism", SIZE_UZ],
    ru: [ORIGINAL_RU, 'Шипованная подошва для натурального газона', 'Тонкий верх для лучшего контроля мяча', SIZE_RU],
  },
};

// O'lchamlar (mm) — har biridan boshlang'ich zaxira. Haqiqiy qoldiq admin paneldan to'g'rilanadi.
export const SIZES_MM = [240, 245, 250, 255, 260, 265, 270, 275, 280, 285];
export const START_STOCK = 3;

// Eng so'nggi postlar — "NEW" belgisi bilan
export const NEW_IDS = ['01', '02', '03', '04', '05', '06'];

export const STORIES = [
  { productId: '05', titleUz: 'Pegasus −60% 🔥', titleRu: 'Pegasus −60% 🔥' },
  { productId: '01', titleUz: 'ZoomX — yugurish raketasi', titleRu: 'ZoomX — ракета для бега' },
  { productId: '26', titleUz: 'NB 530 har kunga', titleRu: 'NB 530 на каждый день' },
  { productId: '44', titleUz: 'Air Max 90 — klassika', titleRu: 'Air Max 90 — классика' },
  { productId: '34', category: 'football', titleUz: 'Futbol butsalari ⚽', titleRu: 'Бутсы ⚽' },
];

export const ABOUT = {
  uz: "KROSS KOREA — Koreyadagi rasmiy do'konlardan original krossovkalar. 5 000+ mijoz bizga ishonadi. Koreya ichida 택배 orqali, O'zbekistonga 10–20 kunda yetkazamiz.",
  ru: 'KROSS KOREA — оригинальные кроссовки из официальных магазинов Кореи. Нам доверяют 5 000+ клиентов. По Корее доставляем через 택배, в Узбекистан — за 10–20 дней.',
};
