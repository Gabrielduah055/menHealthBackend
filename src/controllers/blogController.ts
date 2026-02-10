import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import BlogPost from '../models/BlogPost';

// @desc    Get published blogs
// @route   GET /api/blogs
// @access  Public
export const getPublicBlogs = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await BlogPost.find({ status: 'published' }).sort({ publishedAt: -1 });
  res.json(blogs);
});

// @desc    Get published blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getPublicBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findOne({ slug: req.params.slug, status: 'published' });
  if (blog) {
    res.json(blog);
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Increment blog view count
// @route   POST /api/blogs/:id/view
// @access  Public
export const incrementBlogView = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findById(req.params.id);
  if (blog) {
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    res.json({ views: blog.views });
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Get all blogs (admin)
// @route   GET /api/admin/blogs
// @access  Private/Admin
export const getAdminBlogs = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await BlogPost.find({}).sort({ createdAt: -1 });
  res.json(blogs);
});

// @desc    Get blog by ID (admin)
// @route   GET /api/admin/blogs/:id
// @access  Private/Admin
export const getAdminBlogById = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findById(req.params.id);
  if (blog) {
    res.json(blog);
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Create a blog post
// @route   POST /api/admin/blogs
// @access  Private/Admin
export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const { title, slug, content, excerpt, tags, category, allowComments, status } = req.body;
  let coverImageUrl = req.body.coverImageUrl;

  if (req.file) {
    coverImageUrl = req.file.path;
  }

  const blogExists = await BlogPost.findOne({ slug });
  if (blogExists) {
    res.status(400);
    throw new Error('Blog with this slug already exists');
  }

  const normalizedStatus = status === 'published' ? 'published' : 'draft';

  const blog = await BlogPost.create({
    title,
    slug,
    content,
    excerpt,
    coverImageUrl,
    tags,
    category,
    allowComments: allowComments === 'true' || allowComments === true,
    status: normalizedStatus,
    publishedAt: normalizedStatus === 'published' ? new Date() : null,
  });

  if (blog) {
    res.status(201).json(blog);
  } else {
    res.status(400);
    throw new Error('Invalid blog data');
  }
});

// @desc    Update a blog post
// @route   PUT /api/admin/blogs/:id
// @access  Private/Admin
export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findById(req.params.id);

  if (blog) {
    blog.title = req.body.title || blog.title;
    blog.slug = req.body.slug || blog.slug;
    blog.content = req.body.content || blog.content;
    blog.excerpt = req.body.excerpt || blog.excerpt;
    blog.tags = req.body.tags || blog.tags;
    
    if (req.body.category) blog.category = req.body.category;
    if (req.body.allowComments !== undefined) blog.allowComments = req.body.allowComments === 'true' || req.body.allowComments === true;

    if (req.body.coverImageUrl) {
        blog.coverImageUrl = req.body.coverImageUrl;
    }

    if (req.file) {
      blog.coverImageUrl = req.file.path;
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Publish a blog post
// @route   PATCH /api/admin/blogs/:id/publish
// @access  Private/Admin
export const publishBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findById(req.params.id);

  if (blog) {
    blog.status = 'published';
    blog.publishedAt = new Date();
    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Unpublish a blog post
// @route   PATCH /api/admin/blogs/:id/unpublish
// @access  Private/Admin
export const unpublishBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findById(req.params.id);

  if (blog) {
    blog.status = 'draft';
    blog.publishedAt = null;
    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Delete blog by ID (admin)
// @route   DELETE /api/admin/blogs/:id
// @access  Private/Admin
export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findById(req.params.id);
  if (blog) {
    await blog.deleteOne();
    res.json({ message: 'Blog post removed' });
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});
