import express from 'express';
import { getReviews, createReview } from '../controllers/reviewController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Reviews
router.get('/:menuItemId', getReviews);
router.post('/', authenticate, createReview);

export default router;
