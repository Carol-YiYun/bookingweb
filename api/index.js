// api/index.js
// 單一 Serverless handler：不使用 express / serverless-http


// 這段要加在 handler 最上面，統一處理 CORS
// 統一處理 CORS（允許 prod / preview / 本機）
function setCors(req, res) {
  const origin = req.headers.origin || "";
  const allowList = new Set([
    "https://bookingweb-zeta.vercel.app",     // 你的前端正式網域
    "http://localhost:3000",
    "http://localhost:5173",
  ]);
  const isVercelPreview = /\.vercel\.app$/.test(origin);
  const allowed = allowList.has(origin) || isVercelPreview;

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", allowed ? origin : "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "600");
}


// 1) 共用：回傳 JSON
const json = (req, res, code, data) => {
  setCors(req, res);    // 重要：每次回應都設 CORS

  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

// 2) 共用：動態載入 mongoose（只載一次，供所有 routes 共用）
let mongooseInstance = null;
async function getMongoose() {
  if (mongooseInstance) return mongooseInstance;
  mongooseInstance = (await import("mongoose")).default;
  return mongooseInstance;
}



// 3) 入口 handler
export default async function handler(req, res) {
  // CORS 設定
  setCors(req, res);          // 任何請求一進來就設

  // 瀏覽器的預檢請求要回 200
  if (req.method === "OPTIONS") {
    setCors(req, res);        // 預檢也要帶到
    res.statusCode = 204;       // No Content
    return res.end();           // 立刻結束
  }
  // ==============================

  const { url, method } = req;

  try {
    // --- 基本測試 ---
    if (url === "/health") return json(req, res, 200, { ok: true, ts: Date.now() });
    if (url === "/api/v1/test" && method === "GET") return json(req, res, 200, { msg: "test ok" });

    // --- MongoDB 連線測試（確認雲端可載入 mongoose 並可連線）---
    if (url === "/api/v1/mongo-test") {
      try {
        const mongoose = await getMongoose();
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB);
        }
        return json(req, res, 200, { msg: "mongoose connected", version: mongoose.version });
      } catch (e) {
        return json(req, res, 500, { error: "mongo-test failed", detail: String(e?.message || e) });
      }
    }

    // --- 業務路由：動態載入對應檔並注入 getMongoose ---
    if (url.startsWith("/api/v1/hotels")) {
      const mod = await import("../server/ApiRoutes/hotels.js");
      return mod.hotelsHandler(req, res, getMongoose);
    }

    if (url.startsWith("/api/v1/rooms")) {
      const mod = await import("../server/ApiRoutes/rooms.js");
      return mod.roomsHandler(req, res, getMongoose);
    }

    if (url.startsWith("/api/v1/users")) {
      const mod = await import("../server/ApiRoutes/users.js");
      return mod.usersHandler(req, res, getMongoose);
    }

    if (url.startsWith("/api/v1/auth")) {
      const mod = await import("../server/ApiRoutes/auth.js");
      return mod.authHandler(req, res, getMongoose);
    }

    if (url.startsWith("/api/v1/order")) {
      const mod = await import("../server/ApiRoutes/order.js");
      return mod.orderHandler(req, res, getMongoose);
    }

    // 未匹配
    return json(req, res, 404, { error: "not found" });
  } catch (e) {
    console.error("global handler error:", e);
    return json(req, res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}

