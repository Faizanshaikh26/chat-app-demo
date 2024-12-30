// import { v2 as cloudinary } from "cloudinary";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { v4 as uuid } from "uuid";
// import { corsOptions } from "./constants/config.js";
// import {
//   CHAT_JOINED,
//   CHAT_LEAVED,
//   NEW_MESSAGE,
//   NEW_MESSAGE_ALERT,
//   ONLINE_USERS,
//   START_TYPING,
//   STOP_TYPING,
// } from "./constants/events.js";
// import { getSockets } from "./lib/helper.js";
// import { socketAuthenticator } from "./middlewares/auth.js";
// import { errorMiddleware } from "./middlewares/error.js";
// import { Message } from "./models/message.js";
// import { connectDB } from "./utils/features.js";


// import chatRoute from "./routes/chat.js";
// import userRoute from "./routes/user.js";


// import compression from "compression";

// dotenv.config({
//   path: "./.env",
// });


// const port = process.env.PORT || 7000;
// const envMode = process.env.NODE_ENV?.trim() || "PRODUCTION";

// const userSocketIDs = new Map();
// const onlineUsers = new Set();

// connectDB();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: corsOptions,
// });

// app.set("io", io);


// // Using Middlewares Here
// app.use(compression())
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors(corsOptions));

// app.use("/api/v1/user", userRoute);
// app.use("/api/v1/chat", chatRoute);


// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

// io.use((socket, next) => {
//   cookieParser()(
//     socket.request,
//     socket.request.res,
//     async (err) => await socketAuthenticator(err, socket, next)
//   );
// });



// // Log when a socket connects and disconnects
// io.on("connection", (socket) => {
//   console.log(`New connection established with socket ID: ${socket.id}`);

//   const user = socket.user;
//   if (user) {
//     console.log(`User connected: ${user.name} (ID: ${user._id})`);
//   } else {
//     console.error("No user data found during connection.");
//   }

//   userSocketIDs.set(user._id.toString(), socket.id);

//   // Log when a NEW_MESSAGE event is received
//   socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
//     console.log(`NEW_MESSAGE event received from ${user.name}`);
//     console.log(`Message: ${message}, Chat ID: ${chatId}`);
//     console.log(`Members: ${JSON.stringify(members)}`);
    
//     const messageForRealTime = {
//       content: message,
//       _id: uuid(),
//       sender: {
//         _id: user._id,
//         name: user.name,
//       },
//       chat: chatId,
//       createdAt: new Date().toISOString(),
//     };

//     const messageForDB = {
//       content: message,
//       sender: user._id,
//       chat: chatId,
//     };

//     const membersSocket = getSockets(members);
//     io.to(membersSocket).emit(NEW_MESSAGE, {
//       chatId,
//       message: messageForRealTime,
//     });
//     io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

//     try {
//       await Message.create(messageForDB);
//       console.log(`Message saved to DB successfully.`);
//     } catch (error) {
//       console.error("Error saving message to DB:", error);
//     }
//   });

//   // Log other events
//   socket.on(START_TYPING, ({ members, chatId }) => {
//     console.log(`${user.name} started typing in chat: ${chatId}`);
//     const membersSockets = getSockets(members);
//     socket.to(membersSockets).emit(START_TYPING, { chatId });
//   });

//   socket.on(STOP_TYPING, ({ members, chatId }) => {
//     console.log(`${user.name} stopped typing in chat: ${chatId}`);
//     const membersSockets = getSockets(members);
//     socket.to(membersSockets).emit(STOP_TYPING, { chatId });
//   });

//   socket.on(CHAT_JOINED, ({ userId, members }) => {
//     console.log(`User ${userId} joined a chat`);
//     onlineUsers.add(userId.toString());

//     const membersSocket = getSockets(members);
//     io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
//   });

//   socket.on(CHAT_LEAVED, ({ userId, members }) => {
//     console.log(`User ${userId} left a chat`);
//     onlineUsers.delete(userId.toString());

//     const membersSocket = getSockets(members);
//     io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
//   });

//   // Log on disconnect
//   socket.on("disconnect", () => {
//     console.log(`Socket disconnected: ${socket.id}`);
//     userSocketIDs.delete(user._id.toString());
//     onlineUsers.delete(user._id.toString());
//     console.log(`User ${user.name} (ID: ${user._id}) disconnected`);
//     socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
//   });
// });


// // Log when the server starts
// server.listen(port, () => {
//   console.log(`Server is running on port ${port} in ${envMode} Mode`);
//   console.log(`Socket.IO server is ready and waiting for connections.`);
// });

// app.use(errorMiddleware);



// export {  envMode, userSocketIDs };

import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { corsOptions } from "./constants/config.js";
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
} from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { socketAuthenticator } from "./middlewares/auth.js";
import { errorMiddleware } from "./middlewares/error.js";
import { Message } from "./models/message.js";
import { connectDB } from "./utils/features.js";


import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";


import compression from "compression";

dotenv.config({
  path: "./.env",
});


const port = process.env.PORT || 7500;
const envMode = process.env.NODE_ENV?.trim() || "PRODUCTION";

const userSocketIDs = new Map();
const onlineUsers = new Set();

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



const app = express();
const server = createServer(app);

// Socket.IO Server
const io = new Server(server, {
  cors: corsOptions,
});

// Attach Socket.IO to Express App
app.set("io", io);

// Middleware
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log(`[Socket.IO] User connected: ${socket.id}`);

  const userId = socket.user?._id;
  if (userId) {
    // Track the user
    userSocketIDs.set(userId.toString(), socket.id);
    onlineUsers.add(userId.toString());
    io.emit("onlineUsers", Array.from(onlineUsers));
    console.log(`[Socket.IO] User ${userId} is online.`);
  }

  // Join a specific room
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`[Socket.IO] User ${userId} joined room: ${room}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ sender, receiver, content }) => {
    console.log(`[Socket.IO] Message from ${sender} to ${receiver}: ${content}`);

    const message = new Message({ sender, receiver, content });
    await message.save();

    // Emit message to receiver's socket if online
    const receiverSocketId = userSocketIDs.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        sender,
        content,
        timestamp: new Date(),
      });
      console.log(`[Socket.IO] Delivered message to user: ${receiver}`);
    } else {
      console.log(`[Socket.IO] User ${receiver} is offline. Message saved.`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userId) {
      userSocketIDs.delete(userId.toString());
      onlineUsers.delete(userId.toString());
      io.emit("onlineUsers", Array.from(onlineUsers));
      console.log(`[Socket.IO] User disconnected: ${userId}`);
    }
    console.log(`[Socket.IO] Socket disconnected: ${socket.id}`);
  });
});

// Error Handling Middleware
app.use(errorMiddleware);

// Start the Server
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port} in ${envMode} mode.`);
  console.log(`💬 Socket.IO is ready and listening for connections.`);
});




app.use(errorMiddleware);



export {  envMode, userSocketIDs };


