# KROSS KOREA 🇰🇷

Koreyadan original krossovkalar — Telegram Mini App va bot.
Mijoz ilovaga kirganda **bo'lim** tanlaydi: 🇺🇿 **O'zbekiston** (narxlar `$`, 10–20 kunda yetkazish)
yoki 🇰🇷 **Koreya** (narxlar `₩`, 택배). Narx, yetkazish va to'lov kartasi shu bo'limga qarab chiqadi.
To'lov — faqat bank kartasiga o'tkazma, har bo'lim uchun alohida karta.

## Dizayn DNK

| # | O'q | Tanlov |
|---|---|---|
| 1 | Kayfiyat | premium yumshoq lavanda — shisha (glass) kartalar, gradientlar, jonli fon |
| 2 | Shrift | Manrope (lotin + kirill) |
| 3 | Burchaklar | pill tugmalar + 20–28 px kartalar |
| 4 | Bosh sahifa tepasi | salomlashish + avatar, 3 ta shisha statistika kartasi + gradient chegirma kartasi |
| 5 | Navigatsiya | suzuvchi shisha panel: 4 tugma + o'rtada gradient savat tugmasi |
| 6 | Mahsulot kartasi | ichki yumaloq 1:1 rasm, narx rasm ustida shisha teg |
| 7 | Kategoriyalar | aylanuvchi gradient halqali doiralar |
| 8 | Savatga qo'shildi | savat tugmasi sakraydi + rangli zarrachalar |
| 9 | Story | vertikal 9:16 mini-kartalar, gradient chegara |
| 10 | Splash + tanishtiruv | halqali logo + harfma-harf yozuv; tanishtiruv yo'q — bo'lim tanlash + "Xush kelibsiz" kartasi |
| 11 | Bezak | suzuvchi rangli dog'lar (aurora), yaltiroq nur (sheen) |
| 12 | Ikonkalar | qalin 2 px, yumaloq uchlar, rangli fon-plitkalarda |
| 13 | Animatsiya | silliq "prujinali": kirish, ko'rinishga kirganda paydo bo'lish, sanab chiqadigan sonlar |
| 14 | To'lov sahifasi | qog'oz chek (tishli qirra, shtrix-kod) |
| 15 | Profil | KROSS CLUB darajasi: Bronze / Silver / Gold, golografik yaltirash |

Ranglar (`frontend/src/styles/globals.css` → `:root`): binafsha `#6C5CE7` (urg'u, gradient `#9A8CFF → #5A72F5`),
moviy `#4A63E8`, marjon-pushti `#E33D66` (chegirma), shaftoli `#FF7A4D`, matn `#1C1E3F`, fon lavanda `#EEF0FB`.

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
│       ├── app/             layout, sahifa, admin/ (panel), PWA manifest
│       ├── components/      ui/ · features/ (ekranlar, admin/) · layout/
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
   `npm run dev` faqat `src/` dagi o'zgarishlarda serverni qayta ishga tushiradi.
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

## Admin panel

Manzil: **`/admin`** (kompyuterda: http://localhost:3000/admin).

- **Kirish:** brauzerda — parol bilan (5 marta xato → 15 daqiqa blok). Telegram ichida (`/panel` buyrug'i
  yoki yangi buyurtma xabaridagi tugma) — parolsiz, faqat adminlar uchun. `/panel` tugmasi do'kon internetga
  chiqarilgach (https manzil) ishlaydi.
- **Boshqaruv:** kutilayotgan buyurtmalar, kelgan cheklar, tushum ($ va ₩ alohida), mijozlar,
  eng ko'p sotilganlar, tugayotgan zaxira. Karta test qiymatda bo'lsa — ogohlantirish.
- **Buyurtmalar:** holat va bo'lim filtri, qidiruv (raqam, ism, telefon, @username), har 20 soniyada yangilanadi.
  Buyurtma oynasida: mijoz, manzil (nusxalash), mahsulotlar, chek rasmi, kuzatuv raqami, admin izohi.
  **Tasdiqlash → Jo'natildi → Yetkazildi** — har birida mijozga bot orqali avtomatik xabar.
  Bekor qilinsa zaxira qaytadi. Saytdan berilgan buyurtmada "telefon qiling" ogohlantirishi chiqadi.
- **Mahsulotlar:** yaratish, tahrirlash, o'chirish (ikki bosqichli tasdiq). Rasmlar: bir nechtasini yuklash,
  tartiblash, asosiy qilish, havola qo'shish. Nom va rang uz/ru, kategoriya, narx `$` va `₩` (eski narx bilan
  chegirma foizi), o'lchamlar va zaxira ("240–285 mm", "Hammasiga N ta" tugmalari), tavsif, Faol / NEW.
- **Ombor:** barcha o'lchamlar qoldig'i bitta ro'yxatda, +/− yoki qo'lda kiritish, "kam qolgan" / "tugagan"
  filtrlari, o'zgarganlar birdan saqlanadi. "Mijozga qoldiq soni ko'rinsin" kaliti.
- **Sozlamalar:** har bo'lim uchun alohida karta (bank, raqam, qabul qiluvchi), oldindan to'lov %, yetkazish
  narxi va muddati, so'm kursi; do'kon ochiq/yopiq, aloqa ma'lumotlari, "Biz haqimizda"; panel paroli
  (o'zgarsa boshqa qurilmalardagi eski kirishlar bekor bo'ladi), mini ilova va panel manzillari.

Har qanday o'zgarish mijozlar ilovasida darhol ko'rinadi.

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
- ✅ **2-bosqich:** admin panel — boshqaruv, buyurtmalar, mahsulotlar, ombor, karta rekvizitlari, sozlamalar;
  botda `/panel`.
- ⏳ **3-bosqich:** deploy (Vercel + backend server), "Ilovani o'rnatish", story va kategoriyalarni paneldan
  boshqarish, mijozlar ro'yxati, rassilka, manzilni qayta so'rash.

> ⚠️ Karta raqamlari hozircha **test qiymatlar** (`8600 1234 5678 9012`, `9430 1234 5678 9012`) —
> admin panel → Sozlamalar'da haqiqiysini kiriting. O'lcham va zaxira (har o'lchamdan 3 ta) taxminiy —
> admin panel → Ombor'da to'g'rilang.
