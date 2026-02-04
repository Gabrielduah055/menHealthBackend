import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Order from '../models/Order';
import Product from '../models/Product';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { customer, items } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // 1. Validate items and calculate total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
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

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: customer.email,
        amount: paystackAmount,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          customer_name: customer.name,
        },
      },
      config
    );

    paystackData = response.data.data;
  } catch (error: any) {
    console.error('Paystack Init Error:', error.response?.data || error.message);
    res.status(500);
    throw new Error('Payment initialization failed');
  }

  // 3. Create Order
  const order = await Order.create({
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
});

// @desc    Verify Paystack Payment
// @route   POST /api/payments/paystack/verify
// @access  Public
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { reference } = req.body;

  if (!reference) {
    res.status(400);
    throw new Error('Payment reference is required');
  }

  const order = await Order.findOne({ 'payment.reference': reference });

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

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      config
    );

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
          const product = await Product.findById(item.productId);
          if (product) {
              product.stockQty -= item.qty;
              await product.save();
          }
      }

      await order.save();
      res.json({ message: 'Payment verified', order });
    } else {
        order.payment.status = 'failed';
        await order.save();
        res.status(400);
        throw new Error('Payment verification failed at Paystack');
    }

  } catch (error: any) {
    console.error('Paystack Verify Error:', error.response?.data || error.message);
    res.status(500);
    throw new Error('Payment verification failed');
  }
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAdminOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID (admin)
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export const getAdminOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('items.productId', 'name slug images');
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
