// server/ApiRoutes/hotels.js

import { connectDB } from "../db.js";
import { getHotelModel } from "../models/Hotel.js";

// import Hotel from "../models/Hotel.js";

const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

export async function hotelsHandler(req, res, getMongoose) {
  const url = new URL(req.url, "http://x"); // fake base for parsing
  const parts = url.pathname.split("/").filter(Boolean); 
  const id = parts[3]; // /api/v1/hotels/:id → index 3

  try {
    // await connectDB();
    // 20250925 added
    // const Hotel = await getHotelModel();  // ← 重要：動態取得 model

    const mongoose = await connectDB(getMongoose);
    const Hotel = await getHotelModel(getMongoose);


    if (req.method === "GET" && !id) {
      const list = await Hotel.find().limit(50);
      return json(res, 200, list);
    }

    if (req.method === "GET" && id) {
      const one = await Hotel.findById(id);
      return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
    }

    // 可再加 POST/PUT/DELETE
    return json(res, 405, { error: "method not allowed" });
  } catch (e) {
    // console.error(e);
    // return json(res, 500, { error: "server error", detail: e.message });

    // 20250925 added
    console.error("hotels handler error:", e);
    return json(res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}