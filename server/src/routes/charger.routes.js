import { Router } from "express";
import {
    createCharger,
    updateCharger,
    deleteCharger,
    listMyChargers,
    listNearbyChargers,
    getChargerById,
    toggleChargerStatus,
} from "../controllers/charger.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/Multer.middleware.js";
import { checkActiveSubscription } from "../middlewares/checkActiveSubscription.middleware.js";
import { checkChargerLimit } from "../middlewares/checkChargerLimit.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

import chargerPortRoutes from "./chargerPort.routes.js";

const router = Router();

// Mount port routes (e.g., /api/v1/chargers/:chargerId/ports)
router.use("/:chargerId/ports", chargerPortRoutes);

// create charger
router.post(
    "/",
    authRateLimiter,
    verifyJWT,
    checkActiveSubscription,
    checkChargerLimit,
    upload.single("image"), // 🔑 must match req.file usage
    createCharger
);

// update charger
router.patch(
    "/:chargerId",
    authRateLimiter,
    verifyJWT,
    upload.single("image"), // optional image update
    updateCharger
);

// delete charger
router.delete("/:chargerId", authRateLimiter, verifyJWT, deleteCharger);

// list chargers of logged-in charger owner
router.get("/my", authRateLimiter, verifyJWT, listMyChargers);

// nearby chargers (vehicle owners only)
router.get("/nearby", authRateLimiter, verifyJWT, listNearbyChargers);

// get charger by id
router.get("/:chargerId", authRateLimiter, verifyJWT, getChargerById);

// toggle charger status (active ↔ inactive)
router.patch("/:chargerId/toggle-status", authRateLimiter, verifyJWT, toggleChargerStatus);

export default router;
