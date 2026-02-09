import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import Product from '../models/Product';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();

  // Calculate total revenue from paid orders
  const revenueAgg = await Order.aggregate([
    {
      $match: {
        $or: [{ status: 'paid' }, { 'payment.status': 'paid' }],
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
      },
    },
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  // Calculate unique customers
  const customersAgg = await Order.aggregate([
    {
      $group: {
        _id: '$customer.email',
      },
    },
    {
      $count: 'count',
    },
  ]);

  const totalCustomers = customersAgg.length > 0 ? customersAgg[0].count : 0;

  res.json({
    totalOrders,
    totalProducts,
    totalRevenue,
    totalCustomers,
  });
});
