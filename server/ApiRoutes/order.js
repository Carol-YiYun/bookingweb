// server/ApiRoutes/order.js
// 改成 handler 模式，取代 express.Router()

import { connectDB } from "../db.js";
import { getOrderModel } from "../models/Order.js";

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
// 創建 Order
async function createOrder(req, res, Order) {
  const body = await readBody(req);
  const created = await Order.create(body);
  return json(res, 201, created);
}

// 抓取單一 Order by id
async function getOrder(_req, res, Order, id) {
  const one = await Order.findById(id);
  return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
}

// 更新 Order
async function updatedOrder(req, res, Order, id) {
  const body = await readBody(req);
  const updated = await Order.findByIdAndUpdate(id, body, { new: true });
  return updated ? json(res, 200, updated) : json(res, 404, { error: "not found" });
}

// 刪除單一 Order
async function deleteOrder(_req, res, Order, id) {
  const r = await Order.findByIdAndDelete(id);
  return r ? json(res, 204, {}) : json(res, 404, { error: "not found" });
}

// 刪除全部 Orders
async function deleteAllOrder(_req, res, Order) {
  await Order.deleteMany({});
  return json(res, 204, {});
}

// 抓取所有 Orders
async function getAllOrders(_req, res, Order) {
  const list = await Order.find().limit(100);
  return json(res, 200, list);
}

// 抓取所有 Orders 的 name 欄位
async function getOrderData(_req, res, Order) {
  const list = await Order.find().select("name");
  return json(res, 200, list);
}
/** ========== controllers ========== */

// 主 handler：根據路由分派
export async function orderHandler(req, res, getMongoose) {
  const url = new URL(req.url, "http://x");
  const parts = url.pathname.split("/").filter(Boolean); // ["api","v1","order", ...]
  const id = parts[3];
  const subPath = parts[4]; // e.g. "find" / "data"

  try {
    await connectDB(getMongoose);
    const Order = await getOrderModel(getMongoose);

    // POST /api/v1/order
    if (req.method === "POST" && !id) return createOrder(req, res, Order);

    // GET /api/v1/order/find/:id
    if (req.method === "GET" && subPath === "find" && id)
      return getOrder(req, res, Order, id);

    // PUT /api/v1/order/:id
    if (req.method === "PUT" && id) return updatedOrder(req, res, Order, id);

    // DELETE /api/v1/order/:id
    if (req.method === "DELETE" && id) return deleteOrder(req, res, Order, id);

    // DELETE /api/v1/order
    if (req.method === "DELETE" && !id) return deleteAllOrder(req, res, Order);

    // GET /api/v1/order (全部)
    if (req.method === "GET" && !id && !subPath) return getAllOrders(req, res, Order);

    // GET /api/v1/order/data
    if (req.method === "GET" && subPath === "data") return getOrderData(req, res, Order);

    return json(res, 405, { error: "method/path not allowed" });
  } catch (e) {
    console.error("order handler error:", e);
    return json(res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}

