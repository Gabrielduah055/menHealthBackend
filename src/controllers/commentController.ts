import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment';
import BlogPost from '../models/BlogPost';

// @desc    Get comments for a post
// @route   GET /api/blogs/:id/comments
// @access  Public
export const getPostComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await Comment.find({ postId: req.params.id, isApproved: true }).sort({ createdAt: -1 });
  res.json(comments);
});

// @desc    Add a comment to a post
// @route   POST /api/blogs/:id/comments
// @access  Public
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, content } = req.body;
  const blog = await BlogPost.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  if (!blog.status || blog.status !== 'published') { // Assuming simple check, refine as needed
      // Actually we might allow comments on drafts if testing, but usually only published
  }

  const comment = await Comment.create({
    postId: req.params.id,
    name,
    email,
    content,
    isApproved: false, // Default to false for moderation
  });

  res.status(201).json(comment);
});

// @desc    Get all comments (Admin)
// @route   GET /api/admin/comments
// @access  Private/Admin
export const getAllComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await Comment.find({})
    .populate('postId', 'title slug')
    .sort({ createdAt: -1 });
  res.json(comments);
});

// @desc    Get comments for a post (Admin - includes unapproved)
// @route   GET /api/admin/blogs/:id/comments
// @access  Private/Admin
export const getAdminPostComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
  res.json(comments);
});

// @desc    Approve/Unapprove a comment
// @route   PATCH /api/admin/comments/:id/approve
// @access  Private/Admin
export const toggleCommentApproval = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.id);

  if (comment) {
    comment.isApproved = !comment.isApproved;
    const updatedComment = await comment.save();
    res.json(updatedComment);
  } else {
    res.status(404);
    throw new Error('Comment not found');
  }
});

// @desc    Reply to a comment (Admin)
// @route   POST /api/admin/comments/:id/reply
// @access  Private/Admin
export const replyToComment = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.id);

  if (comment) {
    const reply = {
      name: 'Admin', // Or specific admin name from req.user
      content,
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    comment.isApproved = true; // Auto-approve if admin replies? Maybe.
    const updatedComment = await comment.save();
    res.json(updatedComment);
  } else {
    res.status(404);
    throw new Error('Comment not found');
  }
});

// @desc    Delete a comment
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.id);

  if (comment) {
    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } else {
    res.status(404);
    throw new Error('Comment not found');
  }
});
