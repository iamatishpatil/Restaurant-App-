import { Router } from 'express';
import { createTable, getTables, updateTableStatus, deleteTable } from '../controllers/tableController';
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createTable);
router.get('/', authenticate, getTables);
router.put('/:id/status', authenticate, authorize('ADMIN', 'MANAGER', 'WAITER', 'CHEF'), updateTableStatus);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteTable);

export default router;
