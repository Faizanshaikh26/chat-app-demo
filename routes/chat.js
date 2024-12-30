import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import {
  chatIdValidator,
  sendMessageValidator,
  
  validateHandler,
} from "../lib/validators.js";
import { getMessages, sendMessage } from "../controllers/chat.js";

const app = express.Router();

// Middleware to ensure user is authenticated
// app.use(isAuthenticated);

// // Create a new chat (one-to-one)
// app.post("/new", newChat);

// // Fetch all chats for the logged-in user
// app.get("/my", getMyChats);

// // Send a message to a chat
// app.post("/message", sendMessageValidator(), validateHandler, sendMessage);

// // Get messages for a specific chat
// app.get("/message/:id", chatIdValidator(), validateHandler, getMessages);


app.get("/getMessages/:adminId", getMessages);

// Route to send a new message
app.post("/sendMessage",  sendMessage);


export default app;
