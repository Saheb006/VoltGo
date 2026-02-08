import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createChargerPort,
  listChargerPorts,
  updateChargerPort,
  updatePortStatus,
  deleteChargerPort,
} from "../controllers/chargerPort.controller.js";

import {checkActiveSubscription} from "../middlewares/checkActiveSubscription.middleware.js";
import {checkPortLimit} from "../middlewares/checkPortLimit.middleware.js";
const router = Router({ mergeParams: true });

// create port under charger
router.post(
  "/",
  verifyJWT,
  checkActiveSubscription, // 🔒 must have active plan
  checkPortLimit,          // 🔑 enforces max_ports_per_charger
  createChargerPort
);

// list ports of charger
router.get("/", verifyJWT, listChargerPorts);

// update port details
router.patch("/:portId", verifyJWT, updateChargerPort);

// update port status
router.patch("/:portId/status", verifyJWT, updatePortStatus);

// delete port
router.delete("/:portId", verifyJWT, deleteChargerPort);

export default router;
