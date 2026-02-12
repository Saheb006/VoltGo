import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(
                401,
                "Access denied. No token provided Unauthorized req."
            );
        }

        // verify token (will throw if invalid/expired)
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // find user and exclude sensitive fields
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // attach user to request and continue
        req.user = user;
        return next();
    } catch (error) {
        // error.message is already a string; fall back to a generic message if missing
        const message =
            error && error.message
                ? error.message
                : "Invalid token Unauthorized req.";
        throw new ApiError(401, message);
    }
});
