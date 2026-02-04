import express from 'express';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  toggleProductActive,
} from '../controllers/productController';
import { protect, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminProducts)
  .post(createProduct);

router.put('/:id', updateProduct);
router.patch('/:id/toggle', toggleProductActive);

export default router;
