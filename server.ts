import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import { GoogleGenAI, Type } from "@google/genai";

import firebaseConfig from "./firebase-applet-config.json";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Highly polished, educational, and marketing-focused templates provided by user across multiple languages
const TELEGRAM_TEMPLATES = [
  // Template 1: Multi-Lingual Global Welcome (English, Russian, Spanish, Arabic)
  `🚀 <b>WELCOME TO NGK CRYPTOGRAPHIC COPY-TRADING PLATFORM</b> 🚀\n\n` +
  `🇬🇧 <b>[ENGLISH]</b>\n` +
  `Join the world's leading node-automated copy-trading system!\n` +
  `• <b>Min Deposit:</b> 100 USDT\n` +
  `• <b>Daily Profits:</b> 2% - 4% (2 Signals/Day)\n` +
  `• <b>Withdrawals:</b> Unlocked after executing 8 copy-trades!\n` +
  `• <b>Min Withdrawal:</b> 10 USDT\n\n` +
  `🇷🇺 <b>[РУССКИЙ]</b>\n` +
  `Присоединяйтесь к ведущей платформе автоматического копи-трейдинга!\n` +
  `• <b>Мин. депозит:</b> 100 USDT | <b>Доход:</b> 2% - 4% в день\n` +
  `• <b>Вывод средств:</b> Доступен после 8 копи-сделок!\n\n` +
  `🇪🇸 <b>[ESPAÑOL]</b>\n` +
  `¡Únete a la plataforma líder de copy-trading con nodos automatizados!\n` +
  `• <b>Depósito Mínimo:</b> 100 USDT | <b>Ganancia Diaria:</b> 2% - 4%\n` +
  `• <b>Retiros:</b> ¡Desbloqueados tras 8 operaciones!\n\n` +
  `🇦🇪 <b>[العربية]</b>\n` +
  `انضم إلى منصة تداول النسخ الأولى المدعومة بالعقد الرقمية!\n` +
  `• <b>الحد الأدنى للإيداع:</b> 100 USDT | <b>الربح اليومي:</b> 2% - 4%\n` +
  `• <b>السحب:</b> متاح بعد تنفيذ 8 صفقات نسخ!\n\n` +
  `🔗 <b>Register Now / Зарегистрироваться:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 2: Multi-Account Warning & Fraud Prevention (En, Ru, Es, Ar)
  `⚠️ <b>STRICT SECURITY WARNING: MULTI-ACCOUNT & FAKE REFERRAL POLICY</b> ⚠️\n\n` +
  `🇬🇧 <b>[ENGLISH]</b>\n` +
  `To maintain regulatory compliance and security, NGK strictly enforces a <b>ONE ACCOUNT PER USER / IP / DEVICE</b> policy. Creating multiple fake accounts to abuse deposit bonuses will result in immediate <b>PERMANENT ACCOUNT BAN & IP BLACKLIST</b> with complete loss of funds!\n\n` +
  `🇷🇺 <b>[РУССКИЙ]</b>\n` +
  `Внимание! Действует правило <b>ОДИН АККАУНТ НА ПОЛЬЗОВАТЕЛЯ / IP / УСТРОЙСТВО</b>. Создание мульти-аккаунтов влечет <b>ВЕЧНУЮ БЛОКИРОВКУ</b> и аннулирование депозитов!\n\n` +
  `🇪🇸 <b>[ESPAÑOL]</b>\n` +
  `¡Atención! Regla estricta de <b>UNA SOLA CUENTA POR USUARIO / IP / DISPOSITIVO</b>. La creación de múltiples cuentas resultará en <b>BLOQUEO PERMANENTE</b> sin reembolso.\n\n` +
  `🇦🇪 <b>[العربية]</b>\n` +
  `تحذير أمني صارم! تطبق المنصة سياسة <b>حساب واحد فقط لكل مستخدم / IP / جهاز</b>. إنشاء حسابات متعددة للاستغلال يؤدي إلى <b>الحظر النهائي المباشر</b> وتجميد الأموال!\n\n` +
  `🛡️ <i>Play fair, protect your capital, and build real legitimate teams.</i>\n\n` +
  `🔗 <b>Official Portal:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 3: Mandatory KYC Verification Notice (En, Ru, Es, Ar)
  `🔐 <b>MANDATORY KYC IDENTITY VERIFICATION FOR WITHDRAWALS</b> 🔐\n\n` +
  `🇬🇧 <b>[ENGLISH]</b>\n` +
  `All active traders must complete mandatory Identity Verification (KYC) before initiating capital withdrawals:\n` +
  `1️⃣ Navigate to <b>Profile ➡️ Identity Verification (KYC)</b>\n` +
  `2️⃣ Upload your Passport, National ID, or Driving License\n` +
  `3️⃣ Instant AI approval within minutes!\n` +
  `<i>KYC verification ensures institutional anti-money laundering compliance and wallet protection.</i>\n\n` +
  `🇷🇺 <b>[РУССКИЙ]</b>\n` +
  `Верификация личности (KYC) обязательна перед выводом средств! Загрузите документ в разделе Профиль для быстрого подтверждения.\n\n` +
  `🇪🇸 <b>[ESPAÑOL]</b>\n` +
  `La verificación de identidad (KYC) es obligatoria antes del retiro de fondos. Suba su documento en la sección Perfil.\n\n` +
  `🇦🇪 <b>[العربية]</b>\n` +
  `التحقق من الهوية (KYC) إلزامي لجميع المستخدمين قبل طلب السحب! يرجى رفع الهوية الوطنية أو جواز السفر من قسم الملف الشخصي.\n\n` +
  `🔗 <b>Verify Identity Now:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 4: Offline Promotion & Global VIP Dinner Events (En, Ru, Es, Ar)
  `🍷🍽️ <b>NGK GLOBAL OFFLINE EVENTS & VIP DINNER PARTIES</b> 🥂🎉\n\n` +
  `🇬🇧 <b>[ENGLISH]</b>\n` +
  `NGK Exchange is expanding offline! We support regional office centers, offline educational seminars, and luxury <b>VIP Gala Dinner Events</b> for top regional team leaders!\n` +
  `• <b>Office Sponsorship Grant:</b> Up to $3,000 USDT/month for regional centers.\n` +
  `• <b>VIP Gala Dinner Invites:</b> All-inclusive tickets & five-star accommodations for elite partners.\n\n` +
  `🇷🇺 <b>[РУССКИЙ]</b>\n` +
  `NGK проводит официальные офлайн-семинары и VIP-ужины для лидеров команд! Финансирование офисов до $3000 USDT в месяц и приглашения на гала-вечера.\n\n` +
  `🇪🇸 <b>[ESPAÑOL]</b>\n` +
  `¡NGK organiza seminarios presenciales y Cenas VIP de Gala para los líderes regionales más destacados con patrocinio de oficinas de hasta $3,000 USDT!\n\n` +
  `🇦🇪 <b>[العربية]</b>\n` +
  `تستضيف NGK مؤتمرات أوفلاين وحفلات عشاء VIP فاخرة لقادة المناطق! تمويل مكاتب إقليمية يصل إلى 3000 USDT شهرياً.\n\n` +
  `🤝 <i>Contact Support to apply for Regional Leader Sponsorship & Dinner Invitations.</i>\n\n` +
  `🔗 <b>Join NGK Global:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 5: Daily Schedule & Trading Hours (En, Ru, Es, Ar)
  `🕒 <b>DAILY COPY-TRADING SIGNAL SCHEDULE (UK TIME)</b> 🕒\n\n` +
  `🇬🇧 <b>[ENGLISH]</b>\n` +
  `Maximize your daily 4% compounding returns during official node broadcast hours:\n` +
  `⏱️ <b>Signal #1 (Morning):</b> 11:00 AM (UK Time) ➡️ +2.0% Gain\n` +
  `⏱️ <b>Signal #2 (Afternoon):</b> 01:00 PM (UK Time) ➡️ +2.0% Gain\n` +
  `<i>Important: Order codes remain valid for 1 Hour. Execute trades promptly!</i>\n\n` +
  `🇷🇺 <b>[РУССКИЙ]</b> Время сигналов (время Великобритании UK):\n` +
  `⏱️ <b>Сигнал 1:</b> 11:00 UK ➡️ +2.0% | ⏱️ <b>Сигнал 2:</b> 13:00 UK ➡️ +2.0%\n\n` +
  `🇪🇸 <b>[ESPAÑOL]</b> Horarios de señales (Hora del Reino Unido UK):\n` +
  `⏱️ <b>Señal 1:</b> 11:00 AM UK ➡️ +2.0% | ⏱️ <b>Señal 2:</b> 01:00 PM UK ➡️ +2.0%\n\n` +
  `🇦🇪 <b>[العربية]</b> جدول الإشارات اليومي (بتوقيت المملكة المتحدة UK):\n` +
  `⏱️ <b>الإشارة الأولى:</b> 11:00 صباحاً ➡️ +2.0% | ⏱️ <b>الإشارة الثانية:</b> 01:00 ظهراً ➡️ +2.0%\n\n` +
  `🔗 <b>Execute Signals Live:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 6: Referral Program & Tiered Rewards (En, Ru, Es, Ar)
  `🌟 <b>NGK AFFILIATE & REWARD PROGRAM</b> 🌟\n\n` +
  `🇬🇧 <b>[ENGLISH]</b> Earn double-sided direct USDT rewards & team commission shares!\n` +
  `• <b>Deposit 100 USDT:</b> Inviter <b>5 USDT</b> ｜ Member <b>3 USDT</b>\n` +
  `• <b>Deposit 500 USDT:</b> Inviter <b>30 USDT</b> ｜ Member <b>20 USDT</b>\n` +
  `• <b>Deposit 1000 USDT:</b> Inviter <b>70 USDT</b> ｜ Member <b>50 USDT</b>\n` +
  `• <b>Profit Commissions:</b> Level 1 ➡️ <b>5%</b> ｜ Level 2 ➡️ <b>3%</b>\n\n` +
  `🇷🇺 <b>[РУССКИЙ]</b> Бонусы за депозиты рефералов и до 5% от прибыли команды!\n\n` +
  `🇪🇸 <b>[ESPAÑOL]</b> ¡Bonos de depósito directo e ingresos pasivos de red!\n\n` +
  `🇦🇪 <b>[العربية]</b> مكافآت الإيداع المباشر وأرباح الفريق متعددة المستويات!\n\n` +
  `🔗 <b>Get Your Invite Link:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 7: Russian Guide (Инструкция на русском)
  `🇷🇺 <b>ПОШАГОВАЯ ИНСТРУКЦИЯ ДЛЯ НОВИЧКОВ (NGK EXCHANGE)</b>\n\n` +
  `1️⃣ Зарегистрируйтесь по официальной ссылке.\n` +
  `2️⃣ Пополните баланс от 100 USDT (TRC20, BEP20 или ERC20).\n` +
  `3️⃣ Пройдите верификацию KYC для быстрой активации вывода средств.\n` +
  `4️⃣ Подключите ваш Telegram Chat ID в настройках профиля.\n` +
  `5️⃣ В 11:00 и 13:00 (по времени Лондона) нажимайте «Копировать сигнал»!\n\n` +
  `📌 <b>Депозит и прибыль доступны к выводу после выполнения 8 копи-сделок!</b>\n\n` +
  `🔗 <b>Начать работу:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 8: Spanish Guide (Guía completa en español)
  `🇪🇸 <b>GUÍA COMPLETA DE PASO A PASO EN ESPAÑOL (NGK EXCHANGE)</b> 🇪🇸\n\n` +
  `1️⃣ Regístrese utilizando el enlace oficial de la plataforma.\n` +
  `2️⃣ Realice un depósito mínimo de 100 USDT (TRC20 / BEP20).\n` +
  `3️⃣ Complete la verificación de identidad (KYC) para habilitar retiros.\n` +
  `4️⃣ Conecte su ID de Telegram en la configuración del perfil.\n` +
  `5️⃣ Copie las señales a las 11:00 AM y 01:00 PM (Hora Reino Unido).\n\n` +
  `💰 <b>¡Retiro total de depósito y ganancias habilitado tras 8 operaciones!</b>\n\n` +
  `🔗 <b>Registrarse Ahora:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 9: Arabic Guide (الدليل الشامل باللغة العربية)
  `🇦🇪 <b>الدليل الشامل للبدء في منصة NGK EXCHANGE</b> 🇦🇪\n\n` +
  `1️⃣ قم بالتسجيل عبر الرابط الرسمي للمنصة.\n` +
  `2️⃣ إيداع الحد الأدنى 100 USDT (عبر شبكات TRC20, BEP20, ERC20).\n` +
  `3️⃣ إكمال التحقق من الهوية (KYC) لضمان تفعيل السحب الفوري.\n` +
  `4️⃣ ربط معرّف Telegram Chat ID الخاص بك في إعدادات الحساب.\n` +
  `5️⃣ تنفيذ الإشارات اليومية الساعة 11:00 صباحاً و 01:00 ظهراً بتوقيت لندن.\n\n` +
  `💰 <b>يمكن سحب رأس المال والأرباح بالكامل بعد تنفيذ 8 صفقات نسخ فقط!</b>\n\n` +
  `🔗 <b>سجل الآن:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 10: 24/7 Support & Cold Wallet Security (En, Ru, Es, Ar)
  `💬 <b>NGK INSTITUTIONAL SECURITY & 24/7 SUPPORT</b> 💬\n\n` +
  `🇬🇧 <b>[ENGLISH]</b> Your assets are protected by multisig cold vaults, AI automated node matching, and 24/7 client support desk.\n\n` +
  `🇷🇺 <b>[РУССКИЙ]</b> Круглосуточная поддержка клиентов 24/7 и надежная защита балансов.\n\n` +
  `🇪🇸 <b>[ESPAÑOL]</b> Soporte al cliente en vivo 24/7 y la máxima seguridad para sus fondos.\n\n` +
  `🇦🇪 <b>[العربية]</b> الدعم الفني والحماية الرقمية المتكاملة لأموالك على مدار 24 ساعة.\n\n` +
  `🔗 <b>Official Portal:</b> https://ngkexchange.site/?ref=GTX-PJJM7`
];

function cleanChannelId(channelId: string): string {
  if (!channelId) return "";
  let cleaned = channelId.trim();
  // Strip common URL wrappers e.g. https://t.me/channel or t.me/channel
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, "");
  // Prepend @ if it's a username (not numeric and doesn't start with @ already)
  if (cleaned && !cleaned.startsWith("@") && !/^-?\d+$/.test(cleaned)) {
    cleaned = "@" + cleaned;
  }
  return cleaned;
}

// Helper to post a specific template to the configured channel
async function sendTelegramBroadcast(botToken: string, channelId: string, templateIndex: number) {
  const index = templateIndex % TELEGRAM_TEMPLATES.length;
  const messageText = TELEGRAM_TEMPLATES[index];
  const cleanedChatId = cleanChannelId(channelId);

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: cleanedChatId,
      text: messageText,
      parse_mode: "HTML",
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    let errDesc = data.description || "Telegram API rejected the broadcast message.";
    if (
      errDesc.includes("PEER_ID_INVALID") ||
      errDesc.includes("chat not found") ||
      errDesc.includes("not a member") ||
      errDesc.includes("Forbidden")
    ) {
      errDesc = `Telegram Error: ${data.description}. Please ensure @NGK_Signal_bot is added as an Administrator in channel '${channelId}' with 'Post Messages' permission.`;
    }
    throw new Error(errDesc);
  }
  return { ok: true, data, index };
}

const SERVER_VALID_ORDER_NUMBERS = [
  "NGK6217", "NGK4802", "NGK8943", "NGK1359", "NGK7210", "NGK5543", "NGK1902", "NGK8834",
  "NGK1964", "NGK9470", "NGK3336", "NGK3119", "NGK5642", "NGK9852", "NGK8347", "NGK4593",
  "NGK3266", "NGK9348", "NGK9085", "NGK2489"
];

async function triggerSignalCodeBroadcast(
  type: "signal_1" | "signal_2" | "signal_3" | "test",
  customPair?: string,
  customDirection?: string,
  customCode?: string
) {
  // 1. Fetch Telegram Config (Optional for Telegram posting, but signal is always created)
  let botToken = "";
  let channelId = "";
  try {
    const snap = await getDoc(doc(db, "system", "telegram_config"));
    if (snap.exists()) {
      const config = snap.data();
      botToken = config.botToken || "";
      channelId = config.channelId || "";
    }
  } catch (err) {
    console.warn("[Signal Broadcast Config Warning]:", err);
  }

  // 2. Select details & generate fresh unique code if not passed
  const code = customCode || `NGK${Math.floor(1000 + Math.random() * 9000)}`;
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour valid window
  
  let pair = customPair || "BTC/USDT";
  let direction = customDirection || "BULLISH";
  let titleLabel = "Signal #1 (Main Signal)";

  if (type === "signal_2") {
    pair = customPair || "ETH/USDT";
    direction = customDirection || "BULLISH";
    titleLabel = "Signal #2 (Afternoon Signal)";
  } else if (type === "signal_3") {
    pair = customPair || "SOL/USDT";
    direction = customDirection || "BEARISH";
    titleLabel = "Additional Signal (Minimum Balance $300)";
  } else if (type === "test") {
    pair = customPair || "BTC/USDT";
    direction = customDirection || "BULLISH";
    titleLabel = "TEST SIGNAL (Random Test)";
  }

  // 3. Save Active Signal document in system/copyTradeSignal FIRST (Guaranteed)
  const signalId = "SIG-" + Math.random().toString(36).substring(2, 7).toUpperCase();
  const signalData = {
    id: signalId,
    code: code,
    type: type,
    pair: pair,
    direction: direction,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    isActive: true,
    isLocked: false,
    timestamp: startTime.toISOString()
  };
  await setDoc(doc(db, "system", "copyTradeSignal"), signalData);
  console.log(`[Signal Engine] Successfully generated & activated VIP Signal ${code} (${pair} ${direction})`);

  // 4. If Telegram Bot Token and Channel ID are configured, post to Telegram
  let telegramData = null;
  if (botToken && channelId) {
    try {
      const directionEmoji = direction === "BULLISH" ? "🟢 BULLISH (BUY / CALL)" : "🔴 BEARISH (SELL / PUT)";

      const messageText = 
        `📊 <b>NGK CRYPTOGRAPHIC COPY-TRADING PLATFORM</b> 📊\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🌐 <b>OFFICIAL BLOCKCHAIN NODE SIGNAL BROADCAST</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔔 <b>NEW VIP COPY-TRADE SIGNAL DETECTED!</b> 🚀\n` +
        `We have successfully synchronized with the UK high-frequency nodes.\n\n` +
        `📈 <b>Session:</b> <code>${titleLabel}</code>\n` +
        `🎯 <b>Asset Pair:</b> <code>${pair}</code>\n` +
        `📉 <b>Market Bias:</b> <code>${directionEmoji}</code>\n` +
        `🔑 <b>Verification Order Code:</b> <code>${code}</code>\n\n` +
        `⏱️ <b>SESSION WINDOW:</b> <b>1 Hour Only</b>\n` +
        `🕒 <b>Status:</b> ACTIVE (Expires in 60 minutes)\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💡 <b>HOW TO DEPLOY LICENSE:</b>\n` +
        `1️⃣ Open the <b>NGK Copy-Trading Panel</b>.\n` +
        `2️⃣ Enter the <b>Verification Order Code</b> shown above.\n` +
        `3️⃣ Authorize deployment. Settle and claim <b>+2% profit</b> in 30 minutes!\n\n` +
        `⚠️ <i>Each signal code is valid for exactly 1 hour. Unauthorized usage or execution after the window is automatically rejected by the ledger network.</i>\n\n` +
        `🔗 <b>Secure Dashboard:</b> https://ngkexchange.site/?ref=GTX-PJJM7`;

      const cleanedChatId = cleanChannelId(channelId);
      const bannerUrl = "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=1200";
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cleanedChatId,
          photo: bannerUrl,
          caption: messageText,
          parse_mode: "HTML",
        }),
      });

      telegramData = await response.json();
    } catch (tgErr) {
      console.warn("[Telegram Dispatch Warning]:", tgErr);
    }
  }

  return {
    success: true,
    signal: signalData,
    telegramResponse: telegramData
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Customer Support Auto-Reply based on NGK rules in user's language
  app.post("/api/support-auto-reply", async (req, res) => {
    try {
      const { userId, username, userMessage, userEmail } = req.body;
      if (!userMessage || !userId) {
        return res.status(400).json({ ok: false, error: "Missing userId or userMessage." });
      }

      console.log(`[AI Auto-Support] Processing query from user ${userId} (${username}): "${userMessage}"`);

      let replyText = "";
      let shouldEscalate = false;

      // Attempt Gemini API generateContent
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const prompt = `User query: "${userMessage}"\n\nAnalyze this question, answer accurately based on official NGK Exchange rules in the EXACT SAME LANGUAGE as the user's query, and specify whether to escalate if it's a new or complex issue outside standard rules.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the official Customer Support AI Assistant for NGK Cryptographic Copy-Trading Platform (NGK Exchange).

CRITICAL LANGUAGE RULE:
- You MUST detect the language of the user's message (e.g., Urdu, Roman Urdu, Hindi, English, Russian, Spanish, Arabic, French, Turkish, etc.) and reply in the EXACT SAME LANGUAGE as the user's question!
- If the question is asked in Urdu or Roman Urdu (e.g., "withdraw kab hga", "minimum deposit kitna hai"), respond in natural Urdu/Roman Urdu!
- If the question is in Russian, reply in Russian.
- If the question is in Spanish, reply in Spanish.
- If the question is in Arabic, reply in Arabic.
- If the question is in English, reply in English.

OFFICIAL NGK PLATFORM RULES & KNOWLEDGE BASE:
1. MINIMUM DEPOSIT:
   - Minimum deposit is 100 USDT (Supports TRC20, BEP20, and ERC20 networks).

2. COPY TRADING SIGNALS & DAILY RETURNS:
   - 2 Main daily signals: Signal #1 at 11:00 AM (UK Time) & Signal #2 at 01:00 PM (UK Time). Total +4% daily return (+2% per signal).
   - Order verification codes are published on Telegram channel (@NGK_Signal_bot) and are valid for 1 Hour.
   - Additional Signal #3 at 04:00 PM (UK Time) (+2% gain) is available for accounts with a minimum total balance of $300 USDT.

3. WITHDRAWAL RULES:
   - Minimum withdrawal amount: 10 USDT.
   - Earned Trading Profits are ALWAYS withdrawable anytime!
   - Principal/Deposit requires $800 total trading volume (or 8 copy-trades) to unlock principal withdrawal.
   - Requires 6-digit withdrawal PIN (default: 123456) OR live 6-digit 2FA Google Authenticator code if activated.

4. VIP TIERS:
   - Bronze ($0 volume): +2.0% profit/trade
   - Silver ($800+ volume): +2.2% profit/trade
   - Gold ($5,000+ volume): +2.5% profit/trade
   - Platinum ($20,000+ volume): +3.0% profit/trade

5. REFERRAL PROGRAM:
   - Deposit bonuses: $100 -> Inviter $5, Member $3 | $500 -> Inviter $30, Member $20 | $1000 -> Inviter $70, Member $50.
   - Profit Commissions: Level 1 -> 5%, Level 2 -> 3%.

6. SECURITY & KYC:
   - Strict 1 account per user/IP/device policy. Mandatory KYC (National ID/Passport) required for withdrawals in Profile tab.

ESCALATION TO LIVE SUPPORT OFFICER:
- If the question is NOT covered by standard rules (e.g., custom refund request, account lock dispute, payment issue, technical bug, custom partnership request, or explicitly asking for a human officer/agent), reply politely in the user's language stating:
  "Your request has been forwarded to an official NGK Customer Support Officer. Please wait a moment while an agent reviews your account and responds to you directly."
  and set "shouldEscalate": true.

Respond strictly in valid JSON format:
{
  "reply": "Your response text in the exact language of the user question.",
  "shouldEscalate": boolean
}`,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reply: { type: Type.STRING },
                  shouldEscalate: { type: Type.BOOLEAN }
                },
                required: ["reply", "shouldEscalate"]
              }
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text.trim());
            replyText = parsed.reply || "";
            shouldEscalate = Boolean(parsed.shouldEscalate);
          }
        } catch (geminiErr) {
          console.error("Gemini API call error in support auto-reply:", geminiErr);
        }
      }

      // Fallback rule parser if Gemini didn't respond or API key unavailable
      if (!replyText) {
        const lowerMsg = userMessage.toLowerCase();
        
        // Language detection hint
        const isUrdu = /[\u0600-\u06FF]/.test(userMessage) || lowerMsg.includes('kia') || lowerMsg.includes('kya') || lowerMsg.includes('kaise') || lowerMsg.includes('kese') || lowerMsg.includes('kab') || lowerMsg.includes('hai') || lowerMsg.includes('kitna') || lowerMsg.includes('batao');
        const isRussian = /[а-яА-Я]/.test(userMessage);
        const isArabic = /[\u0600-\u06FF]/.test(userMessage) && !isUrdu;
        const isSpanish = lowerMsg.includes('cómo') || lowerMsg.includes('depósito') || lowerMsg.includes('retiro') || lowerMsg.includes('hola');

        if (lowerMsg.includes('deposit') || lowerMsg.includes('депозит') || lowerMsg.includes('depósito') || lowerMsg.includes('إيداع') || lowerMsg.includes('ڈیپازٹ') || lowerMsg.includes('dipozit')) {
          if (isUrdu) {
            replyText = "NGK میں کم از کم ڈیپازٹ 100 USDT ہے۔ آپ TRC20، BEP20، یا ERC20 نیٹ ورک کے ذریعے رقم جمع کروا سکتے ہیں۔ اگر مزید مدد چاہیے تو ہمارے ایجنٹ کا انتظار کریں۔";
          } else if (isRussian) {
            replyText = "Минимальный депозит на NGK составляет 100 USDT (TRC20, BEP20, ERC20). Наш агент поддержки также готов ответить на Ваши вопросы.";
          } else if (isArabic) {
            replyText = "الحد الأدنى للإيداع في منصة NGK هو 100 USDT (TRC20, BEP20, ERC20). موظف الدعم متاح للرد عليك.";
          } else if (isSpanish) {
            replyText = "El depósito mínimo en NGK es de 100 USDT (redes TRC20, BEP20 o ERC20). Si necesita ayuda adicional, un agente le responderá.";
          } else {
            replyText = "The minimum deposit on NGK Exchange is 100 USDT (TRC20, BEP20, or ERC20). An NGK support officer will also assist you shortly if needed.";
          }
        } else if (lowerMsg.includes('withdraw') || lowerMsg.includes('вывод') || lowerMsg.includes('retiro') || lowerMsg.includes('سحب') || lowerMsg.includes('ودڈرا') || lowerMsg.includes('ویڈرال')) {
          if (isUrdu) {
            replyText = "کم از کم ودڈرا 10 USDT ہے۔ تجارتی منافع کسی بھی وقت نکلوایا جا سکتا ہے۔ اصل ڈیپازٹ ان لاک کرنے کے لیے $800 کا ٹریڈنگ والیوم (یا 8 کاپی ٹریڈز) درکار ہے۔";
          } else if (isRussian) {
            replyText = "Минимальный вывод — 10 USDT. Торговая прибыль доступна к выводу в любое время. Для вывода депозита требуется торговый объем $800.";
          } else if (isArabic) {
            replyText = "الحد الأدنى للسحب هو 10 USDT. أرباح التداول متاحة للسحب في أي وقت. يتطلب سحب رأس المال التجاري حجم تداول بقيمة $800.";
          } else {
            replyText = "Minimum withdrawal is 10 USDT. Trading profits can be withdrawn anytime! Principal deposit requires $800 total trading volume to unlock.";
          }
        } else if (lowerMsg.includes('signal') || lowerMsg.includes('сигнал') || lowerMsg.includes('señal') || lowerMsg.includes('إشارة') || lowerMsg.includes('سیگنل')) {
          if (isUrdu) {
            replyText = "NGK سگنل کا وقت: پہلا سگنل 11:00 AM اور دوسرا سگنل 01:00 PM (یو کے ٹائم) پر آتا ہے۔ ہر سگنل +2% منافع دیتا ہے! سگنل کوڈ ٹیلیگرام پر دستیاب ہے۔";
          } else {
            replyText = "Daily Copy Trading Signals: Signal #1 at 11:00 AM UK Time and Signal #2 at 01:00 PM UK Time (+2% profit each). Codes are published on official Telegram (@NGK_Signal_bot).";
          }
        } else {
          shouldEscalate = true;
          if (isUrdu) {
            replyText = "آپ کا سوال موصول ہو گیا ہے۔ برائے مہربانی تھوڑا انتظار کریں، NGK کا کسٹمر سپورٹ ایجنٹ جلد ہی آپ کو جواب دے گا۔";
          } else if (isRussian) {
            replyText = "Ваш запрос передан агенту службы поддержки NGK. Пожалуйста, подождите, мы ответим вам в ближайшее время.";
          } else if (isArabic) {
            replyText = "تم تحويل استفسارك إلى موظف الدعم الفني المباشر لمنصة NGK. يرجى الانتظار لحظات وسيقوم الموظف بالرد عليك.";
          } else if (isSpanish) {
            replyText = "Su consulta ha sido derivada a un agente de soporte oficial de NGK. Por favor espere un momento y le responderemos a la brevedad.";
          } else {
            replyText = "Your query has been forwarded to an official NGK Customer Support Officer. Please wait a moment while an agent reviews your request and responds to you.";
          }
        }
      }

      // Add AI reply directly to Firestore support_chats/{userId}/messages
      const aiMsg = {
        sender: "agent",
        senderName: shouldEscalate ? "NGK Agent Sophia" : "NGK AI Assistant",
        message: replyText,
        timestamp: new Date().toISOString(),
        agentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
      };

      await addDoc(collection(db, "support_chats", userId, "messages"), aiMsg);

      // Update parent document
      await setDoc(doc(db, "support_chats", userId), {
        userId,
        username: username || "Investor",
        userEmail: userEmail || "",
        lastMessage: replyText,
        lastTimestamp: new Date().toISOString(),
        status: shouldEscalate ? "pending_agent" : "open",
        assignedAgentName: shouldEscalate ? "NGK Support Desk" : "NGK AI Assistant"
      }, { merge: true });

      return res.json({
        ok: true,
        reply: replyText,
        shouldEscalate
      });
    } catch (err: any) {
      console.error("Support Auto-Reply Endpoint Error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Failed to process auto-reply." });
    }
  });

  // API Route: Secure Telegram proxy to deliver messages server-side
  app.post("/api/telegram-proxy", async (req, res) => {
    try {
      const { botToken, chatId, text } = req.body;
      if (!botToken || !chatId || !text) {
        return res.status(400).json({ ok: false, error: "Missing botToken, chatId, or text parameters." });
      }

      const cleanedChatId = cleanChannelId(chatId);
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cleanedChatId,
          text: text,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err: any) {
      console.error("Telegram Proxy Server Error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Internal server error" });
    }
  });

  // API Route: Manually trigger the next automated rotated template immediately
  app.post("/api/telegram-manual-post", async (req, res) => {
    try {
      const snap = await getDoc(doc(db, "system", "telegram_config"));
      if (!snap.exists()) {
        return res.status(404).json({ ok: false, error: "Telegram configuration does not exist in Firestore yet." });
      }

      const config = snap.data();
      const botToken = config.botToken || "";
      const channelId = config.channelId || "";
      let lastPosterIndex = config.lastPosterIndex || 0;
      const autoPosterInterval = config.autoPosterInterval || 2.5;

      if (!botToken || !channelId) {
        return res.status(400).json({ ok: false, error: "Missing botToken or channelId configuration." });
      }

      // Send the current index template
      const result = await sendTelegramBroadcast(botToken, channelId, lastPosterIndex);
      
      // Calculate next scheduled dates
      const now = Date.now();
      const nextIndex = (lastPosterIndex + 1) % TELEGRAM_TEMPLATES.length;
      const nextPostAt = new Date(now + autoPosterInterval * 60 * 60 * 1000).toISOString();

      // Save progress to Firestore
      await setDoc(doc(db, "system", "telegram_config"), {
        lastPosterIndex: nextIndex,
        lastPostedAt: new Date(now).toISOString(),
        nextPostAt: nextPostAt,
        updatedAt: new Date(now).toISOString()
      }, { merge: true });

      return res.json({
        ok: true,
        message: "Manually triggered next Telegram template successfully!",
        templateIndex: lastPosterIndex,
        nextTemplateIndex: nextIndex,
        nextPostAt
      });
    } catch (err: any) {
      console.error("Manual Broadcast Error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Failed to trigger template." });
    }
  });

  // API Route: Send a test/custom message to the channel immediately to verify permission
  app.post("/api/telegram-test-channel", async (req, res) => {
    try {
      const { botToken, channelId } = req.body;
      if (!botToken || !channelId) {
        return res.status(400).json({ ok: false, error: "Missing botToken or channelId." });
      }

      const cleanedChatId = cleanChannelId(channelId);
      const testMsg = `🔔 <b>NGK Exchange Bot Integration Verified!</b>\n\nYour representative bot @NGK_Signal_bot has been successfully connected as an Admin to this channel! 🚀\n\nAutomated daily postings are now armed and ready. Let's make passive income seamless! 📈`;

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cleanedChatId,
          text: testMsg,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err: any) {
      console.error("Telegram Channel Connection Test Error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Internal server error" });
    }
  });

  // API Route: Get all available telegram marketing/educational templates
  app.get("/api/telegram-templates", (req, res) => {
    return res.json({ ok: true, templates: TELEGRAM_TEMPLATES });
  });

  // API Route: Send a specific template immediately by index
  app.post("/api/telegram-post-template", async (req, res) => {
    try {
      const { templateIndex } = req.body;
      if (templateIndex === undefined || templateIndex < 0 || templateIndex >= TELEGRAM_TEMPLATES.length) {
        return res.status(400).json({ ok: false, error: "Invalid template index." });
      }

      const snap = await getDoc(doc(db, "system", "telegram_config"));
      if (!snap.exists()) {
        return res.status(404).json({ ok: false, error: "Telegram configuration does not exist in Firestore yet." });
      }

      const config = snap.data();
      const botToken = config.botToken || "";
      const channelId = config.channelId || "";
      const autoPosterInterval = config.autoPosterInterval || 2.5;

      if (!botToken || !channelId) {
        return res.status(400).json({ ok: false, error: "Missing botToken or channelId configuration." });
      }

      // Send the requested index template
      const result = await sendTelegramBroadcast(botToken, channelId, templateIndex);

      // Save latest status
      const now = Date.now();
      const nextPostAt = new Date(now + autoPosterInterval * 60 * 60 * 1000).toISOString();

      await setDoc(doc(db, "system", "telegram_config"), {
        lastPostedAt: new Date(now).toISOString(),
        nextPostAt: nextPostAt,
        updatedAt: new Date(now).toISOString()
      }, { merge: true });

      return res.json({
        ok: true,
        message: `Template #${templateIndex + 1} posted successfully!`,
        templateIndex,
        nextPostAt
      });
    } catch (err: any) {
      console.error("Manual Template Post Error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Failed to post template." });
    }
  });

  // API Route: Trigger a direct VIP Copy Trading Signal
  app.post("/api/telegram-broadcast-signal", async (req, res) => {
    try {
      const { type, pair, direction, code } = req.body;
      if (!type || !["signal_1", "signal_2", "signal_3", "test"].includes(type)) {
        return res.status(400).json({ ok: false, error: "Invalid signal type requested." });
      }

      console.log(`[Manual Signal API] Triggering signal broadcast type=${type}, pair=${pair}, direction=${direction}, code=${code}`);
      const result = await triggerSignalCodeBroadcast(type, pair, direction, code);
      return res.json({ ok: true, message: "VIP Signal code broadcasted successfully!", ...result });
    } catch (err: any) {
      console.error("Manual Signal Broadcast Error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Failed to broadcast VIP signal." });
    }
  });

  // Automated Poster Scheduler & UK Signals Heartbeat Loop
  // Runs every 60 seconds. Checks both scheduled times & marketing post schedule.
  let lastTriggeredMinute = "";

  setInterval(async () => {
    try {
      // 0. Auto-lock active signal if 1-hour validity window has expired, or auto-generate fresh signal if no active signal exists
      let currentActiveSignalExists = false;
      try {
        const signalSnap = await getDoc(doc(db, "system", "copyTradeSignal"));
        if (signalSnap.exists()) {
          const sig = signalSnap.data();
          if (sig.isActive && sig.endTime) {
            if (Date.now() >= new Date(sig.endTime).getTime()) {
              console.log(`[Signal Engine] Signal ${sig.code} expired after 1 hour window. Triggering fresh signal update.`);
              await setDoc(doc(db, "system", "copyTradeSignal"), {
                isActive: false,
                isLocked: true,
                lockedAt: new Date().toISOString()
              }, { merge: true });
            } else {
              currentActiveSignalExists = true;
            }
          }
        }

        // If no active signal is running right now, automatically trigger a new VIP signal!
        if (!currentActiveSignalExists) {
          console.log("[Signal Engine] No active signal found in database. Auto-generating fresh VIP Copy Trade Signal...");
          await triggerSignalCodeBroadcast("signal_1");
        }
      } catch (sigErr) {
        console.warn("[Signal Heartbeat Warning]:", sigErr);
      }

      const now = new Date();
      const currentUtcHours = now.getUTCHours();
      const currentUtcMinutes = now.getUTCMinutes();
      
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hourStr = String(currentUtcHours).padStart(2, '0');
      const minStr = String(currentUtcMinutes).padStart(2, '0');
      const currentMinuteStr = `${year}-${month}-${day}-${hourStr}-${minStr}`;

      // 1. Check UK copy trade scheduled signals (BST = UTC+1)
      // Signal 1: 11:00 AM BST = 10:00 UTC
      // Signal 2: 1:00 PM BST = 12:00 UTC
      // Additional Signal (Signal 3): 4:00 PM BST = 15:00 UTC
      if (currentMinuteStr !== lastTriggeredMinute) {
        if (currentUtcHours === 10 && currentUtcMinutes === 0) {
          lastTriggeredMinute = currentMinuteStr;
          console.log(`[Scheduled Signal] Triggering Signal 1 at ${now.toISOString()}`);
          await triggerSignalCodeBroadcast("signal_1").catch(console.error);
        } else if (currentUtcHours === 12 && currentUtcMinutes === 0) {
          lastTriggeredMinute = currentMinuteStr;
          console.log(`[Scheduled Signal] Triggering Signal 2 at ${now.toISOString()}`);
          await triggerSignalCodeBroadcast("signal_2").catch(console.error);
        } else if (currentUtcHours === 15 && currentUtcMinutes === 0) {
          lastTriggeredMinute = currentMinuteStr;
          console.log(`[Scheduled Signal] Triggering Signal 3 at ${now.toISOString()}`);
          await triggerSignalCodeBroadcast("signal_3").catch(console.error);
        }
      }

      // 2. Check Marketing educational auto-poster schedule
      const snap = await getDoc(doc(db, "system", "telegram_config"));
      if (!snap.exists()) return;

      const config = snap.data();
      const { autoPosterActive, botToken, channelId, autoPosterInterval } = config;
      // Default autoPosterActive to true if botToken is set
      const isAutoActive = autoPosterActive !== undefined ? autoPosterActive : true;
      if (!isAutoActive || !botToken || !channelId) return;

      const nowMs = Date.now();
      let nextPostAt = config.nextPostAt;

      // If nextPostAt is empty/missing, initialize it to the current time to trigger immediately
      if (!nextPostAt) {
        nextPostAt = new Date(nowMs).toISOString();
        await setDoc(doc(db, "system", "telegram_config"), { nextPostAt, autoPosterActive: true }, { merge: true });
      }

      const nextPostMs = new Date(nextPostAt).getTime();
      if (nowMs >= nextPostMs) {
        const lastPosterIndex = config.lastPosterIndex || 0;
        const intervalHrs = autoPosterInterval || 1; // Default to 1 hour frequency
        const futurePostAt = new Date(nowMs + intervalHrs * 60 * 60 * 1000).toISOString();
        
        console.log(`[AutoPoster] Executing post index ${lastPosterIndex} to channel ${channelId}`);
        
        try {
          // Execute the Telegram sendMessage post
          await sendTelegramBroadcast(botToken, channelId, lastPosterIndex);

          // Schedule the subsequent post
          const nextIndex = (lastPosterIndex + 1) % TELEGRAM_TEMPLATES.length;

          await setDoc(doc(db, "system", "telegram_config"), {
            lastPosterIndex: nextIndex,
            lastPostedAt: new Date(nowMs).toISOString(),
            nextPostAt: futurePostAt,
            lastError: null,
            updatedAt: new Date(nowMs).toISOString()
          }, { merge: true });

          console.log(`[AutoPoster] Post successful. Next post scheduled for ${futurePostAt} (Index ${nextIndex})`);
        } catch (postErr: any) {
          const errMsg = postErr.message || String(postErr);
          console.warn(`[AutoPoster Warning]: ${errMsg}`);

          // Retry sooner (in 3 minutes) if error occurs rather than postponing hours
          const retryAt = new Date(nowMs + 3 * 60 * 1000).toISOString();
          await setDoc(doc(db, "system", "telegram_config"), {
            nextPostAt: retryAt,
            lastError: errMsg,
            updatedAt: new Date(nowMs).toISOString()
          }, { merge: true });
        }
      }
    } catch (err: any) {
      console.error("[AutoPoster/Signal Error]:", err.message || err);
    }
  }, 60000); // 1 minute heartbeat

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express-Vite Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
