import express from 'express';
import {
  getAllComments,
  getAdminPostComments,
  toggleCommentApproval,
  replyToComment,
  deleteComment,
} from '../controllers/commentController';
import { protect, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/', getAllComments);
router.get('/blogs/:id', getAdminPostComments);
router.patch('/:id/approve', toggleCommentApproval);
router.post('/:id/reply', replyToComment);
router.delete('/:id', deleteComment);

export default router;
