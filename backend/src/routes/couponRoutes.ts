import { Router } from 'express';
import { validateCoupon } from '../controllers/couponController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/validate', authenticate, validateCoupon);

export default router;
