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
    verifyJWT,
    authRateLimiter,
    checkActiveSubscription, // 🔒 must have active plan
    checkPortLimitOnly, // 🔑 enforces max_ports_per_charger
    createChargerPort
);

// list ports of charger
router.get("/", verifyJWT, authRateLimiter, listChargerPorts);

// update port details
router.patch("/:portId", verifyJWT, authRateLimiter, updateChargerPort);

// update port status
router.patch("/:portId/status", verifyJWT, authRateLimiter, updatePortStatus);

// delete port
router.delete("/:portId", verifyJWT, authRateLimiter, deleteChargerPort);

export default router;
