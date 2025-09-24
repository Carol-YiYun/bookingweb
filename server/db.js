// import mongoose from "mongoose";

// let ready = false;

// export async function connectDB() {
//   if (ready || mongoose.connection.readyState === 1) return;
//   await mongoose.connect(process.env.MONGODB);
//   ready = true;

//   mongoose.connection.on("connected", () => {
//     console.log("MongoDB connected!");
//   });
//   mongoose.connection.on("disconnected", () => {
//     console.log("MongoDB disconnected!");
//   });
// }


// 以下 20250925 added
// let connected = false;

// export async function connectDB() {
//   if (connected) return;

//   const mongoose = (await import("mongoose")).default;
//   if (mongoose.connection.readyState === 1) { connected = true; return; }

//   await mongoose.connect(process.env.MONGODB);
//   connected = true;
// }


// 20250925 - 2nd updated
// let mongooseInstance = null;

// export async function connectDB() {
//   if (mongooseInstance) return mongooseInstance;

//   const mongoose = (await import("mongoose")).default;

//   if (mongoose.connection.readyState !== 1) {
//     await mongoose.connect(process.env.MONGODB);
//   }

//   mongooseInstance = mongoose;
//   return mongoose;
// }


// 3rd updated
let connected = false;

export async function connectDB(getMongoose) {
  const mongoose = await getMongoose();

  if (connected || mongoose.connection.readyState === 1) return mongoose;

  await mongoose.connect(process.env.MONGODB);
  connected = true;
  return mongoose;
}

