import express from 'express';
import rateLimit from 'express-rate-limit';
import { getPostComments, addComment } from '../controllers/commentController';
import { protectUser } from '../middleware/auth';

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many comments submitted. Please wait 15 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent router

router.get('/', getPostComments);
router.post('/', commentLimiter, protectUser, addComment);

export default router;
