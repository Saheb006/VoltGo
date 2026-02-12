import { Router } from "express";
import {
    postCar,
    listMyCars,
    getCarById,
    updateCar,
    deleteCar,
} from "../controllers/car.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// create a new car
router.post("/postcar", verifyJWT, postCar);

// get all cars of logged-in user
router.get("/my", verifyJWT, listMyCars);

// get single car by id
router.get("/:carId", verifyJWT, getCarById);

// update car
router.patch("/:carId", verifyJWT, updateCar);

// delete car
router.delete("/:carId", verifyJWT, deleteCar); //everything tested

export default router;
