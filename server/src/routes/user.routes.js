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
    getActiveCar
  
  } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
    ]), 
  registerUser
);

router.route("/login").post( loginUser );

router.route("/logout").post(verifyJWT, logoutUser );

router.route("/refresh-token").post( refreshJWTtocken );

router.get("/me", verifyJWT, getUser); 

router.post("/change-password", verifyJWT, changePassword);

router.post("/update-account", verifyJWT, updateAccountDetails);

router.post("/update-avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);  //tested till this 

router.post("/forgot-password", forgotPassword); //not tested

router.post("/reset-password-otp", resetPasswordWithOTP); //not tested 

router.post("/reset-password", verifyJWT, resetPasswordInsideApp);

router.delete("/delete-account", verifyJWT, deleteAccount );

router.post("/select-active-car", verifyJWT, selectActiveCar);

router.get("/get-active-car", verifyJWT, getActiveCar);


export default router;


