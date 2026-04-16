import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createChargerPort,
    listChargerPorts,
    updateChargerPort,
    updatePortStatus,
    deleteChargerPort,
} from "../controllers/chargerPort.controller.js";

import { checkActiveSubscription } from "../middlewares/checkActiveSubscription.middleware.js";
import { checkPortLimitOnly } from "../middlewares/checkPortLimitOnly.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";
const router = Router({ mergeParams: true });

// create port under charger
router.post(
    "/",
    authRateLimiter,
    verifyJWT,
    checkActiveSubscription, // 🔒 must have active plan
    checkPortLimitOnly, // 🔑 enforces max_ports_per_charger
    createChargerPort
);

// list ports of charger
router.get("/", authRateLimiter, verifyJWT, listChargerPorts);

// update port details
router.patch("/:portId", authRateLimiter, verifyJWT, updateChargerPort);

// update port status
router.patch("/:portId/status", authRateLimiter, verifyJWT, updatePortStatus);

// delete port
router.delete("/:portId", authRateLimiter, verifyJWT, deleteChargerPort);

export default router;
