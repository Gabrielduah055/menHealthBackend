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
exports.updateOrderStatus = exports.getAdminOrderById = exports.getAdminOrders = exports.verifyPayment = exports.createOrder = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const axios_1 = __importDefault(require("axios"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { customer, items } = req.body;
    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }
    // 1. Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
        const product = yield Product_1.default.findById(item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.productId}`);
        }
        if (product.stockQty < item.qty) {
            res.status(400);
            throw new Error(`Insufficient stock for product: ${product.name}`);
        }
        // Snapshot data
        const lineTotal = product.price * item.qty;
        totalAmount += lineTotal;
        orderItems.push({
            productId: product._id,
            nameSnapshot: product.name,
            priceSnapshot: product.price,
            qty: item.qty,
            lineTotal,
        });
    }
    // 2. Initialize Paystack Transaction
    // Amount in kobo/pesewas (x100 if currency is standard unit)
    // Assuming price is in standard unit (e.g. GHS or NGN)
    const paystackAmount = Math.round(totalAmount * 100);
    let paystackData;
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        };
        const response = yield axios_1.default.post('https://api.paystack.co/transaction/initialize', {
            email: customer.email,
            amount: paystackAmount,
            callback_url: process.env.PAYSTACK_CALLBACK_URL,
            metadata: {
                customer_name: customer.name,
            },
        }, config);
        paystackData = response.data.data;
    }
    catch (error) {
        console.error('Paystack Init Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500);
        throw new Error('Payment initialization failed');
    }
    // 3. Create Order
    const order = yield Order_1.default.create({
        customer,
        items: orderItems,
        totalAmount,
        status: 'pending',
        payment: {
            provider: 'paystack',
            reference: paystackData.reference,
            status: 'pending',
        },
    });
    res.status(201).json({
        order,
        paymentUrl: paystackData.authorization_url,
        reference: paystackData.reference,
    });
}));
// @desc    Verify Paystack Payment
// @route   POST /api/payments/paystack/verify
// @access  Public
exports.verifyPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { reference } = req.body;
    if (!reference) {
        res.status(400);
        throw new Error('Payment reference is required');
    }
    const order = yield Order_1.default.findOne({ 'payment.reference': reference });
    if (!order) {
        res.status(404);
        throw new Error('Order not found with this reference');
    }
    if (order.payment.status === 'paid') {
        res.json({ message: 'Order already paid', order });
        return;
    }
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        };
        const response = yield axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, config);
        const data = response.data.data;
        if (data.status === 'success') {
            // Payment successful
            // Verify amount matches? 
            // if (data.amount !== Math.round(order.totalAmount * 100)) ...
            order.payment.status = 'paid';
            order.payment.paidAt = new Date();
            order.status = 'paid'; // or 'processing' if auto-process
            // Update stock? 
            // Should loop through items and decrement stock.
            // Doing it here or separate? MVP: maybe do it here.
            for (const item of order.items) {
                const product = yield Product_1.default.findById(item.productId);
                if (product) {
                    product.stockQty -= item.qty;
                    yield product.save();
                }
            }
            yield order.save();
            res.json({ message: 'Payment verified', order });
        }
        else {
            order.payment.status = 'failed';
            yield order.save();
            res.status(400);
            throw new Error('Payment verification failed at Paystack');
        }
    }
    catch (error) {
        console.error('Paystack Verify Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500);
        throw new Error('Payment verification failed');
    }
}));
// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAdminOrders = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield Order_1.default.find({}).sort({ createdAt: -1 });
    res.json(orders);
}));
// @desc    Get order by ID (admin)
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
exports.getAdminOrderById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield Order_1.default.findById(req.params.id).populate('items.productId', 'name slug images');
    if (order) {
        res.json(order);
    }
    else {
        res.status(404);
        throw new Error('Order not found');
    }
}));
// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield Order_1.default.findById(req.params.id);
    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = yield order.save();
        res.json(updatedOrder);
    }
    else {
        res.status(404);
        throw new Error('Order not found');
    }
}));
