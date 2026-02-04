import express from 'express';
import { verifyPayment } from '../controllers/orderController';

const router = express.Router();

router.post('/paystack/verify', verifyPayment);

export default router;
