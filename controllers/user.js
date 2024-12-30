import bcrypt from "bcrypt";

import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import {
  cookieOptions,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

// // Create a new user and save it to the database
// const newUser = TryCatch(async (req, res, next) => {
//   const { name, username, password, bio, email } = req.body;

//   const user = await User.create({
//     name,
//     bio,
//     username,
//     password,
//     email,
//   });

//   sendToken(res, user, 201, "User created");
// });

// // Login user and save token in cookie
// const login = TryCatch(async (req, res, next) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email }).select("+password");

//   if (!user) return next(new ErrorHandler("Invalid Email or Password", 404));

//   const isMatch = await compare(password, user.password);

//   if (!isMatch)
//     return next(new ErrorHandler("Invalid Email or Password", 404));

//   sendToken(res, user, 200, `Welcome Back, ${user.name}`);
// });

// // Get my profile
// const getMyProfile = TryCatch(async (req, res, next) => {
//   const userId = req.user;

//   // Check if the user's profile is cached
//   const cachedUser = cache.get(userId);
//   if (cachedUser) {
//     return res.status(200).json({
//       success: true,
//       user: cachedUser,
//     });
//   }

//   // Fetch from database if not cached
//   const user = await User.findById(userId).lean();

//   if (!user) return next(new ErrorHandler("User not found", 404));

//   cache.set(userId, user);

//   res.status(200).json({
//     success: true,
//     user,
//   });
// });

// // Update my profile
// const updateMyProfile = TryCatch(async (req, res, next) => {
//   const { name, bio, email, username } = req.body;
//   const updatedData = { name, bio, email, username };

//   // Check if a file is provided
//   const file = req.file;
//   if (file) {
//     const result = await uploadFilesToCloudinary([file]);
//     const avatar = {
//       public_id: result[0].public_id,
//       url: result[0].url,
//     };
//     updatedData.avatar = avatar;
//   }

//   const updatedUser = await User.findByIdAndUpdate(req.user, updatedData, {
//     new: true,
//     runValidators: true,
//   }).lean();

//   if (!updatedUser) return next(new ErrorHandler("User not found", 404));

//   cache.set(req.user, updatedUser);

//   res.status(200).json({ success: true, user: updatedUser });
// });

// // Logout user
// const logout = TryCatch(async (req, res) => {
//   res
//     .status(200)
//     .cookie("instaChat-token", null, { ...cookieOptions, maxAge: 0 })
//     .json({
//       success: true,
//       message: "Logged out successfully",
//     });
// });

// // Search for users (excluding friends, as relationships are removed)
// const searchUser = TryCatch(async (req, res) => {
//   const { name = "" } = req.query;

//   const users = await User.find({
//     name: { $regex: name, $options: "i" },
//     _id: { $ne: req.user },
//   }).select("name avatar");

//   return res.status(200).json({
//     success: true,
//     users,
//   });
// });

// export {
//   getMyProfile,
//   updateMyProfile,
//   login,
//   logout,
//   newUser,
//   searchUser,
// };

const newUser = TryCatch(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isAdmin: role === 'admin', 
  });

  sendToken(res, user, 201, "User created");
});
// Login user and save token in cookie
const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("Invalid Email or Password", 404));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ErrorHandler("Invalid Email or Password", 404));

  sendToken(res, user, 200, `Welcome Back, ${user.name}`);
});

const getAllUsers = TryCatch(async (req, res, next) => {
  const { isAdmin } = req.user; // Assuming authentication middleware adds `req.user`

  if (!isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }

  const users = await User.find({ isAdmin: false }).select("name email");
  res.json(users);
});

// Get all admin users
const getAdminList = TryCatch(async (req, res, next) => {
  const admins = await User.find({ isAdmin: true }).select("name email");
  res.json(admins);
});
export { login, newUser, getAllUsers, getAdminList };
