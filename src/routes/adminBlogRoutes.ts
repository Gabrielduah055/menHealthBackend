import express from 'express';
import {
  getAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
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
  .post(
    upload.fields([
      { name: 'coverImage', maxCount: 1 },
      { name: 'galleryImages', maxCount: 8 }
    ]),
    createBlog
  );

router.route('/:id')
  .get(getAdminBlogById)
  .put(
    upload.fields([
      { name: 'coverImage', maxCount: 1 },
      { name: 'galleryImages', maxCount: 8 }
    ]),
    updateBlog
  )
  .delete(deleteBlog);

router.patch('/:id/publish', publishBlog);
router.patch('/:id/unpublish', unpublishBlog);

export default router;
