// client/src/api.js

import axios from "axios";

// 後端 API 網域（Vercel 部署的後端專案）
const BASE_URL =
  process.env.REACT_APP_API_BASE || "https://bookingweb-bb22.vercel.app/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,     // 後端 API 的 baseURL
  withCredentials: false // 如果沒有用 cookie，可保持 false
});

// ---- Hotels ----
export const getHotels = () => api.get("/api/v1/hotels");
export const getHotelById = (id) => api.get(`/api/v1/hotels/find/${id}`);
export const createHotel = (data) => api.post("/api/v1/hotels", data);

// ---- Auth ----
export const login = (data) => api.post("/api/v1/auth/login", data);
export const register = (data) => api.post("/api/v1/auth/register", data);

