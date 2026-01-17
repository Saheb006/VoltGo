import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      required: true,
    },

    // 🔹 CHANGED: replaced isCarOwner(Boolean) with role-based access
    role: {
      type: String,
      enum: ["vehicle_owner", "charger_owner", "admin"], // 🔹 ADDED: scalable roles
      default: "vehicle_owner", // 🔹 ADDED: default role
    },

    active_car_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },

    passwordResetOTP: {
      type: String,
      select: false,
    },

  passwordResetExpires: {
    type: Date,
  },

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// compare password
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role, // 🔹 CHANGED: include role instead of boolean
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

// refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role, // 🔹 CHANGED: include role for authorization checks
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

export default mongoose.model("User", userSchema);


