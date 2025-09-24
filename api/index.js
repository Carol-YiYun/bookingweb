// api/index.js
// 單一 Serverless handler：不使用 express / serverless-http

// 1) 共用：回傳 JSON
const json = (res, code, data) => {
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
  const { url, method } = req;

  try {
    // --- 基本測試 ---
    if (url === "/health") return json(res, 200, { ok: true, ts: Date.now() });
    if (url === "/api/v1/test" && method === "GET") return json(res, 200, { msg: "test ok" });

    // --- MongoDB 連線測試（確認雲端可載入 mongoose 並可連線）---
    if (url === "/api/v1/mongo-test") {
      try {
        const mongoose = await getMongoose();
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB);
        }
        return json(res, 200, { msg: "mongoose connected", version: mongoose.version });
      } catch (e) {
        return json(res, 500, { error: "mongo-test failed", detail: String(e?.message || e) });
      }
    }

    // --- 業務路由：動態載入對應檔並注入 getMongoose ---
    if (url.startsWith("/hotels")) {
      const mod = await import("../server/ApiRoutes/hotels.js");
      return mod.hotelsHandler(req, res, getMongoose);
    }

    if (url.startsWith("/rooms")) {
      const mod = await import("../server/ApiRoutes/rooms.js");
      return mod.roomsHandler(req, res, getMongoose);
    }

    if (url.startsWith("/users")) {
      const mod = await import("../server/ApiRoutes/users.js");
      return mod.usersHandler(req, res, getMongoose);
    }

    if (url.startsWith("/auth")) {
      const mod = await import("../server/ApiRoutes/auth.js");
      return mod.authHandler(req, res, getMongoose);
    }

    if (url.startsWith("/order")) {
      const mod = await import("../server/ApiRoutes/order.js");
      return mod.orderHandler(req, res, getMongoose);
    }

    // 未匹配
    return json(res, 404, { error: "not found" });
  } catch (e) {
    console.error("global handler error:", e);
    return json(res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}

