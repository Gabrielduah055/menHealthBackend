import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/authRoutes';
import userAuthRoutes from './routes/userAuthRoutes';
import blogRoutes from './routes/blogRoutes';
import adminBlogRoutes from './routes/adminBlogRoutes';
import productRoutes from './routes/productRoutes';
import adminProductRoutes from './routes/adminProductRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminOrderRoutes from './routes/adminOrderRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminCommentRoutes from './routes/adminCommentRoutes';
import commentRoutes from './routes/commentRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/auth', userAuthRoutes);
app.use('/api/blogs', blogRoutes);
// Mount comment routes on blogs for cleaner API structure if desired, or separate
app.use('/api/blogs/:id/comments', commentRoutes);
app.use('/api/admin/blogs', adminBlogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/comments', adminCommentRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Middleware
app.use(errorHandler);

export default app;
