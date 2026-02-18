import express from 'express';
import {
    registerUser,
    loginUser,
    verifyEmail,
    resendCode,
    forgotPassword,
    resetPassword,
    getMe,
} from '../controllers/userAuthController';
import { protectUser } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protectUser, getMe);

export default router;
