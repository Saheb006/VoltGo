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

router.post("/start", verifyJWT, strictRateLimiter, startSubscription);
router.get("/me", verifyJWT, authRateLimiter, getMySubscription);
router.get("/history", verifyJWT, authRateLimiter, listMySubscriptions); //tested all
router.get("/plans", generalRateLimiter, getSubscriptionPlans); // Make plans public - no auth required

export default router;
