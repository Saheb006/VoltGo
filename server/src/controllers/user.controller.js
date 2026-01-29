import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import Car from "../models/car.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import fs from "fs/promises";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error(
            "generateAccessAndRefreshTokens - underlying error:",
            error && (error.stack || error.message || error)
        );

        if (error instanceof ApiError) throw error;
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};


const registerUser = asyncHandler(async (req, res) => {
    console.log("FILES =", req.files);
    let { fullName, email, username, password, role } = req.body;

const normalize = (v) => Array.isArray(v) ? v[0] : v;

fullName = normalize(fullName);
email = normalize(email);
username = normalize(username);
password = normalize(password);
role = normalize(role)?.trim().toLowerCase();

const allowedRoles = User.schema.path("role").enumValues;

if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role selected");
}

    if (
        [fullName, email, username, password].some(
            (field) => typeof field !== "string" || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;   // get avatar path from multer

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    // ⬇️ moved log here, after avatar is defined
    console.log({
        fullName,
        email,
        username,
        avatar: avatar?.url,
        types: {
            fullName: typeof fullName,
            email: typeof email,
            username: typeof username,
            password: typeof password
        },
    });

    if (!avatar) {
        throw new ApiError(405, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        password,
        role,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body; // 🔧 removed isCarOwner

    if (!username && !email) {
        throw new ApiError(412, "Username or email are required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!password) {
        throw new ApiError(412, "Password is required");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }

    // 🔒 role stays locked in DB (no check here)

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: false,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: false,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshJWTtocken = asyncHandler(async (req, res) => {

    const incomingRefreshTocken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshTocken) {
        throw new ApiError(401, "No refresh token provided");
    }

    try {
        const decodedTocken = jwt.verify(incomingRefreshTocken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedTocken?._id);
    
        if (!user) {
            throw new ApiError(404, "Invalid refresh token - user not found");
        }
    
        if (user.refreshToken !== incomingRefreshTocken) {
            throw new ApiError(401, "Refresh token does not match");
        }
    
         const options = {
            httpOnly: true,
            secure: false,
        };
    
        const { accessToken, newRefreshTocken } = await generateAccessAndRefreshTokens(user?._id);
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshTocken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshTocken}, "JWT tokens refreshed successfully"));
    
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
        
    }
});

const changePassword = asyncHandler(async (req, res) => {
    
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

        if (!user) {
        throw new ApiError(404, "User not found");
        }


    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;   
    await user.save({validateBeforeSave: false});

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const getUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
   
    const { fullName, email, username} = req.body;

    if (!fullName || !email || !username) {
        throw new ApiError(400, "Full name , email and username are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { fullName : fullName, email: email, username: username }
        },

        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");



    // Get old avatar BEFORE updating
    const userBeforeUpdate = await User.findById(req.user._id);

    if (!userBeforeUpdate) {
        throw new ApiError(404, "User not found");
    }

    const previousAvatarUrl = userBeforeUpdate.avatar;

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) throw new ApiError(500, "Error uploading avatar");

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password -refreshToken");

    // Pass old URL to delete function
    if (previousAvatarUrl) {
  try {
    await deleteFromCloudinary(previousAvatarUrl);
  } catch (err) {
    console.warn("Failed to delete old avatar:", err);
  }
}


     try {
        await fs.unlink(avatarLocalPath);
    } catch (err) {
        console.warn("Failed to remove temp avatar file:", err);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User avatar updated successfully"));
});


const forgotPassword = asyncHandler(async (req, res) => {
    const { email, username } = req.body;

    if (!email && !username) {
        throw new ApiError(412, "Email or username is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    // Do NOT reveal user existence
    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, "If account exists, OTP has been sent")
        );
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    user.passwordResetOTP = await bcrypt.hash(otp, 10);
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        to: user.email,
        subject: "Password Reset OTP",
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent to registered email")
    );
});


const resetPasswordWithOTP = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP and new password are required");
    }

    const user = await User.findOne({ email });

    if (!user || !user.passwordResetOTP) {
        throw new ApiError(400, "Invalid request");
    }

    if (user.passwordResetExpires < Date.now()) {
        throw new ApiError(401, "OTP expired");
    }

    const isOtpValid = await bcrypt.compare(otp, user.passwordResetOTP);

    if (!isOtpValid) {
        throw new ApiError(401, "Invalid OTP");
    }

    user.password = newPassword; // hashed by pre-save hook
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successful"));
});

const resetPasswordInsideApp = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword; // hashed by pre-save hook
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // 🔹 Validate inputs
    if (!email || !username || !password) {
        throw new ApiError(400, "Email, username and password are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 🔹 Check email match
    if (user.email !== email) {
        throw new ApiError(401, "Email does not match");
    }

    // 🔹 Check username match
    if (user.username !== username) {
        throw new ApiError(401, "Username does not match");
    }

    // 🔹 Check password match
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect password");
    }

    await user.deleteOne();

    const options = {
        httpOnly: true,
        secure: false, // env-based in production
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Account deleted successfully"));
});





const selectActiveCar = asyncHandler(async (req, res) => {
  const { carId } = req.body; // ✅ FIX

  if (!carId) {
    throw new ApiError(400, "carId is required");
  }

  const car = await Car.findById(carId);
  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  if (car.owner_id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to select this car");
  }

  if (req.user.role !== "vehicle_owner") {
    throw new ApiError(403, "Only vehicle owners can select cars");
  }

  req.user.active_car_id = car._id;
  await req.user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Car selected successfully"));
});


const getActiveCar = asyncHandler(async (req, res) => {
    // 🔒 Only vehicle owners have active cars
    if (req.user.role !== "vehicle_owner") {
        throw new ApiError(403, "Only vehicle owners have active cars");
    }

    const activeCarId = req.user.active_car_id;

    // 🔧 Handle no active car
    if (!activeCarId) {
        throw new ApiError(404, "No active car selected");
    }

    const car = await Car.findById(activeCarId);

    // 🔧 Safety ownership check
    if (!car || car.owner_id.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "Active car not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, car, "Active car retrieved successfully"));
});

// getCarStats            // OPTIONAL (but impressive)









export { 
    registerUser, // 
    generateAccessAndRefreshTokens, 
    loginUser, //
    logoutUser, //
    refreshJWTtocken,//
    changePassword,//
    getUser,//
    updateAccountDetails,//
    updateUserAvatar,//
    forgotPassword,
    resetPasswordWithOTP,
    resetPasswordInsideApp,
    deleteAccount, //
    selectActiveCar, //
    getActiveCar // tested

 };

