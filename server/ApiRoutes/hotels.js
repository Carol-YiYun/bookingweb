// server/ApiRoutes/hotels.js

import { connectDB } from "../db.js";
import { getHotelModel } from "../models/Hotel.js";

// import Hotel from "../models/Hotel.js";

// 共用 JSON 回應函式
const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

/** ========== controllers ========== */
// 取得全部 Hotels
async function getAllHotels(_req, res, Hotel) {
  const list = await Hotel.find().limit(50);
  return json(res, 200, list);
}

// 依 ID 取得單一 Hotel
async function getHotelById(_req, res, Hotel, id) {
  const one = await Hotel.findById(id);
  return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
}

// TODO: 未來可擴充 createHotel / updateHotel / deleteHotel
/** ========== controllers ========== */

// 主 handler：判斷路由與 method，分派給對應的 controller
export async function hotelsHandler(req, res, getMongoose) {
  const url = new URL(req.url, "http://x");              // fake base 解析 url
  const parts = url.pathname.split("/").filter(Boolean); // ["api","v1","hotels",":id?"]
  const id = parts[3];                                   // /api/v1/hotels/:id → index 3

  try {
    // 確保 MongoDB 已連線，並取得 model
    await connectDB(getMongoose);
    const Hotel = await getHotelModel(getMongoose);

    // GET /api/v1/hotels → 取得全部
    if (req.method === "GET" && !id) {
      return getAllHotels(req, res, Hotel);
    }

    // GET /api/v1/hotels/:id → 取得單一
    if (req.method === "GET" && id) {
      return getHotelById(req, res, Hotel, id);
    }

    // 其他未支援的 method
    return json(res, 405, { error: "method not allowed" });
  } catch (e) {
    console.error("hotels handler error:", e);
    return json(res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}



// export async function hotelsHandler(req, res, getMongoose) {
//   const url = new URL(req.url, "http://x"); // fake base for parsing
//   const parts = url.pathname.split("/").filter(Boolean); 
//   const id = parts[3]; // /api/v1/hotels/:id → index 3

//   try {
//     // await connectDB();
//     // 20250925 added
//     // const Hotel = await getHotelModel();  // ← 重要：動態取得 model

//     const mongoose = await connectDB(getMongoose);
//     const Hotel = await getHotelModel(getMongoose);


//     if (req.method === "GET" && !id) {
//       const list = await Hotel.find().limit(50);
//       return json(res, 200, list);
//     }

//     if (req.method === "GET" && id) {
//       const one = await Hotel.findById(id);
//       return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
//     }

//     // 可再加 POST/PUT/DELETE
//     return json(res, 405, { error: "method not allowed" });
//   } catch (e) {
//     // console.error(e);
//     // return json(res, 500, { error: "server error", detail: e.message });

//     // 20250925 added
//     console.error("hotels handler error:", e);
//     return json(res, 500, { error: "server error", detail: String(e?.message || e) });
//   }
// }

