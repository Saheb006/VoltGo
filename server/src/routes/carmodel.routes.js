import express from "express";
import multer from "multer";
import { addCar, getAllCars } from "../controllers/carmodel.controller.js";
import { strictRateLimiter, generalRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter,
});

router.post("/admin/add-car", strictRateLimiter, upload.single("image"), addCar);
router.get("/all", generalRateLimiter, getAllCars);

export default router;