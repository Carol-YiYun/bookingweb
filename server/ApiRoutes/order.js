// server/ApiRoutes/order.js
// 改成 handler 模式，取代 express.Router()

import { connectDB } from "../db.js";
import { getOrderModel } from "../models/Order.js";

// 共用回應
// const json = (res, code, data) => {
//   res.statusCode = code;
//   res.setHeader("Content-Type", "application/json; charset=utf-8");
//   res.end(JSON.stringify(data));
// };
const json = (req, res, code, data) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.statusCode = code;
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
  return json(req, res, 201, created);
}

// 抓取單一 Order by id
async function getOrder(req, res, Order, id) {
  const one = await Order.findById(id);
  return one ? json(req, res, 200, one) : json(req, res, 404, { error: "not found" });
}

// 更新 Order
async function updatedOrder(req, res, Order, id) {
  const body = await readBody(req);
  const updated = await Order.findByIdAndUpdate(id, body, { new: true });
  return updated ? json(req, res, 200, updated) : json(req, res, 404, { error: "not found" });
}

// 刪除單一 Order
async function deleteOrder(req, res, Order, id) {
  const r = await Order.findByIdAndDelete(id);
  return r ? json(req, res, 204, {}) : json(req, res, 404, { error: "not found" });
}

// 刪除全部 Orders
async function deleteAllOrder(req, res, Order) {
  await Order.deleteMany({});
  return json(req, res, 204, {});
}

// 抓取所有 Orders
async function getAllOrders(req, res, Order) {
  const list = await Order.find().limit(100);
  return json(req, res, 200, list);
}

// 抓取所有 Orders 的 name 欄位
async function getOrderData(req, res, Order) {
  const list = await Order.find().select("name");
  return json(req, res, 200, list);
}
/** ========== controllers ========== */

// 主 handler：根據路由分派
export async function orderHandler(req, res, getMongoose) {
  const url = new URL(req.url, "http://x");
  const parts = url.pathname.split("/").filter(Boolean); // ["api","v1","order", ...]
  // const id = parts[3];
  // const subPath = parts[4]; // e.g. "find" / "data"
  // 固定 "order" 在 index 2
  if (parts[2] !== "order") {
    return json(req, res, 405, { error: "method/path not allowed" });
  }
  const seg1 = parts[3]; // 可能是 undefined | ":id" | "find" | "data"
  const seg2 = parts[4]; // 當 seg1 === "find" 時的 :id

  try {
    await connectDB(getMongoose);
    const Order = await getOrderModel(getMongoose);

    // // POST /api/v1/order
    // if (req.method === "POST" && !id) return createOrder(req, res, Order);

    // // GET /api/v1/order/find/:id
    // if (req.method === "GET" && subPath === "find" && id)
    //   return getOrder(req, res, Order, id);

    // // PUT /api/v1/order/:id
    // if (req.method === "PUT" && id) return updatedOrder(req, res, Order, id);

    // // DELETE /api/v1/order/:id
    // if (req.method === "DELETE" && id) return deleteOrder(req, res, Order, id);

    // // DELETE /api/v1/order (全部)
    // if (req.method === "DELETE" && !id) return deleteAllOrder(req, res, Order);

    // // GET /api/v1/order (全部)
    // if (req.method === "GET" && !id && !subPath) return getAllOrders(req, res, Order);

    // // GET /api/v1/order/data
    // if (req.method === "GET" && subPath === "data") return getOrderData(req, res, Order);

    // POST /api/v1/order
    if (req.method === "POST" && !seg1) return createOrder(req, res, Order);

    // GET /api/v1/order/find/:id
    if (req.method === "GET" && seg1 === "find" && seg2)
      return getOrder(req, res, Order, seg2);

    // PUT /api/v1/order/:id
    if (req.method === "PUT" && seg1 && seg1 !== "find" && seg1 !== "data")
      return updatedOrder(req, res, Order, seg1);

    // DELETE /api/v1/order/:id
    if (req.method === "DELETE" && seg1 && seg1 !== "find" && seg1 !== "data")
      return deleteOrder(req, res, Order, seg1);

    // DELETE /api/v1/order  (全部)
    if (req.method === "DELETE" && !seg1) return deleteAllOrder(req, res, Order);

    // GET /api/v1/order  (全部)
    if (req.method === "GET" && !seg1) return getAllOrders(req, res, Order);

    // GET /api/v1/order/data
    if (req.method === "GET" && seg1 === "data") return getOrderData(req, res, Order);

    return json(req, res, 405, { error: "method/path not allowed" });
  } catch (e) {
    console.error("order handler error:", e);
    return json(req, res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}

