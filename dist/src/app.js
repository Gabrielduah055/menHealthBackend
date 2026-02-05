"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_1 = require("./middleware/error");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const adminBlogRoutes_1 = __importDefault(require("./routes/adminBlogRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const adminProductRoutes_1 = __importDefault(require("./routes/adminProductRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const adminOrderRoutes_1 = __importDefault(require("./routes/adminOrderRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/admin/auth', authRoutes_1.default);
app.use('/api/blogs', blogRoutes_1.default);
app.use('/api/admin/blogs', adminBlogRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/admin/products', adminProductRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/admin/orders', adminOrderRoutes_1.default);
app.get('/', (req, res) => {
    res.send('API is running...');
});
// Error Middleware
app.use(error_1.errorHandler);
exports.default = app;
