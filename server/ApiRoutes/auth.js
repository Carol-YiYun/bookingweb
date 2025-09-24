// server/ApiRoutes/auth.js
// 改為 handler 模式，並加上中文註解，方便理解每個部分

import { connectDB } from "../db.js";
import { getUserModel } from "../models/User.js";

// 共用 JSON 回應函式
const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

// 讀取 request body 的工具函式（async/await）
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
// 註冊 API 對應的控制器
async function registerController(req, res, User) {
  const body = await readBody(req);
  const bcrypt = (await import("bcryptjs")).default;

  // 驗證必要欄位
  if (!body.email || !body.password) {
    return json(res, 400, { error: "email 和 password 必填" });
  }

  // 檢查 email 是否已存在
  const exists = await User.findOne({ email: body.email });
  if (exists) return json(res, 409, { error: "email 已被註冊" });

  // Hash 密碼後存進資料庫
  const hashed = await bcrypt.hash(String(body.password), 10);
  const created = await User.create({ ...body, password: hashed });

  // 回傳結果前去除 password 欄位
  const obj = created.toObject?.() || created;
  delete obj.password;
  return json(res, 201, obj);
}

// 登入 API 對應的控制器
async function loginController(req, res, User) {
  const body = await readBody(req);
  const bcrypt = (await import("bcryptjs")).default;

  // 檢查使用者是否存在
  const user = await User.findOne({ email: body.email });
  if (!user) return json(res, 401, { error: "帳號或密碼錯誤" });

  // 驗證密碼
  const ok = await bcrypt.compare(String(body.password || ""), String(user.password || ""));
  if (!ok) return json(res, 401, { error: "帳號或密碼錯誤" });

  // 簽發 JWT
  const jwt = await import("jsonwebtoken");
  const token = jwt.sign(
    { id: String(user._id), email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" } // 預設 7 天過期
  );

  // 回傳 user 資料（去除 password）
  const obj = user.toObject?.() || user;
  delete obj.password;
  return json(res, 200, { token, user: obj });
}
/** ========== controllers ========== */

// 主 handler：判斷路由，分派給對應的控制器
export async function authHandler(req, res, getMongoose) {
  const url = new URL(req.url, "http://x");
  const path = url.pathname; // e.g. /api/v1/auth/register | /api/v1/auth/login

  try {
    // 確保 MongoDB 已連線
    await connectDB(getMongoose);
    const User = await getUserModel(getMongoose);

    // 路由分派
    if (req.method === "POST" && path === "/api/v1/auth/register") {
      return registerController(req, res, User);
    }

    if (req.method === "POST" && path === "/api/v1/auth/login") {
      return loginController(req, res, User);
    }

    // 其他未支援的 method/path
    return json(res, 405, { error: "不支援的 method/path" });
  } catch (e) {
    console.error("auth handler error:", e);
    return json(res, 500, { error: "伺服器錯誤", detail: String(e?.message || e) });
  }
}

