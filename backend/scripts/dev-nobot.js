// Lokal sinov uchun: backend haqiqiy botsiz ishga tushadi — Render'dagi bot bilan to'qnashuv (409) bo'lmaydi.
// Bot xabarlari yuborilmaydi (logda "xabar yetmadi"), lekin bot havolalari @kross_korea_bot nomi bilan yasaladi.
//   npm run dev:nobot
process.env.BOT_TOKEN = '0:local-nobot';

const { bot } = await import('../src/core/bot.js');
// getMe chaqirilmasin — bot nomi qo'lda beriladi
bot.botInfo = {
  id: 0,
  is_bot: true,
  first_name: 'KROSS KOREA',
  username: 'kross_korea_bot',
  can_join_groups: false,
  can_read_all_group_messages: false,
  supports_inline_queries: false,
  can_connect_to_business: false,
  has_main_web_app: false,
};

await import('../src/index.js');
