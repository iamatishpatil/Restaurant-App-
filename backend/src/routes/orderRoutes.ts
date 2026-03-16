import { Router } from "express";
import { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders, generateBill, getRecommendations, getEstimatedWaitTime } from "../controllers/orderController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/my", authenticate, getMyOrders);
router.get("/recommendations", authenticate, getRecommendations);
router.get("/wait-time", getEstimatedWaitTime); // Public info
router.get("/:id", authenticate, getOrderById);

// Admin / Kitchen Routes
router.get("/", authenticate, authorize("ADMIN", "MANAGER", "CHEF", "WAITER"), getAllOrders);
router.put("/:id/status", authenticate, authorize("ADMIN", "MANAGER", "CHEF", "WAITER"), updateOrderStatus);
router.post("/:id/bill", authenticate, authorize("ADMIN", "MANAGER", "WAITER"), generateBill);

export default router;
