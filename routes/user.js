import express from "express";
import {
  
  forgotPassword,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  resetPassword,
  searchUser,
  
  updateMyProfile,
} from "../controllers/user.js";
import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from "../lib/validators.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleAvatar } from "../middlewares/multer.js";

const app = express.Router();

app.post("/forgotPassword", forgotPassword); // Forgot password route
app.post("/resetPassword/:token", resetPassword);
app.post("/new", singleAvatar, registerValidator(), validateHandler, newUser);
app.post("/login", loginValidator(), validateHandler, login);
app.get("/logout", logout);

// After here user must be logged in to access the routes

// app.use(isAuthenticated);

app.get("/me", getMyProfile);
app.put("/update", singleAvatar, updateMyProfile);



app.get("/search", searchUser);





app.get("/notifications", getMyNotifications);

app.get("/friends", getMyFriends);

export default app;
