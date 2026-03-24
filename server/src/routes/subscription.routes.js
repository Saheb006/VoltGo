import { Router } from "express";
import {
    startSubscription,
    getMySubscription,
    listMySubscriptions,
    getSubscriptionPlans,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/start", verifyJWT, startSubscription);
router.get("/me", verifyJWT, getMySubscription);
router.get("/history", verifyJWT, listMySubscriptions); //tested all
router.get("/plans", getSubscriptionPlans); // Make plans public - no auth required

export default router;
