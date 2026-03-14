import { Router } from "express";
import { createReservation, getMyReservations, getAllReservations, updateReservationStatus } from "../controllers/reservationController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// Customer routes
router.post("/", authenticate, createReservation);
router.get("/me", authenticate, getMyReservations);

// Admin routes
router.get("/", authenticate, authorize("ADMIN", "MANAGER"), getAllReservations);
router.put("/:id/status", authenticate, authorize("ADMIN", "MANAGER"), updateReservationStatus);

export default router;
