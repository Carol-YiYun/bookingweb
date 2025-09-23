import express from "express";
import serverless from "serverless-http";

const app = express();

// 最簡單的健康檢查
app.get("/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// 測試路由（不需要 rewrite，直接呼叫 /api/index.js 也會跑）
app.get("/api/v1/test", (req, res) => {
  res.json({ msg: "test ok" });
});

// 匯出給 Vercel
export default serverless(app);

// 簡單測試
// export default function handler(req, res) {
//   return res.status(200).json({ msg: "api alive" });
// }

// const handler = serverless(app);
// export default async function (req, res) {
//   return handler(req, res);
// }
