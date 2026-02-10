import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product';

const MAX_PRODUCT_IMAGES = 4;

const toArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') return value ? [value] : [];
  return [];
};

// @desc    Get active products
// @route   GET /api/products
// @access  Public
export const getPublicProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(products);
});

// @desc    Get active product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getPublicProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAdminProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
});

// @desc    Get product by ID (admin)
// @route   GET /api/admin/products/:id
// @access  Private/Admin
export const getAdminProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, description, price, stockQty } = req.body;
  let images = toArray(req.body.images);

  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    const uploadedImages = files.map((file) => file.path);
    images = [...images, ...uploadedImages];
  }

  if (images.length === 0) {
    res.status(400);
    throw new Error('Main product image is required');
  }

  if (images.length > MAX_PRODUCT_IMAGES) {
    res.status(400);
    throw new Error('A product can have at most 4 images (1 main + up to 3 thumbnails)');
  }

  const productExists = await Product.findOne({ slug });
  if (productExists) {
    res.status(400);
    throw new Error('Product with this slug already exists');
  }

  const product = await Product.create({
    name,
    slug,
    description,
    price,
    stockQty,
    images,
    isActive: true,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error('Invalid product data');
  }
});

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.slug = req.body.slug || product.slug;
    product.description = req.body.description || product.description;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.stockQty = req.body.stockQty !== undefined ? req.body.stockQty : product.stockQty;

    // Handle existing images passed as strings (if any)
    if (req.body.images !== undefined) {
      // If the user sends image URLs they want to keep, preserve this exact order:
      // first image = main image, remaining = thumbnails.
      product.images = toArray(req.body.images);
    }

    // Handle new file uploads
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const newImages = files.map((file) => file.path);
      // Append new images to existing ones (or the ones reset above)
      product.images = [...product.images, ...newImages];
    }

    if (product.images.length === 0) {
      res.status(400);
      throw new Error('Main product image is required');
    }

    if (product.images.length > MAX_PRODUCT_IMAGES) {
      res.status(400);
      throw new Error('A product can have at most 4 images (1 main + up to 3 thumbnails)');
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Toggle product active status
// @route   PATCH /api/admin/products/:id/toggle
// @access  Private/Admin
export const toggleProductActive = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.isActive = !product.isActive;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
