import { Router } from "express";
import {
    startSubscription,
    getMySubscription,
    listMySubscriptions,
    getSubscriptionPlans,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { strictRateLimiter, authRateLimiter, generalRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/start", strictRateLimiter, verifyJWT, startSubscription);
router.get("/me", authRateLimiter, verifyJWT, getMySubscription);
router.get("/history", authRateLimiter, verifyJWT, listMySubscriptions); //tested all
router.get("/plans", generalRateLimiter, getSubscriptionPlans); // Make plans public - no auth required

export default router;
