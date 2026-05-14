import express from "express";
import { createActivitySession, getUserActivitySessions, updateActivitySession, markAsReached, calculateETA, updateLocation } from "../controllers/activitySession.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter, locationRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Create or update activity session
router.post('/', authRateLimiter, verifyJWT, createActivitySession);

// Get user's activity sessions
router.get('/', authRateLimiter, verifyJWT, getUserActivitySessions);

// Update activity session
router.put('/:sessionId', authRateLimiter, verifyJWT, updateActivitySession);

// Mark session as reached (when EV owner arrives at charger)
router.patch('/:sessionId/reached', authRateLimiter, verifyJWT, markAsReached);

// Calculate ETA from current location to charger
router.post('/:sessionId/eta', authRateLimiter, verifyJWT, calculateETA);

// Update EV owner's current location
router.patch('/:sessionId/location', locationRateLimiter, verifyJWT, updateLocation);

export default router;
