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
    verifyJWT,
    authRateLimiter,
    checkActiveSubscription,
    checkChargerLimit,
    upload.single("image"), // 🔑 must match req.file usage
    createCharger
);

// update charger
router.patch(
    "/:chargerId",
    verifyJWT,
    authRateLimiter,
    upload.single("image"), // optional image update
    updateCharger
);

// delete charger
router.delete("/:chargerId", verifyJWT, authRateLimiter, deleteCharger);

// list chargers of logged-in charger owner
router.get("/my", verifyJWT, authRateLimiter, listMyChargers);

// nearby chargers (vehicle owners only)
router.get("/nearby", verifyJWT, authRateLimiter, listNearbyChargers);

// get charger by id
router.get("/:chargerId", verifyJWT, authRateLimiter, getChargerById);

// toggle charger status (active ↔ inactive)
router.patch("/:chargerId/toggle-status", verifyJWT, authRateLimiter, toggleChargerStatus);

export default router;
