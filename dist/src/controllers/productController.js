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
exports.toggleProductActive = exports.updateProduct = exports.createProduct = exports.getAdminProducts = exports.getPublicProductBySlug = exports.getPublicProducts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Product_1 = __importDefault(require("../models/Product"));
// @desc    Get active products
// @route   GET /api/products
// @access  Public
exports.getPublicProducts = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield Product_1.default.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
}));
// @desc    Get active product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getPublicProductBySlug = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield Product_1.default.findOne({ slug: req.params.slug, isActive: true });
    if (product) {
        res.json(product);
    }
    else {
        res.status(404);
        throw new Error('Product not found');
    }
}));
// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAdminProducts = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield Product_1.default.find({}).sort({ createdAt: -1 });
    res.json(products);
}));
// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, slug, description, price, stockQty, images } = req.body;
    const productExists = yield Product_1.default.findOne({ slug });
    if (productExists) {
        res.status(400);
        throw new Error('Product with this slug already exists');
    }
    const product = yield Product_1.default.create({
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
    }
    else {
        res.status(400);
        throw new Error('Invalid product data');
    }
}));
// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield Product_1.default.findById(req.params.id);
    if (product) {
        product.name = req.body.name || product.name;
        product.slug = req.body.slug || product.slug;
        product.description = req.body.description || product.description;
        product.price = req.body.price !== undefined ? req.body.price : product.price;
        product.stockQty = req.body.stockQty !== undefined ? req.body.stockQty : product.stockQty;
        product.images = req.body.images || product.images;
        const updatedProduct = yield product.save();
        res.json(updatedProduct);
    }
    else {
        res.status(404);
        throw new Error('Product not found');
    }
}));
// @desc    Toggle product active status
// @route   PATCH /api/admin/products/:id/toggle
// @access  Private/Admin
exports.toggleProductActive = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield Product_1.default.findById(req.params.id);
    if (product) {
        product.isActive = !product.isActive;
        const updatedProduct = yield product.save();
        res.json(updatedProduct);
    }
    else {
        res.status(404);
        throw new Error('Product not found');
    }
}));
