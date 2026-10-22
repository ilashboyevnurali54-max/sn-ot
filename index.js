const { Telegraf, Markup } = require('telegraf');

// ====== SOZLAMALAR ======
const BOT_TOKEN = process.env.BOT_TOKEN; // @BotFather beradi
const ADMIN_ID = Number(process.env.ADMIN_ID || 8919269688); // admin Telegram ID (raqam)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'sn.admin'; // @ belgisisiz
// ========================

const bot = new Telegraf(BOT_TOKEN);

// Foydalanuvchilarning joriy bosqichi (xotirada saqlanadi)
const sessions = new Map();

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

bot.start(async (ctx) => {
  sessions.set(ctx.from.id, { step: 'name' });
  await ctx.reply(
    "Assalomu alaykum! Ro'yxatdan o'tish uchun ism-familiyangizni yozing:",
    Markup.removeKeyboard()
  );
});

async function askPhone(ctx) {
  await ctx.reply(
    "Telefon raqamingizni yuboring (tugmani bosing yoki qo'lda yozing):",
    Markup.keyboard([[Markup.button.contactRequest('📱 Raqamni yuborish')]])
      .oneTime()
      .resize()
  );
}

async function finish(ctx, session, city) {
  const user = ctx.from;
  sessions.delete(user.id);

  const username = user.username ? `@${user.username}` : "yo'q";
  const text =
    "🆕 <b>Yangi ro'yxatdan o'tish</b>\n\n" +
    `👤 Ism: ${esc(session.name)}\n` +
    `📞 Telefon: ${esc(session.phone)}\n` +
    `📍 Hudud: ${esc(city)}\n` +
    `🔗 Username: ${esc(username)}\n` +
    `🆔 ID: <code>${user.id}</code>\n` +
    `<a href="tg://user?id=${user.id}">Profilga o'tish</a>`;

  await ctx.telegram.sendMessage(ADMIN_ID, text, { parse_mode: 'HTML' });

  await ctx.reply(
    "✅ Ro'yxatdan muvaffaqiyatli o'tdingiz!\n\n" +
      "Savollaringiz bo'lsa, admin bilan bog'lanish uchun pastdagi tugmani bosing.",
    Markup.inlineKeyboard([
      Markup.button.url("💬 Admin bilan bog'lanish", `https://t.me/${ADMIN_USERNAME}`),
    ])
  );
}

// Kontakt tugmasi orqali yuborilgan raqam
bot.on('contact', async (ctx) => {
  const session = sessions.get(ctx.from.id);
  if (!session || session.step !== 'phone') return;

  session.phone = ctx.message.contact.phone_number;
  session.step = 'city';
  await ctx.reply('Qaysi shahar yoki tumandansiz?', Markup.removeKeyboard());
});

// Oddiy matnli javoblar
bot.on('text', async (ctx) => {
  const session = sessions.get(ctx.from.id);
  if (!session) {
    return ctx.reply("Ro'yxatdan o'tish uchun /start ni bosing.");
  }

  const text = ctx.message.text.trim();

  if (session.step === 'name') {
    session.name = text;
    session.step = 'phone';
    return askPhone(ctx);
  }

  if (session.step === 'phone') {
    session.phone = text;
    session.step = 'city';
    return ctx.reply('Qaysi shahar yoki tumandansiz?', Markup.removeKeyboard());
  }

  if (session.step === 'city') {
    return finish(ctx, session, text);
  }
});

bot.catch((err) => console.error('Bot xatosi:', err));

bot.launch().then(() => console.log('Bot ishga tushdi'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot faol ishlamoqda!');
});

app.listen(PORT, () => {
  console.log('Server' '+PORT+'-portda ishlamoqda...');
});
