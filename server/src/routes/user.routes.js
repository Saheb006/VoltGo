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

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshJWTtocken);

router.get("/me", verifyJWT, getUser);

router.post("/change-password", verifyJWT, changePassword);

router.post("/update-account", verifyJWT, updateAccountDetails);

router.post(
    "/update-avatar",
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
); //tested till this

router.post("/forgot-password", strictRateLimiter, forgotPassword); //not tested

router.post("/reset-password-otp", strictRateLimiter, resetPasswordWithOTP); //not tested

router.post("/reset-password", verifyJWT, authRateLimiter, resetPasswordInsideApp);

router.delete("/delete-account", verifyJWT, authRateLimiter, deleteAccount);

router.post("/select-active-car", verifyJWT, authRateLimiter, selectActiveCar);

router.get("/get-active-car", verifyJWT, authRateLimiter, getActiveCar);

export default router;
