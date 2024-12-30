import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js";
import { emitEvent } from "../utils/features.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";
import {
  ALERT,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../constants/events.js";


// const newChat = TryCatch(async (req, res, next) => {
//   const { userId } = req.body;

//   // Check if the user exists
//   const userToChat = await User.findById(userId);

//   if (!userToChat) {
//     return next(new ErrorHandler("User not found", 404));
//   }

//   // Only allow creating chats with admins or by admins
//   if (
//     req.user.role === "user" &&
//     userToChat.role !== "admin"
//   ) {
//     return next(new ErrorHandler("You can only chat with admins", 403));
//   }

//   // Check if the chat already exists
//   const existingChat = await Chat.findOne({
//     members: { $all: [req.user._id, userId] },
//   });

//   if (existingChat) {
//     return res.status(200).json({
//       success: true,
//       chat: existingChat,
//     });
//   }

//   // Create a new chat
//   const chat = await Chat.create({
//     members: [req.user._id, userToChat._id],
//     groupChat: false,
//   });

//   emitEvent(req, ALERT, chat.members, "New chat created");

//   return res.status(201).json({
//     success: true,
//     chat,
//   });
// });

// /*
//   Fetch chats for the logged-in user.
//  */
// const getMyChats = TryCatch(async (req, res, next) => {
//   const userRole = req.user.role;

//   // Fetch chats based on user role
//   const chats = await Chat.find({
//     members: userRole === "admin" ? {} : req.user,
//   }).populate("members", "name avatar role");

//   // Transform chats based on access
//   const transformedChats = chats.map(({ _id, members, groupChat }) => {
//     const otherMember = members.find(
//       (member) => member._id.toString() !== req.user._id.toString()
//     );

//     // Restrict user-to-user access
//     if (
//       req.user.role === "user" &&
//       otherMember.role !== "admin"
//     ) {
//       return null;
//     }

//     return {
//       _id,
//       groupChat,
//       name: otherMember.name,
//       avatar: otherMember.avatar?.url,
//       members: members.map((member) => ({
//         _id: member._id,
//         name: member.name,
//         role: member.role,
//       })),
//     };
//   });

//   return res.status(200).json({
//     success: true,
//     chats: transformedChats.filter((chat) => chat !== null),
//   });
// });

// /**
//  * Send a message to a chat.
//  */
// const sendMessage = TryCatch(async (req, res, next) => {
//   const { chatId, content } = req.body;

//   // Find the chat
//   const chat = await Chat.findById(chatId);

//   if (!chat) {
//     return next(new ErrorHandler("Chat not found", 404));
//   }

//   // Ensure the user is part of the chat
//   if (!chat.members.includes(req.user._id)) {
//     return next(new ErrorHandler("You are not allowed to send messages in this chat", 403));
//   }

//   // Create a new message
//   const message = await Message.create({
//     content,
//     sender: req.user._id,
//     chat: chatId,
//   });

//   // Emit events
//   emitEvent(req, NEW_MESSAGE, chat.members, { message, chatId });
//   emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

//   return res.status(201).json({
//     success: true,
//     message,
//   });
// });

// /**
//  * Get messages for a chat.
//  */
// const getMessages = TryCatch(async (req, res, next) => {
//   const { chatId } = req.params;

//   // Find the chat
//   const chat = await Chat.findById(chatId);

//   if (!chat) {
//     return next(new ErrorHandler("Chat not found", 404));
//   }

//   // Ensure the user is part of the chat
//   if (!chat.members.includes(req.user._id)) {
//     return next(new ErrorHandler("You are not allowed to access this chat", 403));
//   }

//   const messages = await Message.find({ chat: chatId }).populate("sender", "name");

//   return res.status(200).json({
//     success: true,
//     messages,
//   });
// });

// export { newChat, getMyChats, sendMessage, getMessages };


const getMessages = TryCatch(async (req, res, next) => {
  const { userId, isAdmin } = req.user; // Assuming `req.user` is populated by middleware
  const { adminId } = req.params;

  if (isAdmin) {
    return res.status(403).json({ message: "Only users can fetch admin messages" });
  }

  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: adminId },
      { sender: adminId, receiver: userId },
    ],
  }).sort({ timestamp: 1 });

  res.json(messages);
});

// Send a new message
const sendMessage = TryCatch(async (req, res, next) => {
  const { sender, receiver, content } = req.body;

  const message = new Message({ sender, receiver, content });
  await message.save();

  res.json({ message: "Message sent successfully" });
});

export { getMessages, sendMessage };