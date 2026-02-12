import { Router } from "express";
import {
    startSubscription,
    getMySubscription,
    listMySubscriptions,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/start", verifyJWT, startSubscription);
router.get("/me", verifyJWT, getMySubscription);
router.get("/history", verifyJWT, listMySubscriptions); //tested all

export default router;
