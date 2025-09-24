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

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

/** ========== controllers ========== */
// 創建 Hotel
async function createHotel(req, res, Hotel) {
  const body = await readBody(req);
  const created = await Hotel.create(body);
  return json(res, 201, created);
}

// 取得單一 Hotel
async function getHotel(_req, res, Hotel, id) {
  const one = await Hotel.findById(id);
  return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
}

// 更新 Hotel
async function updatedHotel(req, res, Hotel, id) {
  const body = await readBody(req);
  const updated = await Hotel.findByIdAndUpdate(id, body, { new: true });
  return updated ? json(res, 200, updated) : json(res, 404, { error: "not found" });
}

// 刪除 Hotel
async function deleteHotel(_req, res, Hotel, id) {
  const r = await Hotel.findByIdAndDelete(id);
  return r ? json(res, 204, {}) : json(res, 404, { error: "not found" });
}

// 取得所有 Hotels
async function getAllHotels(_req, res, Hotel) {
  const list = await Hotel.find().limit(100);
  return json(res, 200, list);
}

// 按住宿類型統計
async function amountOfType(_req, res, Hotel) {
  const data = await Hotel.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } }
  ]);
  return json(res, 200, data);
}

// 按城市統計
async function amountOfCities(_req, res, Hotel) {
  const data = await Hotel.aggregate([
    { $group: { _id: "$city", count: { $sum: 1 } } }
  ]);
  return json(res, 200, data);
}
/** ========== controllers ========== */

// 主 handler
export async function hotelsHandler(req, res, getMongoose) {
  // 先記錄進來的 URL
  console.log("=== hotels handler in ===");
  console.log("req.url =", req.url);

  const url = new URL(req.url, "http://x");
  const parts = url.pathname.split("/").filter(Boolean); // ["api","v1","hotels", ...]
  console.log("parts =", parts);

  // const id = parts[2]; // /hotels/find/:id → index 2
  // const subPath = parts[1]; // e.g. "find", "amountoftype", "amountofcities"
  
  // const base = 2;                                       // 固定 "hotels" 的索引
  // if (parts[base] !== "hotels") return json(res, 405, { error: "method/path not allowed" });
  const base = parts.indexOf("hotels");
  if (base === -1) return json(res, 405, { error: "method/path not allowed" });


  const seg1 = parts[base + 1]; // 可能是 undefined | "find" | ":id" | "amountoftype" | "amountofcities"
  const seg2 = parts[base + 2]; // 當 seg1 === "find" 時的 :id

  try {
    await connectDB(getMongoose);
    const Hotel = await getHotelModel(getMongoose);

    // POST /api/v1/hotels
    if (req.method === "POST" && parts[0] === "hotels" && !subPath) {
      return createHotel(req, res, Hotel);
    }

    // GET /api/v1/hotels/find/:id
    if (req.method === "GET" && parts[0] === "hotels" && subPath === "find" && id) {
      return getHotel(req, res, Hotel, id);
    }

    // PUT /api/v1/hotels/:id
    if (req.method === "PUT" && parts[0] === "hotels" && subPath) {
      return updatedHotel(req, res, Hotel, subPath); // subPath 在這裡就是 id
    }

    // DELETE /api/v1/hotels/:id
    if (req.method === "DELETE" && parts[0] === "hotels" && subPath) {
      return deleteHotel(req, res, Hotel, subPath); // subPath 在這裡就是 id
    }

    // GET /api/v1/hotels
    if (req.method === "GET" && parts[0] === "hotels" && !subPath) {
      return getAllHotels(req, res, Hotel);
    }

    // GET /api/v1/hotels/amountoftype
    if (req.method === "GET" && parts[0] === "hotels" && subPath === "amountoftype") {
      return amountOfType(req, res, Hotel);
    }

    // GET /api/v1/hotels/amountofcities
    if (req.method === "GET" && parts[0] === "hotels" && subPath === "amountofcities") {
      return amountOfCities(req, res, Hotel);
    }

    return json(res, 405, { error: "method/path not allowed" });
  } catch (e) {
    console.error("hotels handler error:", e);
    return json(res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}



// /** ========== controllers ========== */
// // 取得全部 Hotels
// async function getAllHotels(_req, res, Hotel) {
//   const list = await Hotel.find().limit(50);
//   return json(res, 200, list);
// }

// // 依 ID 取得單一 Hotel
// async function getHotelById(_req, res, Hotel, id) {
//   const one = await Hotel.findById(id);
//   return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
// }

// // TODO: 未來可擴充 createHotel / updateHotel / deleteHotel
// /** ========== controllers ========== */

// // 主 handler：判斷路由與 method，分派給對應的 controller
// export async function hotelsHandler(req, res, getMongoose) {
//   const url = new URL(req.url, "http://x");              // fake base 解析 url
//   const parts = url.pathname.split("/").filter(Boolean); // ["api","v1","hotels",":id?"]
//   const id = parts[3];                                   // /api/v1/hotels/:id → index 3

//   try {
//     // 確保 MongoDB 已連線，並取得 model
//     await connectDB(getMongoose);
//     const Hotel = await getHotelModel(getMongoose);

//     // GET /api/v1/hotels → 取得全部
//     if (req.method === "GET" && !id) {
//       return getAllHotels(req, res, Hotel);
//     }

//     // GET /api/v1/hotels/:id → 取得單一
//     if (req.method === "GET" && id) {
//       return getHotelById(req, res, Hotel, id);
//     }

//     // 其他未支援的 method
//     return json(res, 405, { error: "method not allowed" });
//   } catch (e) {
//     console.error("hotels handler error:", e);
//     return json(res, 500, { error: "server error", detail: String(e?.message || e) });
//   }
// }

