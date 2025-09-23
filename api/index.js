import mongoose from "mongoose"
//ES6後import 與export 取代了原本舊版的require
import express  from "express"; 
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

import hotelsApiRoute from "./ApiRoutes/hotels.js"
import roomsApiRoute from "./ApiRoutes/rooms.js"
import usersApiRoute from "./ApiRoutes/users.js"
import authApiRoute from "./ApiRoutes/auth.js"
import orderApiRoute from "./ApiRoutes/order.js"

// add for vercel
import serverless from "serverless-http";

dotenv.config()

const app = express()

// 若部署後與前端同網域，通常可關閉 CORS。
// 開發期本機多埠可臨時開啟：
// app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"], credentials: true }));



// const connect = async() => {
//     try{
//      await mongoose.connect(process.env.MONGODB)
//         console.log("Connected to mongoDB")
//     }catch(error){
//         console.log("disconnected to mongoDB")
//     }
// }

// mongoose.connection.on("connected",()=>{
//     console.log("MongoDB connected!")
// })
// mongoose.connection.on("disconnected",()=>{
//     console.log("MongoDB disconnected!")
// })

// const port =5000;
// app.listen(port,()=>{
//      connect();
//     console.log(`connected to ${port} backend`)
//     //並要像npm start 一樣啟動它，
// })

// app.use(cors()) 
app.use(cookieParser())
app.use(express.json())//讓上傳的req.body可以視為json

// --- MongoDB 連線（Serverless 單一冷啟後共用） ---
let mongoReady = false;

async function connectDB() {
  if (mongoReady) return;
  if (mongoose.connection.readyState === 1) {
    mongoReady = true;
    return;
  }
  await mongoose.connect(process.env.MONGODB);
  mongoReady = true;

  // 可選：事件監聽（只在第一次綁定）
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected!");
  });
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected!");
  });
}

// 在每個請求前確保連線已就緒
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// --- 路由 ---
app.get("/health", (req, res) => res.json({ ok: true }));
///middlewares中間代理商概念
app.use("/api/v1/hotels",hotelsApiRoute)
app.use("/api/v1/rooms",roomsApiRoute)
app.use("/api/v1/users",usersApiRoute)
app.use("/api/v1/auth",authApiRoute)
app.use("/api/v1/order",orderApiRoute)

//如果上述ApiRoute傳接有問題可以來這邊回傳錯誤訊息
app.use((error,req,res, next )=>{
    const errorStatus =error.status || 500 ;
    const errorMessage =error.message || "中間ApiRoute出錯";
    const errorDetail = error.detail
    return res.status(errorStatus).json({ //return回去讓他可以被next(error) catch
        status:errorStatus,
        message:errorMessage,
        detail:errorDetail
    })
})

// 匯出給 Vercel Serverless
export default serverless(app);