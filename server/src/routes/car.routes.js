import { Router } from "express";
import {
    postCar,
    listMyCars,
    getCarById,
    updateCar,
    deleteCar,
} from "../controllers/car.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

// create a new car
router.post("/postcar", authRateLimiter, verifyJWT, postCar);

// get all cars of logged-in user
router.get("/my", authRateLimiter, verifyJWT, listMyCars);

// get single car by id
router.get("/:carId", authRateLimiter, verifyJWT, getCarById);

// update car
router.patch("/:carId", authRateLimiter, verifyJWT, updateCar);

// delete car
router.delete("/:carId", authRateLimiter, verifyJWT, deleteCar); //everything tested

export default router;
