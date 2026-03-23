import express from 'express';
import { signup, login, updateProfile, getMe, sendOTP, verifyOTP, updateFCMToken } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validation';
import { registerSchema, loginSchema, updateFCMTokenSchema } from '../validations/authValidation';

const router = express.Router();

router.post('/signup', validate(registerSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.put('/update', authenticate, updateProfile);
router.post('/fcm-token', authenticate, validate(updateFCMTokenSchema), updateFCMToken);

router.get('/me', authenticate, getMe);

export default router;
