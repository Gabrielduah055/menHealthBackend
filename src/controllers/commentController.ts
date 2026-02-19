import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment';
import BlogPost from '../models/BlogPost';
import {
  sendNewCommentAdminNotification,
  sendAdminReplyNotification,
} from '../utils/emailService';

const sanitizeContent = (text: string): string =>
  text.replace(/<[^>]*>/g, '').trim();

const OFFENSIVE_PATTERNS = [
  /\bf+u+c+k+\b/i,
  /\bs+h+i+t+\b/i,
  /\bb+i+t+c+h+\b/i,
  /\ba+s+s+h+o+l+e+\b/i,
  /\bn+i+g+g+e+r+\b/i,
  /\bc+u+n+t+\b/i,
];

const containsOffensiveLanguage = (text: string): boolean =>
  OFFENSIVE_PATTERNS.some((pattern) => pattern.test(text));

// @desc    Get comments for a post
// @route   GET /api/blogs/:id/comments
// @access  Public
export const getPostComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await Comment.find({ postId: req.params.id, isApproved: true }).sort({ createdAt: -1 });
  res.json(comments);
});

// @desc    Add a comment to a post
// @route   POST /api/blogs/:id/comments
// @access  Private/User
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    res.status(400);
    throw new Error('Comment content is required.');
  }

  const sanitized = sanitizeContent(content);

  if (sanitized.length < 5) {
    res.status(400);
    throw new Error('Comment must be at least 5 characters.');
  }

  if (sanitized.length > 500) {
    res.status(400);
    throw new Error('Comment must not exceed 500 characters.');
  }

  if (containsOffensiveLanguage(sanitized)) {
    res.status(400);
    throw new Error('Comment contains inappropriate language.');
  }

  const blog = await BlogPost.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  if (blog.status !== 'published') {
    res.status(403);
    throw new Error('Comments are not allowed on unpublished posts.');
  }

  if (!blog.allowComments) {
    res.status(403);
    throw new Error('Comments are disabled for this post.');
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const duplicate = await Comment.findOne({
    userId: user._id,
    postId: req.params.id,
    content: sanitized,
    createdAt: { $gte: tenMinutesAgo },
  });

  if (duplicate) {
    res.status(409);
    throw new Error('You already submitted this comment recently.');
  }

  const comment = await Comment.create({
    postId: req.params.id,
    userId: user._id,
    name: user.fullName,
    email: user.email,
    content: sanitized,
    isApproved: false,
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendNewCommentAdminNotification(adminEmail, {
      commenterName: user.fullName,
      commenterEmail: user.email,
      contentExcerpt: sanitized.length > 120 ? `${sanitized.slice(0, 120)}…` : sanitized,
      postTitle: blog.title,
      postSlug: blog.slug,
      commentId: (comment._id as any).toString(),
    }).catch((err) => console.error('Admin comment notification failed:', err));
  }

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

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400);
    throw new Error('Reply content is required.');
  }

  const comment = await Comment.findById(req.params.id).populate('postId', 'title slug');

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const adminName = (req as any).admin?.name || 'Admin';
  const replyContent = sanitizeContent(content);

  comment.replies.push({
    name: adminName,
    content: replyContent,
    createdAt: new Date(),
  });
  comment.isApproved = true;
  const updatedComment = await comment.save();

  const post = comment.postId as any;
  if (comment.email && post?.slug) {
    const replyPreview = replyContent.length > 120 ? `${replyContent.slice(0, 120)}…` : replyContent;
    sendAdminReplyNotification(comment.email, {
      userName: comment.name,
      replyPreview,
      postTitle: post.title || 'Article',
      postSlug: post.slug,
      commentId: (comment._id as any).toString(),
    }).catch((err) => console.error('Reply notification failed:', err));
  }

  res.json(updatedComment);
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
