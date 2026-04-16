import express from "express";
import { createActivitySession, getUserActivitySessions, updateActivitySession } from "../controllers/activitySession.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create or update activity session
router.post('/', verifyJWT, createActivitySession);

// Get user's activity sessions
router.get('/', verifyJWT, getUserActivitySessions);

// Update activity session
router.put('/:sessionId', verifyJWT, updateActivitySession);

export default router;
