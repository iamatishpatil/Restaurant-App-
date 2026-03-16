import { Router } from "express";
import { createReservation, getMyReservations, getAllReservations, updateReservationStatus, payReservation } from "../controllers/reservationController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// Customer routes
router.post("/", authenticate, createReservation);
router.get("/me", authenticate, getMyReservations);
router.put("/:id/pay", authenticate, payReservation);

// Admin routes
router.get("/", authenticate, authorize("ADMIN", "MANAGER"), getAllReservations);
router.put("/:id/status", authenticate, authorize("ADMIN", "MANAGER"), updateReservationStatus);

export default router;
