import express from 'express';
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAdminCustomers,
} from '../controllers/orderController';
import { protect, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/customers', getAdminCustomers);
router.get('/', getAdminOrders);
router.get('/:id', getAdminOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;
