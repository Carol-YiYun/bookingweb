import mongoose from 'mongoose';
const HotelSchema = new mongoose.Schema({
    name:{
        type:String, // 住宿名稱
        required:true, // 必要存在
    }, // required 加上去後如果 post 上去沒有這欄，會上傳失敗
    type:{
        type:String, // 住宿型態，可能是飯店、公寓、民宿等等
        required:true, // 產品也常需要這種分類
    },
    city:{
        type:String, // 同於地址的城市
        required:true, // 有不同的城市可以 filter
    },
    address:{
        type:String, // 城市下的子資料，會在 hotelPage 完整顯示
        required:true,
    },
    distance:{
        type:String,
    },
    photos:{
        type:[String],
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    desc:{
        type:String,
        required:true,
    },
    rating:{
        type:Number,
        min:0,
        max:10,
    },
    rooms:{
        type:[String],
    },
    cheapestPrice:{
        type:Number,
        required:true,
    },
   popularHotel:{
        type:Boolean,
        default:false,
    },
    comments:{
        type:Number,
        default:0,
    }
})
export default mongoose.model("Hotel",HotelSchema)
