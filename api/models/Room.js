import mongoose from 'mongoose';
const RoomSchema = new mongoose.Schema({
    title:{
        type:String, // 房間名稱，例如：海景房、雙人房
        required:true,
    },
    desc:{ // 房間描述，如：獨立衛浴
        type:String,
        required:true,
    },
    price:{ // 房型價格
        type:Number,
        required:true,
    },
    maxPeople:{ // 最多住幾人
        type:Number,
        required:true,
    },
    roomNumbers:[{ // 房型編號
       number:Number, 
       unavailableDates:[{type:Date}],
       // 紀錄已預訂的時間，以便 calendar 抓取
    }],
},{timestamps:true})
export default mongoose.model("Room",RoomSchema)


// [
//     {number:1022, unavilbaleDates:[01.02.2022,02.02.2023]}
// ]