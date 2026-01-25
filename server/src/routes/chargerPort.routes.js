import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createChargerPort,
  listChargerPorts,
  updateChargerPort,
  updatePortStatus,
  deleteChargerPort,
} from "../controllers/chargerPort.controller.js";

const router = Router({ mergeParams: true });

// create port under charger
router.post("/", verifyJWT, createChargerPort);

// list ports of charger
router.get("/", verifyJWT, listChargerPorts);

// update port details
router.patch("/:portId", verifyJWT, updateChargerPort);

// update port status
router.patch("/:portId/status", verifyJWT, updatePortStatus);

// delete port
router.delete("/:portId", verifyJWT, deleteChargerPort);

export default router;
