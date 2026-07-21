import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Initialize Firebase App for server-side persistence checks
const firebaseConfig = {
  apiKey: "AIzaSyCBm82z4pEmEerJBBRw2_B45AmWRLJRUn0",
  authDomain: "njk-exchange.firebaseapp.com",
  projectId: "njk-exchange",
  storageBucket: "njk-exchange.firebasestorage.app",
  messagingSenderId: "322844344895",
  appId: "1:322844344895:web:47435325a4c13ecd99ee8a",
  measurementId: "G-XVL46K5YP2"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Highly polished, educational, and marketing-focused templates provided by user
const TELEGRAM_TEMPLATES = [
  // Template 1: Welcome & Core Values
  `✨ <b>Welcome to NGK Exchange Copy-Trading!</b>\n\n` +
  `🚀 <b>LAUNCH DATE:</b> 15 July 2026\n` +
  `📈 <b>Start Copying Live Signals Instantly!</b>\n\n` +
  `🤖 Our professional cryptographic node-automated system is fully active. Follow these key metrics:\n` +
  `✔️ <b>Minimum Deposit:</b> 100 USDT\n` +
  `✔️ <b>Daily Profit:</b> 2% to 4%\n` +
  `✔️ <b>Profit per Signal:</b> ~2.0%\n` +
  `✔️ <b>Withdrawable:</b> Anytime after executing 8 copy-trades!\n\n` +
  `📊 Participate in the digital asset revolution with professional risk-mitigated strategies.\n\n` +
  `🔗 <b>Register Now:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 2: Daily Schedule
  `🕒 <b>NGK Exchange - Daily Signal Schedule</b>\n\n` +
  `Dear Traders, please note our official daily session times to maximize your 4% daily potential:\n\n` +
  `➡️ <b>First Trading Signal:</b>\n` +
  `⏱ 11:00 AM (UK Time) ➡️ Expected Profit: +2%\n\n` +
  `➡️ <b>Second Trading Signal:</b>\n` +
  `⏱ 13:00 PM (1:00 PM UK Time) ➡️ Expected Profit: +2%\n\n` +
  `💡 <i>Important: Please log in on time to copy trade. No compensation can be provided for missed signals due to personal delays. Let's trade smart!</i>\n\n` +
  `🔗 <b>Secure Dashboard:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 3: Setup Guide
  `🪪 <b>How to Begin Copy-Trading on NGK Exchange</b>\n\n` +
  `Are you new to the platform? Here is the exact path to setup:\n\n` +
  `1️⃣ <b>Register Account:</b> Register via our official representative link.\n` +
  `2️⃣ <b>Complete Verification:</b> Complete KYC (Identity Verification) for instant secure withdrawals.\n` +
  `3️⃣ <b>Fund Wallet:</b> Deposit min 100 USDT (TRC20, BEP20, or ERC20 supported).\n` +
  `4️⃣ <b>Connect Bot & Alerts:</b> Paste your Telegram Chat ID in Profile Settings.\n` +
  `5️⃣ <b>Execute Signals:</b> Simply click 'Copy Signal' when broadcasted at 11:00 & 13:00 UK Time.\n\n` +
  `💰 <b>Deposit & Profit are fully withdrawable after 8 copy trades!</b>\n\n` +
  `🔗 <b>Get Started:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 4: Affiliate & Commission Rewards
  `🌟 <b>NGK Exchange Referral & Affiliate Program</b>\n\n` +
  `Invite your network and earn double-sided bonuses directly paid to your USDT wallet!\n\n` +
  `💰 <b>Deposit 100 USDT:</b>\n` +
  `🤝 Referrer receives <b>5 USDT</b> ｜ User receives <b>3 USDT</b>\n\n` +
  `💰 <b>Deposit 500 USDT:</b>\n` +
  `🤝 Referrer receives <b>30 USDT</b> ｜ User receives <b>20 USDT</b>\n\n` +
  `💰 <b>Deposit 1000 USDT:</b>\n` +
  `🤝 Referrer receives <b>70 USDT</b> ｜ User receives <b>50 USDT</b>\n\n` +
  `👥 <b>Multi-level Commissions:</b>\n` +
  `Level 1 ➡️ <b>5%</b> of trading profits\n` +
  `Level 2 ➡️ <b>3%</b> of trading profits\n\n` +
  `🔗 <b>Your Invite Link:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 5: Safety & Regulatory Compliance
  `🛡️ <b>NGK Exchange Security & Support</b>\n\n` +
  `Why is NGK Exchange trusted by thousands of active copy-traders globally?\n\n` +
  `🔒 <b>Cold-Storage Audited Wallets:</b> All user funds are secured via multisig cold wallets.\n` +
  `🪪 <b>KYC Verification:</b> Fully regulated digital asset tracking to protect investor integrity.\n` +
  `⚡ <b>Instant Withdrawals:</b> Minimum withdrawal of only 10 USDT, processed swiftly.\n` +
  `🕒 <b>24/7 Dedicated Support:</b> Helpdesk is active around the clock for any technical assistance.\n\n` +
  `Maximize your portfolio with a platform that values transparency.\n\n` +
  `🔗 <b>Official Portal:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 6: Russian Language Overview (Русская Версия)
  `🇷🇺 <b>Добро пожаловать в NGK Exchange!</b>\n\n` +
  `📅 <b>Дата запуска:</b> 15 июля 2026\n` +
  `🔗 <b>Регистрация:</b> https://ngkexchange.site/?ref=GTX-PJJM7\n\n` +
  `✔️ <b>Минимальный депозит:</b> 100 USDT\n` +
  `⚡️ <b>Прибыль с каждого сигнала:</b> около 2%\n` +
  `📊 <b>Ежедневный доход:</b> до 4%\n` +
  `📌 <b>Депозит и прибыль можно вывести в любое время после выполнения 8 копи-сделок!</b>\n` +
  `✔️ <b>Минимальный вывод:</b> 10 USDT\n` +
  `🪪 <b>Требуется верификация KYC</b>\n\n` +
  `👥 <b>Реферальная комиссия:</b>\n` +
  `Уровень 1 — 5%\n` +
  `Уровень 2 — 3%\n\n` +
  `🕒 <b>Поддержка:</b> 24/7\n` +
  `➡️ <b>Два сигнала в день:</b> 11:00 и 13:00 по времени Великобритании (UK).\n\n` +
  `🔗 <b>Присоединяйтесь прямо сейчас:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 7: Compound Earnings power
  `📈 <b>The Power of Compound Earnings on NGK</b>\n\n` +
  `With daily compounding returns of up to 4% (2 signals of 2% each), your portfolio has exponential potential!\n\n` +
  `💡 <b>Scenario:</b>\n` +
  `Starting with 1,000 USDT ➡️ average daily gains of ~4%. Your deposit and accumulated profits can be withdrawn anytime after 8 successful copy trades. \n\n` +
  `🔒 All calculations are executed automatically by the advanced NGK cryptographic nodes, guaranteeing top-tier risk management and entry pricing.\n\n` +
  `🔗 <b>Activate License:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 8: Russian Referral & Rewards (Реферальные Бонусы)
  `🌟 <b>Реферальные бонусы NGK Exchange</b>\n\n` +
  `Приглашайте друзей и получайте взаимные бонусы:\n\n` +
  `💰 <b>Депозит 100 USDT:</b>\n` +
  `Пригласитель — <b>5 USDT</b> ｜ Пользователь — <b>3 USDT</b>\n\n` +
  `💰 <b>Депозит 500 USDT:</b>\n` +
  `Пригласитель — <b>30 USDT</b> ｜ Пользователь — <b>20 USDT</b>\n\n` +
  `💰 <b>Депозит 1000 USDT:</b>\n` +
  `Пригласитель — <b>70 USDT</b> ｜ Пользователь — <b>50 USDT</b>\n\n` +
  `🔗 Начните строить свою пассивную сеть сегодня!\n\n` +
  `🔗 <b>Ссылка для регистрации:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 9: Copy Trading Best Practices
  `📊 <b>NGK Copy-Trading Operational Rules</b>\n\n` +
  `To ensure 100% success rate on copy trades, follow these strict directives:\n\n` +
  `1️⃣ Ensure your balance has at least 100 USDT.\n` +
  `2️⃣ Open the Copy Trading dashboard 5 minutes before signal broadcast.\n` +
  `3️⃣ When the Signal goes live, click "Copy Trade" immediately to lock in the optimal execution price.\n` +
  `4️⃣ Do not manually close or interrupt the transaction; our node automated system settles the trade in precisely 30 minutes.\n\n` +
  `Strict adherence to rules guarantees maximum profit! 🚀\n\n` +
  `🔗 <b>Log In:</b> https://ngkexchange.site/?ref=GTX-PJJM7`,

  // Template 10: 24/7 Client support details
  `💬 <b>NGK Exchange Professional Support 24/7</b>\n\n` +
  `Need help with registration, deposits, KYC, or copy trading?\n\n` +
  `Our specialized client relations team is available 24/7 to resolve any issues. We support high-speed networks:\n` +
  `• <b>TRC20</b> (TRON network)\n` +
  `• <b>BEP20</b> (BSC network)\n` +
  `• <b>ERC20</b> (Ethereum network)\n\n` +
  `Enjoy seamless digital asset wealth management.\n\n` +
  `🔗 <b>Register:</b> https://ngkexchange.site/?ref=GTX-PJJM7`
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
    throw new Error(data.description || "Telegram API rejected the broadcast message.");
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
  customDirection?: string
) {
  // 1. Fetch Telegram Config
  const snap = await getDoc(doc(db, "system", "telegram_config"));
  if (!snap.exists()) {
    throw new Error("Telegram configuration does not exist in Firestore.");
  }
  const config = snap.data();
  const botToken = config.botToken || "";
  const channelId = config.channelId || "";
  if (!botToken || !channelId) {
    throw new Error("Missing botToken or channelId configuration.");
  }

  // 2. Select details
  const code = SERVER_VALID_ORDER_NUMBERS[Math.floor(Math.random() * SERVER_VALID_ORDER_NUMBERS.length)];
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

  // 3. Save Active Signal document in system/copyTradeSignal
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
    timestamp: startTime.toISOString()
  };
  await setDoc(doc(db, "system", "copyTradeSignal"), signalData);

  // 4. Format Beautiful HTML Telegram Post
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

  // 5. Post to Telegram
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
    throw new Error(data.description || "Failed to post message to Telegram channel.");
  }

  return {
    success: true,
    signal: signalData,
    telegramResponse: data
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
      const testMsg = `🔔 <b>NGK Exchange Bot Integration Verified!</b>\n\nYour representative bot @NGK_Signalbot has been successfully connected as an Admin to this channel! 🚀\n\nAutomated daily postings are now armed and ready. Let's make passive income seamless! 📈`;

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
      const { type, pair, direction } = req.body;
      if (!type || !["signal_1", "signal_2", "signal_3", "test"].includes(type)) {
        return res.status(400).json({ ok: false, error: "Invalid signal type requested." });
      }

      console.log(`[Manual Signal API] Triggering signal broadcast type=${type}, pair=${pair}, direction=${direction}`);
      const result = await triggerSignalCodeBroadcast(type, pair, direction);
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
      if (!autoPosterActive || !botToken || !channelId) return;

      const nowMs = Date.now();
      let nextPostAt = config.nextPostAt;

      // If nextPostAt is empty/missing, initialize it to the current time to trigger immediately
      if (!nextPostAt) {
        nextPostAt = new Date(nowMs).toISOString();
        await setDoc(doc(db, "system", "telegram_config"), { nextPostAt }, { merge: true });
      }

      const nextPostMs = new Date(nextPostAt).getTime();
      if (nowMs >= nextPostMs) {
        const lastPosterIndex = config.lastPosterIndex || 0;
        console.log(`[AutoPoster] Heartbeat matches schedule. Executing post index ${lastPosterIndex} to channel ${channelId}`);
        
        // Execute the Telegram sendMessage post
        await sendTelegramBroadcast(botToken, channelId, lastPosterIndex);

        // Schedule the subsequent post
        const intervalHrs = autoPosterInterval || 2.5;
        const nextIndex = (lastPosterIndex + 1) % TELEGRAM_TEMPLATES.length;
        const futurePostAt = new Date(nowMs + intervalHrs * 60 * 60 * 1000).toISOString();

        await setDoc(doc(db, "system", "telegram_config"), {
          lastPosterIndex: nextIndex,
          lastPostedAt: new Date(nowMs).toISOString(),
          nextPostAt: futurePostAt,
          updatedAt: new Date(nowMs).toISOString()
        }, { merge: true });

        console.log(`[AutoPoster] Post successful. Next post scheduled for ${futurePostAt} (Index ${nextIndex})`);
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
