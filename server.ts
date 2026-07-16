import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

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

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
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
