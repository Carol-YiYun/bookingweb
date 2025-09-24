import { connectDB } from "../db.js";
// import Room from "../models/Room.js";
import { getRoomModel } from "../models/Room.js";


const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

export async function roomsHandler(req, res, getMongoose) {
  const url = new URL(req.url, "http://x"); 
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[3]; // /api/v1/rooms/:id

  try {
    await connectDB(getMongoose);
    const Room = await getRoomModel(getMongoose);


    if (req.method === "GET" && !id) {
      const list = await Room.find().limit(50);
      return json(res, 200, list);
    }

    if (req.method === "GET" && id) {
      const one = await Room.findById(id);
      return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
    }

    return json(res, 405, { error: "method not allowed" });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: "server error", detail: e.message });
  }
}