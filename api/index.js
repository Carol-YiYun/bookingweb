import { hotelsHandler } from "../server/ApiRoutes/hotels.js";
// import { roomsHandler } from "./server/ApiRoutes/rooms.js";

// 極簡 Router（不依賴 express/serverless-http）
const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

export default async function handler(req, res) {
  const { url, method } = req;

  // 測試 API
  if (url === "/health") return json(res, 200, { ok: true, ts: Date.now() });

  // 範例測試
  if (url === "/api/v1/test" && method === "GET")
    return json(res, 200, { msg: "test ok" });

  // // Hotels API
  // if (url.startsWith("/api/v1/hotels")) {
  //   return hotelsHandler(req, res);
  // }

  // // Rooms API
  // if (url.startsWith("/api/v1/rooms")) {
  //   return roomsHandler(req, res);
  // }
  

  return json(res, 404, { error: "not found" });
}