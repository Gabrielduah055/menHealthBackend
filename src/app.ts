import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';
import adminBlogRoutes from './routes/adminBlogRoutes';
import productRoutes from './routes/productRoutes';
import adminProductRoutes from './routes/adminProductRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminOrderRoutes from './routes/adminOrderRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin/blogs', adminBlogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Middleware
app.use(errorHandler);

export default app;
