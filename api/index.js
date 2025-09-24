// api/index.js



// 一次加一個 import 並測試一次 --- add for test hotelsHandler
// import { hotelsHandler } from "../server/ApiRoutes/hotels.js";



const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};


// export default async function handler(req, res) {
//   if (req.url === "/health") return json(res, 200, { ok: true, ts: Date.now() });
//   if (req.url === "/api/v1/test") return json(res, 200, { msg: "test ok" });

//   return json(res, 404, { error: "not found" });
// }

// // 以下 --- add for test hotelsHandler
// export default async function handler(req, res) {
//   try {
//     const { url, method } = req;

//     // 測試 API
//     if (url === "/health") return json(res, 200, { ok: true, ts: Date.now() });
//     if (url === "/api/v1/test" && method === "GET") return json(res, 200, { msg: "test ok" });

//     // 第一次只啟用 Hotels API
//     if (url.startsWith("/api/v1/hotels")) return hotelsHandler(req, res);

//     return json(res, 404, { error: "not found" });
//   } catch (e) {
//     console.error(e);
//     return json(res, 500, { error: "server error", detail: String(e?.message || e) });
//   }
// }

// 延遲 import
export default async function handler(req, res) {
  const { url, method } = req;

  try {
    // --- 測試 API ---
    if (url === "/health") {
      return json(res, 200, { ok: true, ts: Date.now() });
    }

    if (url === "/api/v1/test" && method === "GET") {
      return json(res, 200, { msg: "test ok" });
    }

    // --- Mongoose 連線測試 API ---
    if (url === "/api/v1/mongo-test") {
      try {
        const { connectDB } = await import("../server/db.js");
        await connectDB();
        return json(res, 200, { msg: "mongoose connected" });
      } catch (e) {
        return json(res, 500, { error: "mongo-test failed", detail: String(e?.message || e) });
      }
    }

    // --- Hotels API ---
    if (url.startsWith("/api/v1/hotels")) {
      try {
        const mod = await import("../server/ApiRoutes/hotels.js");
        return mod.hotelsHandler(req, res);
      } catch (e) {
        return json(res, 500, { error: "hotels import failed", detail: String(e?.message || e) });
      }
    }

    return json(res, 404, { error: "not found" });
  } catch (e) {
    console.error("global handler error:", e);
    return json(res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}

