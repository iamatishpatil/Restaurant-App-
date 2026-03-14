import express from 'express';
import { signup, login, updateProfile, getMe, sendOTP, verifyOTP } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.put('/update', authenticate, updateProfile);

router.get('/me', authenticate, getMe);

export default router;
