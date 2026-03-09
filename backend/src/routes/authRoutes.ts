import express from 'express';
import { signup, login, updateProfile } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/update', authenticate, updateProfile);

export default router;
