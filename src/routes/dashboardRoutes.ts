import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { protect, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);

export default router;
