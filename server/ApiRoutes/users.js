// server/ApiRoutes/users.js

import { connectDB } from "../db.js";
import { getUserModel } from "../models/User.js";

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
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

/** ========== controllers ========== */
async function updateUser(req, res, User, id) {
  const body = await readBody(req);
  const updated = await User.findByIdAndUpdate(id, body, { new: true });
  return updated ? json(res, 200, updated) : json(res, 404, { error: "not found" });
}

async function deletedUser(_req, res, User, id) {
  const r = await User.findByIdAndDelete(id);
  return r ? json(res, 204, {}) : json(res, 404, { error: "not found" });
}

async function getUser(_req, res, User, id) {
  const one = await User.findById(id);
  return one ? json(res, 200, one) : json(res, 404, { error: "not found" });
}

async function getAllUsers(_req, res, User) {
  const list = await User.find().limit(100);
  return json(res, 200, list);
}
/** ========== controllers ========== */


// 改成 handler 函數，取代 Express Router
export async function usersHandler(req, res, getMongoose) {
  const url = new URL(req.url, "http://x");
  const parts = url.pathname.split("/").filter(Boolean); // ["api","v1","users",":id?"]
  const id = parts[3];

  try {
    await connectDB(getMongoose);
    const User = await getUserModel(getMongoose);

    if (req.method === "PUT" && id)   return updateUser(req, res, User, id);
    if (req.method === "DELETE" && id) return deletedUser(req, res, User, id);
    if (req.method === "GET" && id)    return getUser(req, res, User, id);
    if (req.method === "GET" && !id)   return getAllUsers(req, res, User);

    return json(res, 405, { error: "method not allowed" });
  } catch (e) {
    console.error("users handler error:", e);
    return json(res, 500, { error: "server error", detail: String(e?.message || e) });
  }
}

