import express from 'express';
import {
  getAdminBlogs,
  createBlog,
  updateBlog,
  publishBlog,
  unpublishBlog,
} from '../controllers/blogController';
import { protect, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminBlogs)
  .post(createBlog);

router.put('/:id', updateBlog);
router.patch('/:id/publish', publishBlog);
router.patch('/:id/unpublish', unpublishBlog);

export default router;
