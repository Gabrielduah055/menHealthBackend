import express from 'express';
import { getPostComments, addComment } from '../controllers/commentController';

const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent router

router.get('/', getPostComments);
router.post('/', addComment);

export default router;
