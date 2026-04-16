import express from "express";
import { createActivitySession, getUserActivitySessions, updateActivitySession } from "../controllers/activitySession.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Create or update activity session
router.post('/', verifyJWT, authRateLimiter, createActivitySession);

// Get user's activity sessions
router.get('/', verifyJWT, authRateLimiter, getUserActivitySessions);

// Update activity session
router.put('/:sessionId', verifyJWT, authRateLimiter, updateActivitySession);

export default router;
