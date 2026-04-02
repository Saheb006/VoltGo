import express from "express";
import multer from "multer";
import { addCar } from "../controllers/carmodel.controller.js";

const router = express.Router();

// ✅ use memory storage (IMPORTANT)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// route
router.post("/admin/add-car", upload.single("image"), addCar);

export default router;