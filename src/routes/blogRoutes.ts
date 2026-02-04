import express from 'express';
import { getPublicBlogs, getPublicBlogBySlug } from '../controllers/blogController';

const router = express.Router();

router.get('/', getPublicBlogs);
router.get('/:slug', getPublicBlogBySlug);

export default router;
