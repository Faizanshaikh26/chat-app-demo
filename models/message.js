import mongoose, { Schema, model, Types } from "mongoose";

// const schema = new Schema(
//   {
//     content: String,

//     attachments: [
//       {
//         public_id: {
//           type: String,
//           required: true,
//         },
//         url: {
//           type: String,
//           required: true,
//         },
//       },
//     ],

//     sender: {
//       type: Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     chat: {
//       type: Types.ObjectId,
//       ref: "Chat",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const Message = mongoose.models.Message || model("Message", schema);


// const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Message = mongoose.models.Message || model("Message", messageSchema);
