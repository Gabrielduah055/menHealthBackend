import express from 'express';
import {
  getAdminBlogs,
  createBlog,
  updateBlog,
  publishBlog,
  unpublishBlog,
} from '../controllers/blogController';
import { protect, requireAdmin } from '../middleware/auth';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminBlogs)
  .post(upload.single('coverImage'), createBlog);

router.put('/:id', upload.single('coverImage'), updateBlog);
router.patch('/:id/publish', publishBlog);
router.patch('/:id/unpublish', unpublishBlog);

export default router;
