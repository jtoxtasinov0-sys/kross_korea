# KROSS KOREA 🇰🇷

Koreyadan original krossovkalar — Telegram Mini App va bot.
Mijoz ilovaga kirganda **bo'lim** tanlaydi: 🇺🇿 **O'zbekiston** (narxlar `$`, 10–20 kunda yetkazish)
yoki 🇰🇷 **Koreya** (narxlar `₩`, 택배). Narx, yetkazish va to'lov kartasi shu bo'limga qarab chiqadi.
To'lov — faqat bank kartasiga o'tkazma, har bo'lim uchun alohida karta.

## Dizayn DNK

| # | O'q | Tanlov |
|---|---|---|
| 1 | Kayfiyat | **B** yorqin-yoshlarcha — qalin qora konturlar, "stiker" soyalar |
| 2 | Shrift | **B** Unbounded + Inter (lotin + kirill) |
| 3 | Burchaklar | **C** pill tugmalar + 16 px kartalar |
| 4 | Bosh sahifa tepasi | **B** bento-grid (1 katta + 2 kichik blok) |
| 5 | Navigatsiya | **B** 4 tugma + o'rtada katta savat tugmasi |
| 6 | Mahsulot kartasi | **A** 1:1 rasm, narx rasm ustida teg |
| 7 | Kategoriyalar | **A** doira ikonkalar tasmasi |
| 8 | Savatga qo'shildi | **B** savat tugmasi sakraydi + zarrachalar |
| 9 | Story | **A** vertikal 9:16 mini-kartalar |
| 10 | Splash + tanishtiruv | **C** tanishtiruv yo'q — bo'lim tanlash ekrani + "Xush kelibsiz" kartasi |
| 11 | Bezak | **C** geometrik diagonal chiziqlar |
| 12 | Ikonkalar | **C** qalin 2 px, yumaloq uchlar |
| 13 | Animatsiya | **B** tez va keskin (130–170 ms) |
| 14 | To'lov sahifasi | **A** qog'oz chek (tishli qirra, shtrix-kod) |
| 15 | Profil | **B** KROSS CLUB darajasi: Bronze / Silver / Gold |

Ranglar (`frontend/src/styles/globals.css` → `:root`): to'q sariq `#FF5A1F` (urg'u, ustida qora matn),
Koreya ko'ki `#0047A0`, Koreya qizili `#CD2E3A` (chegirma), sariq stiker `#FFD23F`, fon `#F1F2F6`.

## Tuzilma

```
kross_korea/
├── backend/                 Node.js — Telegram bot (grammY) + API (Express) + PostgreSQL (Neon)
│   ├── src/
│   │   ├── config/          sozlamalar va .env
│   │   ├── core/            bot, server, kesh, rasmlar, bildirishnomalar
│   │   ├── database/        ulanish, jadvallar, seed
│   │   ├── models/          baza sxemalari va so'rovlar
│   │   ├── controllers/     bot va API mantiqi (savat, buyurtma, chek...)
│   │   ├── routes/          API va bot handlerlari
│   │   ├── middlewares/     auth (Telegram initData), yuklash, cheklash
│   │   ├── locales/         bot matnlari (uz/ru)
│   │   ├── utils/           tugmalar, logger, format
│   │   └── index.js
│   ├── assets/banner.jpg    /start banneri
│   └── scripts/             ikonkalar, sinov skriptlari
├── frontend/                Next.js (App Router) + TypeScript + Zustand — Mini App
│   └── src/
│       ├── app/             layout, sahifa, PWA manifest
│       ├── components/      ui/ · features/ (ekranlar) · layout/
│       ├── hooks/           useTelegram, useCart...
│       ├── lib/             api, i18n (uz/ru), utils
│       ├── providers/       TelegramProvider
│       ├── store/           savat, sevimlilar, katalog, navigatsiya
│       └── styles/          globals.css, features.css
├── BREND/                   logo va brend ma'lumoti
└── MAHSULOTLAR/             products.json + rasmlar (seed manbasi)
```

## Kompyuterda ishga tushirish

1. **Backend** (port 4000):
   ```bash
   cd backend
   npm install
   ```
   `backend/.env.example` dan `backend/.env` yarating (DATABASE_URL, BOT_TOKEN, ADMIN_PASSWORD...), keyin:
   ```bash
   npm run db:seed
   npm run dev
   ```
2. **Frontend** (port 3000):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   `frontend/.env.local` ichida `BACKEND_URL=http://localhost:4000`. Brauzerda: http://localhost:3000

## Admin bo'lish

Botga yozing: `/admin PAROL` — parol `backend/.env` dagi `ADMIN_PASSWORD`.
Shundan keyin yangi buyurtmalar va cheklar sizga keladi, chek ostidagi **✅ Tasdiqlash** ishlaydi.

## Buyurtma jarayoni

1. Mijoz bo'lim → mahsulot → o'lcham → savat.
2. Ism, telefon (avtomatik format), manzil → Tasdiqlash.
3. Karta rekvizitlari (nusxa olish tugmalari bilan) → o'tkazma → chekni ilovada yuklaydi **yoki botga tashlaydi**.
4. Adminga chek rasmi + "✅ Tasdiqlash" → mijozga avtomatik xabar.

## Foydali buyruqlar (backend papkasida)

| Buyruq | Nima qiladi |
|---|---|
| `npm run db:seed -- --force` | Mahsulot va storylarni `MAHSULOTLAR/` dan qaytadan yozadi |
| `node scripts/clear-test-orders.js` | Brauzerdan berilgan sinov buyurtmalarini o'chiradi, zaxirani tiklaydi |
| `node scripts/bot-selftest.js` | Bot handlerlarini Telegram'ga ulanmasdan sinaydi |
| `npm run assets` | `BREND/logo.jpg` dan banner va ikonkalarni yasaydi |

## Holat

- ✅ **1-bosqich:** tuzilma, baza, katalog (53 mahsulot), mini ilova (bo'lim tanlash, katalog, savat,
  rasmiylashtirish, to'lov, buyurtmalar, profil, story), bot (menyu, til, chek, tasdiqlash).
- ⏳ **2-bosqich:** admin panel — buyurtmalar, mahsulotlar, ombor, karta rekvizitlari, sozlamalar.
- ⏳ **3-bosqich:** deploy (Vercel + backend server), "Ilovani o'rnatish", rassilka, manzilni qayta so'rash.

> ⚠️ Karta raqamlari hozircha **test qiymatlar** (`8600 1234 5678 9012`, `9430 1234 5678 9012`).
> O'lcham va zaxira (har o'lchamdan 3 ta) — taxminiy, admin panel tayyor bo'lgach to'g'rilanadi.
