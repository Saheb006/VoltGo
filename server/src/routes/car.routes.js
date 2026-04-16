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
router.post("/postcar", verifyJWT, authRateLimiter, postCar);

// get all cars of logged-in user
router.get("/my", verifyJWT, authRateLimiter, listMyCars);

// get single car by id
router.get("/:carId", verifyJWT, authRateLimiter, getCarById);

// update car
router.patch("/:carId", verifyJWT, authRateLimiter, updateCar);

// delete car
router.delete("/:carId", verifyJWT, authRateLimiter, deleteCar); //everything tested

export default router;
