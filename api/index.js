import express from "express";
import serverless from "serverless-http";

const app = express();

// 最簡單的健康檢查
app.get("/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// 匯出給 Vercel
export default serverless(app);

