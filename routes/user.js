import express from "express";
import {
  
  getAdminList,
  getAllUsers,
  // getMyProfile,
  login,
  // logout,
  newUser,
  
  // searchUser,
  
  // updateMyProfile,
} from "../controllers/user.js";


import { isAuthenticated } from "../middlewares/auth.js";
import { singleAvatar } from "../middlewares/multer.js";

const app = express.Router();



app.post("/new", newUser);
app.post("/login", login);


// After here user must be logged in to access the routes

// app.use(isAuthenticated);



// Route to get all non-admin users
app.get("/getAllUsers", getAllUsers);

// Route to get all admin users
app.get("/getAdminList", getAdminList);
// app.get("/me", getMyProfile);
// app.put("/update", singleAvatar, updateMyProfile);



// app.get("/search", searchUser);









export default app;
