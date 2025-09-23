import { connectDB } from "../db.js";
import Hotel from "../models/Hotel.js";

const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

export async function hotelsHandler(req, res) {
  const url = new URL(req.url, "http://x"); // fake base for parsing
  const parts = url.pathname.split("/").filter(Boolean); 
  const id = parts[3]; // /api/v1/hotels/:id → index 3

  try {
    await connectDB();

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
    console.error(e);
    return json(res, 500, { error: "server error", detail: e.message });
  }
}