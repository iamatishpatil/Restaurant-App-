import { Router } from "express";
import { getCategories, getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } from "../controllers/menuController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get("/categories", getCategories);
router.get("/items", getMenuItems);
router.get("/items/:id", getMenuItemById);

// Admin Routes
router.post("/items", authenticate, authorize("ADMIN", "MANAGER"), createMenuItem);
router.put("/items/:id", authenticate, authorize("ADMIN", "MANAGER"), updateMenuItem);
router.delete("/items/:id", authenticate, authorize("ADMIN", "MANAGER"), deleteMenuItem);

export default router;
