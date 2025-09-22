import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  name: String,
  location: String,
  lat: Number,
  lng: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Connection", connectionSchema);
