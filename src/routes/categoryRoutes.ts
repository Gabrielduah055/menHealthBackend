import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController';
import { protect, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', getCategories);

router.use(protect);
router.use(requireAdmin);

router.post('/', createCategory);
router.delete('/:id', deleteCategory);

export default router;
