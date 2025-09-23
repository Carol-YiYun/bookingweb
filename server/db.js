import mongoose from "mongoose";

let ready = false;

export async function connectDB() {
  if (ready || mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB);
  ready = true;

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected!");
  });
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected!");
  });
}