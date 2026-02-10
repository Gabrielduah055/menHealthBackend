import express from 'express';
import {
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  toggleProductActive,
} from '../controllers/productController';
import { protect, requireAdmin } from '../middleware/auth';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminProducts)
  .post(upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getAdminProductById)
  .put(upload.array('images', 5), updateProduct);

router.patch('/:id/toggle', toggleProductActive);

export default router;
