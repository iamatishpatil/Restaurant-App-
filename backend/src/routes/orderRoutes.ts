import { Router } from "express";
import { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders } from "../controllers/orderController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/my", authenticate, getMyOrders);
router.get("/:id", authenticate, getOrderById);

// Admin Routes
router.get("/", authenticate, authorize("ADMIN", "MANAGER"), getAllOrders);
router.put("/:id/status", authenticate, authorize("ADMIN", "MANAGER"), updateOrderStatus);

export default router;
