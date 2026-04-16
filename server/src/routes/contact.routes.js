import express from "express";
import { sendContactEmail } from "../controllers/contact.controller.js";
import { strictRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/send", strictRateLimiter, sendContactEmail);

export default router;
