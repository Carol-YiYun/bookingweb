// server/ApiRoutes/rooms.js
// 以 handler 取代 express.Router()，基底路由為 /rooms

import { connectDB } from "../db.js";
import { getRoomModel } from "../models/Room.js";

// 共用：JSON 回應
const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

// 共用：讀取 body
async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

/** ===================== controllers ===================== */
// POST /api/v1/rooms/:hotelid  建立房間（最小實作：將 hotelId 帶到房間文件上）
async function createRoom(req, res, Room, hotelid) {
  const body = await readBody(req);
  const created = await Room.create({ ...body, hotelId: hotelid });
  return json(res, 201, created);
}

// PUT /api/v1/rooms/:id  更新房間（整體更新）
async function updatedRoom(req, res, Room, id) {
  const body = await readBody(req);
  const updated = await Room.findByIdAndUpdate(id, body, { new: true });
  return updated ? json(res, 200, updated) : json(res, 404, { error: "not found" });
}

// PUT /api/v1/rooms/reservartiondates/:id  只更新不可預訂日期（最小實作：更新頂層 unavailableDates）
async function updatedRoomDates(req, res, Room, id) {
  const body = await readBody(req); // 期望 { dates: [ISOString...] }
  const dates = Array.isArray(body.dates) ? body.dates : [];
  const updated = await Room.findByIdAndUpdate(
    id,
    { $addToSet: { unavailableDates: { $each: dates } } },
    { new: true }
  );
  return updated ? json(res, 200, updated) : json(res, 404, { error: "not found" });
}

// DELETE /api/v1/rooms/:hotelid/:id  刪除房間（最小實作：僅刪除 Room 文件）
async function deleteRoom(_req, res, Room, _hotelid, id) {
  const r = await Room.findByIdAndDelete(id);
  return r ? json(res, 204, {}) : json(res, 404, { error: "not found" });
}

// GET /rooms/find/:id  讀取單筆房間
async function getRoom(_req, res, Room, id) {
  const one = await Room.findById(id);
  return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
}

// GET /api/v1/rooms/findroom/:id  以 roomNumberID 反查 Room（常見結構：roomNumbers._id）
async function getRoomData(_req, res, Room, roomNumberId) {
  const one = await Room.findOne({ "roomNumbers._id": roomNumberId });
  return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
}

// GET /api/v1/rooms  讀取所有房間
async function getAllRooms(_req, res, Room) {
  const list = await Room.find().limit(100);
  return json(res, 200, list);
}

// GET /api/v1/rooms/findHotel/:hotelid  讀取某飯店的所有房間（最小實作：以 room.hotelId 過濾）
async function getHotelRooms(_req, res, Room, hotelid) {
  const list = await Room.find({ hotelId: hotelid }).limit(200);
  return json(res, 200, list);
}
/** ===================== controllers ===================== */

// 主 handler：解析路由並分派到對應 controller
export async function roomsHandler(req, res, getMongoose) {
  const url = new URL(req.url, "http://x");              // fake base
  const parts = url.pathname.split("/").filter(Boolean);  // e.g. ["api", "v1", "rooms", "find", ":id"]
  const seg0 = parts[0];            // "rooms"
  const seg1 = parts[1];            // 可能是 ":id" | "find" | "findroom" | "reservartiondates" | "findHotel"
  const seg2 = parts[2];            // 可能是 ":id" 或 ":hotelid"
  const seg3 = parts[3];            // 在 /rooms/:hotelid/:id 用到

  try {
    // 連線並取 model
    await connectDB(getMongoose);
    const Room = await getRoomModel(getMongoose);

    // ==== 建立 ====
    // POST /api/v1/rooms/:hotelid
    if (req.method === "POST" && seg0 === "rooms" && seg1 && !seg2) {
      return createRoom(req, res, Room, seg1);
    }

    // ==== 更新 ====
    // PUT /api/v1/rooms/:id
    if (req.method === "PUT" && seg0 === "rooms" && seg1 && !seg2) {
      return updatedRoom(req, res, Room, seg1);
    }

    // PUT /api/v1/rooms/reservartiondates/:id
    if (req.method === "PUT" && seg0 === "rooms" && seg1 === "reservartiondates" && seg2) {
      return updatedRoomDates(req, res, Room, seg2);
    }

    // ==== 刪除 ====
    // DELETE /api/v1/rooms/:hotelid/:id
    if (req.method === "DELETE" && seg0 === "rooms" && seg1 && seg2 && !seg3) {
      return deleteRoom(req, res, Room, seg1, seg2);
    }

    // ==== 查詢 ====
    // GET /api/v1/rooms/find/:id
    if (req.method === "GET" && seg0 === "rooms" && seg1 === "find" && seg2) {
      return getRoom(req, res, Room, seg2);
    }

    // GET /api/v1/rooms/findroom/:id
    if (req.method === "GET" && seg0 === "rooms" && seg1 === "findroom" && seg2) {
      return getRoomData(req, res, Room, seg2);
    }

    // GET /api/v1/rooms/findHotel/:hotelid
    if (req.method === "GET" && seg0 === "rooms" && seg1 === "findHotel" && seg2) {
      return getHotelRooms(req, res, Room, seg2);
    }

    // GET /api/v1/rooms
    if (req.method === "GET" && seg0 === "rooms" && !seg1) {
      return getAllRooms(req, res, Room);
    }

    // 其他未支援
    return json(res, 405, { error: "method/path not allowed" });
  } catch (e) {
    console.error("rooms handler error:", e);
    return json(res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}

