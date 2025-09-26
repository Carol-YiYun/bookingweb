// import mongoose from 'mongoose';

// 改成工廠函式，避免 mongoose 未定義
let UserModel = null;


// const UserSchma = new mongoose.Schema({
//     username:{ // 用戶名稱
//         type:String,
//         required:true, // 必須上傳
//         unique:true, // 避免同樣姓名的使用者
//     },
//     email:{
//         type:String,
//         required:true,
//         unique:true, // email 也不能重複
//     },
//     password:{
//         type:String, // 密碼
//         required:true,
//     },
//   isAdmin:{
//         type:Boolean, // 是否為後台管理員身份，所以不一定要先填
//         default:false, // 就不用 required: true
//         // 只要創建後台管理員帳號時上傳這欄位即可
//     },
// },{timestamps:true}) // 比 hotels 多了一個時間戳是為了記錄創建用戶時間，通常後台需要看到

// export default mongoose.model("User",UserSchma) 

export async function getUserModel(getMongoose) {
  if (UserModel) return UserModel;

  const mongoose = await getMongoose();
  const { Schema } = mongoose;

  const UserSchema = new Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  );

  UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
  return UserModel;
}

