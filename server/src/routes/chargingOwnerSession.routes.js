import express from "express";
import { getChargingOwnerSessions, getChargerSessions, markSessionAsCompleted } from "../controllers/chargingOwnerSession.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Get all charging owner sessions (for all chargers owned by the user)
router.get('/', authRateLimiter, verifyJWT, getChargingOwnerSessions);

// Get sessions for a specific charger
router.get('/charger/:chargerId', authRateLimiter, verifyJWT, getChargerSessions);

// Mark a session as completed
router.patch('/:sessionId/complete', authRateLimiter, verifyJWT, markSessionAsCompleted);

export default router;
