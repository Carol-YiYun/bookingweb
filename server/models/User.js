// import mongoose from 'mongoose';


// 為了 vercel 部署，mongo 換成動態匯入
let RoomModel = null;
export async function getRoomModel(getMongoose) {
  if (RoomModel) return RoomModel;
  const mongoose = await getMongoose();
  const RoomSchema = new mongoose.Schema({ /* fields */ });
  RoomModel = mongoose.models.Room || mongoose.model("Room", RoomSchema);
  return RoomModel;
}


const UserSchma = new mongoose.Schema({
    username:{ // 用戶名稱
        type:String,
        required:true, // 必須上傳
        unique:true, // 避免同樣姓名的使用者
    },
    email:{
        type:String,
        required:true,
        unique:true, // email 也不能重複
    },
    password:{
        type:String, // 密碼
        required:true,
    },
  isAdmin:{
        type:Boolean, // 是否為後台管理員身份，所以不一定要先填
        default:false, // 就不用 required: true
        // 只要創建後台管理員帳號時上傳這欄位即可
    },
},{timestamps:true}) // 比 hotels 多了一個時間戳是為了記錄創建用戶時間，通常後台需要看到

export default mongoose.model("User",UserSchma) 
