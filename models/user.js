// import mongoose, { Schema, model } from "mongoose";
// import { hash } from "bcrypt";

// const schema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique:true
//     },
//     bio: {
//       type: String,
//       required: true,
//     },
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },
//     avatar: {
//       public_id: {
//         type: String,
//         required: true,
//       },
//       url: {
//         type: String,
//         required: true,
//       },
//     },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//   },
//   {
//     timestamps: true,
//   }
// );

// schema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await hash(this.password, 10);
//   next();
// });

// export const User = mongoose.models.User || model("User", schema);

import mongoose, { Schema, model } from "mongoose";
import { hash } from "bcrypt";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"], 
      default: "user",        
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await hash(this.password, 10);
  next();
});

export const User = mongoose.models.User || model("User", schema);

