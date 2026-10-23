// Bot matnlari — o'zbekcha. Ovoz: yoshlarcha, quvnoq, qisqa.

export default {
  welcome: ({ name, hasApp }) =>
    `👟 <b>Salom, ${name}!</b>\n\n` +
    `<b>KROSS KOREA</b> — Koreyadagi rasmiy do'konlardan original krossovkalar.\n\n` +
    `🇺🇿 <b>O'zbekistonga</b> — narxlar $ da, 10–20 kunda yetib keladi\n` +
    `🇰🇷 <b>Koreya ichida</b> — narxlar ₩ da, 택배 bilan tez\n\n` +
    `💳 To'lov — bank kartasiga o'tkazma.\n` +
    (hasApp ? "Do'konni oching va o'z juftligingizni tanlang 👇" : "🛠 Do'kon shu yerda tez orada ochiladi!"),

  // Bot profili: havola ulashilganda va profilda (≤120 belgi) / bo'sh chatda (≤512 belgi)
  botShort: "Koreyadan 100% original krossovkalar 👟 Nike, Adidas, New Balance, Puma. O'zbekiston va Koreyaga yetkazib beramiz.",
  botAbout:
    "👟 KROSS KOREA — Koreyadagi rasmiy do'konlardan 100% original krossovkalar: Nike, Adidas, New Balance, Puma.\n\n" +
    "🇺🇿 O'zbekistonga — narxlar $ da, 10–20 kunda\n" +
    '🇰🇷 Koreya ichida — narxlar ₩ da, 택배 bilan tez\n\n' +
    "💳 To'lov — bank kartasiga o'tkazma.\n" +
    "«Start» ni bosing va do'konni oching 👇",

  btnShop: "🛍 Do'konni ochish",
  btnOrders: '📦 Buyurtmalarim',
  btnContact: '💬 Aloqa',
  btnInstagram: '📸 Instagram',
  btnChannel: '📣 Kanal',
  btnAsk: '💬 Savol berish',
  btnBack: '◀️ Menyu',

  askPhone:
    "📱 Buyurtma holatini o'z vaqtida aytib turishimiz uchun telefon raqamingizni yuboring — pastdagi tugmani bosing.",
  btnSendPhone: '📱 Raqamni yuborish',
  phoneSaved: '✅ Rahmat! Raqam saqlandi.',
  phoneNotYours: "Iltimos, o'z raqamingizni tugma orqali yuboring 🙏",

  contact: ({ phone }) =>
    `💬 <b>Biz bilan aloqa</b>\n\n📞 <code>${phone}</code> — Telegram / WhatsApp\n\n` +
    "Savolingizni yozing — tez javob beramiz. O'zbek va rus tilida gaplashamiz!",
  btnWhatsapp: '🟢 WhatsApp',

  noOrders: "Hali buyurtma yo'q. Do'konni ochib, birinchi juftlikni tanlang 👟",
  ordersTitle: '📦 <b>Oxirgi buyurtmalaringiz</b>',

  status: {
    PENDING_PAYMENT: "⏳ To'lov kutilmoqda",
    RECEIPT_SENT: '🧾 Chek tekshirilmoqda',
    CONFIRMED: '✅ Tasdiqlandi',
    SHIPPED: "🚚 Yo'lda",
    DELIVERED: '🎉 Yetkazildi',
    CANCELLED: '✖️ Bekor qilindi',
  },

  orderCreated: ({ number, items, total, prepayLine, bank, card, holder }) =>
    `🎉 <b>Buyurtma qabul qilindi!</b>\n№ <code>${number}</code>\n\n${items}\n\n` +
    `💰 Jami: <b>${total}</b>\n${prepayLine}\n\n` +
    `💳 <b>Kartaga o'tkazing:</b>\n${bank}\n<code>${card}</code>\n${holder}\n\n` +
    "To'lagach chek skrinshotini shu chatga tashlang yoki ilovada yuklang 📸",
  prepayFull: "To'lov: to'liq summa",
  prepayPart: ({ amount, percent }) => `Hozir to'lanadi: <b>${amount}</b> (${percent}%), qolgani — yetkazilganda`,

  receiptOk: ({ number }) => `🧾 Chek qabul qilindi! <code>${number}</code> buyurtmasi tez orada tasdiqlanadi.`,
  receiptNoOrder: ({ phone }) =>
    `🤔 To'lanmagan buyurtma topilmadi — chekni biriktira olmadik.\nSavol bo'lsa: <code>${phone}</code>`,

  statusConfirmed: ({ number }) => `✅ <code>${number}</code> buyurtmangiz tasdiqlandi! Tez orada jo'natamiz.`,
  statusShipped: ({ number, tracking }) =>
    `🚚 <code>${number}</code> yo'lga chiqdi!` + (tracking ? `\nKuzatuv raqami: <code>${tracking}</code>` : ''),
  statusDelivered: ({ number }) => `🎉 <code>${number}</code> yetkazildi. Yangi juftlik muborak! 👟`,
  statusCancelled: ({ number }) => `✖️ <code>${number}</code> bekor qilindi. Savol bo'lsa — yozing.`,
};
