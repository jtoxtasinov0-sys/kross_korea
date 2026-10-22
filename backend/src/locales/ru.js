// Тексты бота — русский

export default {
  welcome: ({ name, hasApp }) =>
    `👟 <b>Привет, ${name}!</b>\n\n` +
    `<b>KROSS KOREA</b> — оригинальные кроссовки из официальных магазинов Кореи.\n\n` +
    `🇺🇿 <b>В Узбекистан</b> — цены в $, доставка 10–20 дней\n` +
    `🇰🇷 <b>По Корее</b> — цены в ₩, быстро через 택배\n\n` +
    `💳 Оплата — переводом на банковскую карту.\n` +
    (hasApp ? 'Открывайте магазин и выбирайте свою пару 👇' : '🛠 Магазин скоро откроется прямо здесь!'),

  btnShop: '🛍 Открыть магазин',
  btnOrders: '📦 Мои заказы',
  btnContact: '💬 Связь',
  btnInstagram: '📸 Instagram',
  btnChannel: '📣 Канал',
  btnAsk: '💬 Задать вопрос',
  btnBack: '◀️ Меню',

  askPhone: '📱 Отправьте номер телефона, чтобы мы сообщали о статусе заказа, — нажмите кнопку ниже.',
  btnSendPhone: '📱 Отправить номер',
  phoneSaved: '✅ Спасибо! Номер сохранён.',
  phoneNotYours: 'Пожалуйста, отправьте свой номер через кнопку 🙏',

  contact: ({ phone }) =>
    `💬 <b>Связаться с нами</b>\n\n📞 <code>${phone}</code> — Telegram / WhatsApp\n\n` +
    'Напишите вопрос — ответим быстро. Говорим по-узбекски и по-русски!',
  btnWhatsapp: '🟢 WhatsApp',

  noOrders: 'Заказов пока нет. Откройте магазин и выберите первую пару 👟',
  ordersTitle: '📦 <b>Ваши последние заказы</b>',

  status: {
    PENDING_PAYMENT: '⏳ Ожидает оплаты',
    RECEIPT_SENT: '🧾 Чек на проверке',
    CONFIRMED: '✅ Подтверждён',
    SHIPPED: '🚚 В пути',
    DELIVERED: '🎉 Доставлен',
    CANCELLED: '✖️ Отменён',
  },

  orderCreated: ({ number, items, total, prepayLine, bank, card, holder }) =>
    `🎉 <b>Заказ принят!</b>\n№ <code>${number}</code>\n\n${items}\n\n` +
    `💰 Итого: <b>${total}</b>\n${prepayLine}\n\n` +
    `💳 <b>Переведите на карту:</b>\n${bank}\n<code>${card}</code>\n${holder}\n\n` +
    'После оплаты отправьте скриншот чека в этот чат или загрузите в приложении 📸',
  prepayFull: 'Оплата: полная сумма',
  prepayPart: ({ amount, percent }) => `Сейчас оплачивается: <b>${amount}</b> (${percent}%), остальное — при получении`,

  receiptOk: ({ number }) => `🧾 Чек получен! Заказ <code>${number}</code> скоро подтвердим.`,
  receiptNoOrder: ({ phone }) =>
    `🤔 Неоплаченный заказ не найден — не смогли прикрепить чек.\nВопросы: <code>${phone}</code>`,

  statusConfirmed: ({ number }) => `✅ Заказ <code>${number}</code> подтверждён! Скоро отправим.`,
  statusShipped: ({ number, tracking }) =>
    `🚚 Заказ <code>${number}</code> в пути!` + (tracking ? `\nТрек-номер: <code>${tracking}</code>` : ''),
  statusDelivered: ({ number }) => `🎉 Заказ <code>${number}</code> доставлен. С обновкой! 👟`,
  statusCancelled: ({ number }) => `✖️ Заказ <code>${number}</code> отменён. Если есть вопросы — пишите.`,
};
