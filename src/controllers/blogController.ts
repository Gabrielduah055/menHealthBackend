import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import BlogPost from '../models/BlogPost';
import { parseBlogHtml } from '../utils/blogParser';

const parseBoolean = (value: unknown) => value === 'true' || value === true;

const parseStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    } catch {
      return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
};

const parseSections = (
  value: unknown
): { title: string; body: string }[] | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        title: String((item as any)?.title || '').trim(),
        body: String((item as any)?.body || '').trim(),
      }))
      .filter((section) => section.title || section.body);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => ({
            title: String((item as any)?.title || '').trim(),
            body: String((item as any)?.body || '').trim(),
          }))
          .filter((section) => section.title || section.body);
      }
    } catch {
      return [];
    }
  }

  return [];
};

const uniqueStrings = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const buildAvatarLabel = (name: string) => {
  if (!name) return 'AD';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return initials || 'AD';
};

const buildAuthorSnapshot = (req: Request) => {
  const admin = req.admin;
  if (!admin) return undefined;
  const name = admin.name || 'Admin';
  const role =
    admin.authorRole ||
    (admin.role === 'admin' ? 'Administrator' : admin.role || 'Admin');
  const avatarLabel = admin.avatarLabel || buildAvatarLabel(name);

  return {
    id: admin._id,
    name,
    role,
    avatarLabel,
  };
};

const normalizeTopics = (topics?: string[], tags?: string[]) => {
  const normalized = (topics || []).map((topic) =>
    topic.startsWith('#') ? topic : `#${topic}`
  );
  if (normalized.length) return uniqueStrings(normalized);
  if (tags && tags.length) {
    return uniqueStrings(tags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)));
  }
  return [];
};

// @desc    Get published blogs
// @route   GET /api/blogs
// @access  Public
export const getPublicBlogs = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await BlogPost.find({ status: 'published' })
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 });
  res.json(blogs);
});

// @desc    Get published blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getPublicBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findOne({ slug: req.params.slug, status: 'published' }).populate(
    'category',
    'name slug'
  );
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
  const blogs = await BlogPost.find({})
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  res.json(blogs);
});

// @desc    Get blog by ID (admin)
// @route   GET /api/admin/blogs/:id
// @access  Private/Admin
export const getAdminBlogById = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findById(req.params.id).populate('category', 'name slug');
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
  const { title, slug, content, excerpt, category, allowComments, status } = req.body;
  const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
  const coverFile = files?.coverImage?.[0] || (req as any).file;
  const galleryFiles = files?.galleryImages || [];

  const parsed = parseBlogHtml(content || '');
  const shouldRegenerate = parseBoolean(req.body.regenerateStructured);
  const manualSections = parseSections(req.body.sections);
  const manualTopics = parseStringArray(req.body.topics);
  const manualTags = parseStringArray(req.body.tags) || [];
  const manualGallery = parseStringArray(req.body.gallery);
  const author = buildAuthorSnapshot(req);

  const normalizedStatus = status === 'published' ? 'published' : 'draft';
  const resolvedSections =
    shouldRegenerate || !manualSections || manualSections.length === 0
      ? parsed.sections
      : manualSections;
  const resolvedQuote = shouldRegenerate ? parsed.quote : req.body.quote || parsed.quote;
  const resolvedReadTime = shouldRegenerate
    ? parsed.readTime
    : req.body.readTime || parsed.readTime;
  const resolvedExcerpt = req.body.excerpt || excerpt || parsed.excerpt;

  const uploadedGallery = galleryFiles.map((file) => file.path);
  let resolvedGallery: string[] = [];
  if (shouldRegenerate) {
    resolvedGallery = uniqueStrings([...(parsed.gallery || []), ...uploadedGallery]);
  } else if (manualGallery !== undefined || uploadedGallery.length > 0) {
    resolvedGallery = uniqueStrings([...(manualGallery || []), ...uploadedGallery]);
  } else {
    resolvedGallery = uniqueStrings(parsed.gallery || []);
  }

  const resolvedTopics = normalizeTopics(
    shouldRegenerate ? parsed.topics : manualTopics ?? [],
    manualTags
  );

  const featuredLabel = req.body.featuredLabel || undefined;
  const isFeatured = parseBoolean(req.body.isFeatured);

  const coverImageUrl = coverFile?.path || req.body.coverImageUrl;

  const blogExists = await BlogPost.findOne({ slug });
  if (blogExists) {
    res.status(400);
    throw new Error('Blog with this slug already exists');
  }

  const blog = await BlogPost.create({
    title,
    slug,
    content,
    excerpt: resolvedExcerpt,
    coverImageUrl,
    tags: manualTags,
    category,
    author,
    sections: resolvedSections,
    quote: resolvedQuote,
    gallery: resolvedGallery,
    topics: resolvedTopics,
    readTime: resolvedReadTime,
    featuredLabel,
    isFeatured,
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
    const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
    const coverFile = files?.coverImage?.[0] || (req as any).file;
    const galleryFiles = files?.galleryImages || [];

    blog.title = req.body.title || blog.title;
    blog.slug = req.body.slug || blog.slug;
    blog.content = req.body.content || blog.content;

    if (req.body.excerpt !== undefined) {
      blog.excerpt = req.body.excerpt;
    }

    const manualTags = parseStringArray(req.body.tags);
    if (manualTags !== undefined) blog.tags = manualTags;

    if (req.body.category) blog.category = req.body.category;
    if (req.body.allowComments !== undefined)
      blog.allowComments = parseBoolean(req.body.allowComments);

    if (req.body.coverImageUrl) {
      blog.coverImageUrl = req.body.coverImageUrl;
    }

    if (coverFile) {
      blog.coverImageUrl = coverFile.path;
    }

    const shouldRegenerate = parseBoolean(req.body.regenerateStructured);
    const manualSections = parseSections(req.body.sections);
    const manualTopics = parseStringArray(req.body.topics);
    const manualGallery = parseStringArray(req.body.gallery);
    const parsed = parseBlogHtml(blog.content);

    if (shouldRegenerate || manualSections !== undefined || !blog.sections?.length) {
      blog.sections =
        shouldRegenerate || manualSections === undefined
          ? parsed.sections
          : manualSections;
    }

    if (shouldRegenerate || req.body.quote !== undefined || !blog.quote) {
      blog.quote = shouldRegenerate ? parsed.quote : req.body.quote || parsed.quote;
    }

    if (shouldRegenerate || req.body.readTime !== undefined || !blog.readTime) {
      blog.readTime = shouldRegenerate
        ? parsed.readTime
        : req.body.readTime || parsed.readTime;
    }

    if (shouldRegenerate || req.body.excerpt !== undefined || !blog.excerpt) {
      blog.excerpt = req.body.excerpt || parsed.excerpt || blog.excerpt;
    }

    const uploadedGallery = galleryFiles.map((file) => file.path);
    if (shouldRegenerate) {
      blog.gallery = uniqueStrings([...(parsed.gallery || []), ...uploadedGallery]);
    } else if (manualGallery !== undefined || uploadedGallery.length > 0) {
      blog.gallery = uniqueStrings([...(manualGallery || []), ...uploadedGallery]);
    } else if (!blog.gallery?.length) {
      blog.gallery = uniqueStrings(parsed.gallery || []);
    }

    if (req.body.featuredLabel !== undefined) {
      blog.featuredLabel = req.body.featuredLabel;
    }
    if (req.body.isFeatured !== undefined) {
      blog.isFeatured = parseBoolean(req.body.isFeatured);
    }

    if (shouldRegenerate || manualTopics !== undefined || !blog.topics?.length) {
      const tagsForTopics = manualTags ?? blog.tags;
      const resolvedTopics = normalizeTopics(
        shouldRegenerate ? parsed.topics : manualTopics || [],
        tagsForTopics
      );
      blog.topics = resolvedTopics;
    }

    if (req.body.status) {
      blog.status = req.body.status === 'published' ? 'published' : 'draft';
      blog.publishedAt = blog.status === 'published' ? blog.publishedAt || new Date() : null;
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
