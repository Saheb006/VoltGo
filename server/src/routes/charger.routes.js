import { Router } from "express";
import { 
  createCharger, 
  updateCharger, 
  deleteCharger, 
  listMyChargers, 
  listNearbyChargers,
  getChargerById,
  toggleChargerStatus

} from "../controllers/charger.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/Multer.middleware.js";

const router = Router();

// create charger
router.post(
  "/",
  verifyJWT,
  upload.single("image"), // 🔑 must match req.file usage
  createCharger
);

// update charger
router.patch(
  "/:chargerId",
  verifyJWT,
  upload.single("image"), // optional image update
  updateCharger
);

// delete charger 
router.delete(
  "/:chargerId",
  verifyJWT,
  deleteCharger
);

// list chargers of logged-in charger owner
router.get(
  "/my",
  verifyJWT,
  listMyChargers
);

// nearby chargers (vehicle owners only)
router.get(
  "/nearby",
  verifyJWT,
  listNearbyChargers
);

// get charger by id
router.get(
  "/:chargerId",
  verifyJWT,
  getChargerById
);

// toggle charger status (active ↔ inactive)
router.patch(
  "/:chargerId/toggle-status",
  verifyJWT,
  toggleChargerStatus
);




export default router;
