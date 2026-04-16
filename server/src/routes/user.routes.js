import { Router } from "express";
import upload from "../middlewares/Multer.middleware.js";
import {
    loginUser,
    registerUser,
    logoutUser,
    getUser,
    changePassword,
    updateAccountDetails,
    updateUserAvatar,
    refreshJWTtocken,
    forgotPassword,
    resetPasswordWithOTP,
    resetPasswordInsideApp,
    deleteAccount,
    selectActiveCar,
    getActiveCar,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { strictRateLimiter, authRateLimiter } from "../middlewares/rateLimit.middleware.js";
const router = Router();

router
    .route("/register")
    .post(strictRateLimiter, upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

router.route("/login").post(strictRateLimiter, loginUser);

router.route("/logout").post(authRateLimiter, verifyJWT, logoutUser);

router.route("/refresh-token").post(strictRateLimiter, refreshJWTtocken);

router.get("/me", authRateLimiter, verifyJWT, getUser);

router.post("/change-password", strictRateLimiter, verifyJWT, changePassword);

router.post("/update-account", authRateLimiter, verifyJWT, updateAccountDetails);

router.post(
    "/update-avatar",
    authRateLimiter,
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
); //tested till this

router.post("/forgot-password", strictRateLimiter, forgotPassword); //not tested

router.post("/reset-password-otp", strictRateLimiter, resetPasswordWithOTP); //not tested

router.post("/reset-password", authRateLimiter, verifyJWT, resetPasswordInsideApp);

router.delete("/delete-account", authRateLimiter, verifyJWT, deleteAccount);

router.post("/select-active-car", authRateLimiter, verifyJWT, selectActiveCar);

router.get("/get-active-car", authRateLimiter, verifyJWT, getActiveCar);

export default router;
