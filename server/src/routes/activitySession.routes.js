import express from "express";
import { createActivitySession, getUserActivitySessions, updateActivitySession } from "../controllers/activitySession.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Create or update activity session
router.post('/', authRateLimiter, verifyJWT, createActivitySession);

// Get user's activity sessions
router.get('/', authRateLimiter, verifyJWT, getUserActivitySessions);

// Update activity session
router.put('/:sessionId', authRateLimiter, verifyJWT, updateActivitySession);

export default router;
