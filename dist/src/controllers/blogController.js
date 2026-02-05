"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpublishBlog = exports.publishBlog = exports.updateBlog = exports.createBlog = exports.getAdminBlogs = exports.getPublicBlogBySlug = exports.getPublicBlogs = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BlogPost_1 = __importDefault(require("../models/BlogPost"));
// @desc    Get published blogs
// @route   GET /api/blogs
// @access  Public
exports.getPublicBlogs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogs = yield BlogPost_1.default.find({ status: 'published' }).sort({ publishedAt: -1 });
    res.json(blogs);
}));
// @desc    Get published blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
exports.getPublicBlogBySlug = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield BlogPost_1.default.findOne({ slug: req.params.slug, status: 'published' });
    if (blog) {
        res.json(blog);
    }
    else {
        res.status(404);
        throw new Error('Blog post not found');
    }
}));
// @desc    Get all blogs (admin)
// @route   GET /api/admin/blogs
// @access  Private/Admin
exports.getAdminBlogs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogs = yield BlogPost_1.default.find({}).sort({ createdAt: -1 });
    res.json(blogs);
}));
// @desc    Create a blog post
// @route   POST /api/admin/blogs
// @access  Private/Admin
exports.createBlog = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, slug, content, excerpt, coverImageUrl, tags } = req.body;
    const blogExists = yield BlogPost_1.default.findOne({ slug });
    if (blogExists) {
        res.status(400);
        throw new Error('Blog with this slug already exists');
    }
    const blog = yield BlogPost_1.default.create({
        title,
        slug,
        content,
        excerpt,
        coverImageUrl,
        tags,
        status: 'draft',
    });
    if (blog) {
        res.status(201).json(blog);
    }
    else {
        res.status(400);
        throw new Error('Invalid blog data');
    }
}));
// @desc    Update a blog post
// @route   PUT /api/admin/blogs/:id
// @access  Private/Admin
exports.updateBlog = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield BlogPost_1.default.findById(req.params.id);
    if (blog) {
        blog.title = req.body.title || blog.title;
        blog.slug = req.body.slug || blog.slug;
        blog.content = req.body.content || blog.content;
        blog.excerpt = req.body.excerpt || blog.excerpt;
        blog.coverImageUrl = req.body.coverImageUrl || blog.coverImageUrl;
        blog.tags = req.body.tags || blog.tags;
        const updatedBlog = yield blog.save();
        res.json(updatedBlog);
    }
    else {
        res.status(404);
        throw new Error('Blog post not found');
    }
}));
// @desc    Publish a blog post
// @route   PATCH /api/admin/blogs/:id/publish
// @access  Private/Admin
exports.publishBlog = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield BlogPost_1.default.findById(req.params.id);
    if (blog) {
        blog.status = 'published';
        blog.publishedAt = new Date();
        const updatedBlog = yield blog.save();
        res.json(updatedBlog);
    }
    else {
        res.status(404);
        throw new Error('Blog post not found');
    }
}));
// @desc    Unpublish a blog post
// @route   PATCH /api/admin/blogs/:id/unpublish
// @access  Private/Admin
exports.unpublishBlog = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield BlogPost_1.default.findById(req.params.id);
    if (blog) {
        blog.status = 'draft';
        blog.publishedAt = null;
        const updatedBlog = yield blog.save();
        res.json(updatedBlog);
    }
    else {
        res.status(404);
        throw new Error('Blog post not found');
    }
}));
