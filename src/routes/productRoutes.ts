import express from 'express';
import { getPublicProducts, getPublicProductBySlug } from '../controllers/productController';

const router = express.Router();

router.get('/', getPublicProducts);
router.get('/:slug', getPublicProductBySlug);

export default router;
