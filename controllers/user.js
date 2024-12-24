import { compare } from "bcrypt";

import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import {
  cookieOptions,
  emitEvent,
  generateToken,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import nodemailer from 'nodemailer'
import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

// Create a new user and save it to the database and save token in cookie
const newUser = TryCatch(async (req, res, next) => {
  const { name, username, password, bio ,email} = req.body;

  const file = req.file;

  if (!file) return next(new ErrorHandler("Please Upload Avatar"));

  const result = await uploadFilesToCloudinary([file]);

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };

  const user = await User.create({
    name,
    bio,
    username,
    password,
    email,
    avatar,
  });

  sendToken(res, user, 201, "User created");
});

// Login user and save token in cookie
const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Email or Password", 404));

  const isMatch = await compare(password, user.password);

  if (!isMatch)
    return next(new ErrorHandler("Invalid Email or Password", 404));

  sendToken(res, user, 200, `Welcome Back, ${user.name}`);
});
const forgotPassword = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email: email });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Generate reset token
    const token = generateToken();

    // Set reset password token and expiration time
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send reset password email
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.BREVO_API_KEY,
      },
    });
    var mailOptions = {
      from: "InstaChatPvt@gmail.com",
      to: user.email,
      subject: "Reset password",
      text:
        `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `${req.headers.origin}/reset-password/${token}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
};
const resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const { newPassword } = req.body;

  try {
    // Find user with the reset token
    const user = await User.findOne({ resetPasswordToken: resetToken });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid or expired token" });
    }

    // Check if the token has expired
    if (user.resetPasswordExpires < Date.now()) {
      return res
        .status(401)
        .json({ success: false, error: "Token has expired" });
    }

    // Ensure newPassword is provided
    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "New password is required" });
    }

    // Set the new password (this will trigger the pre-save middleware to hash it)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, error: "Failed to reset password" });
  }
};

const getMyProfile = TryCatch(async (req, res, next) => {
  const userId = req.user;

  // Check if the user's profile is in the cache
  const cachedUser = cache.get(userId);
  if (cachedUser) {
    return res.status(200).json({
      success: true,
      user: cachedUser,
    });
  }

  // If not cached, fetch from the database
  const user = await User.findById(userId).lean();

  if (!user) return next(new ErrorHandler("User not found", 404));

  // Cache the user's profile
  cache.set(userId, user);

  res.status(200).json({
    success: true,
    user,
  });
});
const updateMyProfile = TryCatch(async (req, res, next) => {
  const { name, bio, email, username } = req.body;
  const newUser = { name, bio, email, username };

  // Check if a file is provided
  const file = req.file;
  if (file) {
    const result = await uploadFilesToCloudinary([file]);
    const avatar = {
      public_id: result[0].public_id,
      url: result[0].url,
    };

    // Add the avatar to newUser if a file is uploaded
    newUser.avatar = avatar;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user, newUser, {
    new: true,
    runValidators: true,
  }).lean(); // Use lean() if you don't need Mongoose document methods

  if (!updatedUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Update the cache with the new user data
  cache.set(req.user, updatedUser);

  res.status(200).json({ success: true, user: updatedUser });
});


const logout = TryCatch(async (req, res) => {
  return res
    .status(200)
    .cookie("instaChat-token", null, { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

const searchUser = TryCatch(async (req, res) => {
  const { name = "" } = req.query;

  // Finding All my chats
  const myChats = await Chat.find({ groupChat: false, members: req.user });

  //  extracting All Users from my chats means friends or people I have chatted with
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  // Finding all users except me and my friends
  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: "i" },
  });

  // Modifying the response
  const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));

  return res.status(200).json({
    success: true,
    users,
  });
});



const getMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar.url,
    },
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
});

const getMyFriends = TryCatch(async (req, res) => {
  const chatId = req.query.chatId;

  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");

  const friends = chats.map(({ members }) => {
    const otherUser = getOtherMember(members, req.user);

    return {
      _id: otherUser._id,
      name: otherUser.name,
      avatar: otherUser.avatar.url,
    };
  });

  if (chatId) {
    const chat = await Chat.findById(chatId);

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});

export {

  getMyFriends,
  getMyNotifications,
  getMyProfile,
  updateMyProfile,
  login,
  forgotPassword,resetPassword,
  logout,
  newUser,
  searchUser,

};
