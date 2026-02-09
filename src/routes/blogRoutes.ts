import express from 'express';
import {
  getPublicBlogs,
  getPublicBlogBySlug,
  incrementBlogView,
} from '../controllers/blogController';

const router = express.Router();

router.get('/', getPublicBlogs);
router.get('/:slug', getPublicBlogBySlug);
router.post('/:id/view', incrementBlogView);

export default router;
