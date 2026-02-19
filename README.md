# HealthPulse — Men's Health Backend API

> A robust, production-ready REST API built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB (Mongoose)**. Powers the HealthPulse men's health platform — handling authentication, blog content, e-commerce, orders, payments, comments, and email notifications.

**Live API:** [https://menhealthbackend.onrender.com](https://menhealthbackend.onrender.com)  
**Frontend:** [https://men-health-mu.vercel.app](https://men-health-mu.vercel.app)  
**Deployed on:** Render

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Admin Auth](#admin-auth)
  - [User Auth](#user-auth)
  - [Blogs](#blogs)
  - [Products](#products)
  - [Categories](#categories)
  - [Comments](#comments)
  - [Orders](#orders)
  - [Payments](#payments)
  - [Dashboard](#dashboard)
- [Data Models](#data-models)
- [Authentication & Authorization](#authentication--authorization)
- [Email Notification System](#email-notification-system)
- [File Uploads](#file-uploads)
- [Security](#security)
- [Planned Advanced Features](#planned-advanced-features)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Language | TypeScript 5 |
| Database | MongoDB via Mongoose 8 |
| Authentication | JSON Web Tokens (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Email | Brevo (SendinBlue) HTTP API via `@getbrevo/brevo` |
| File Storage | Cloudinary via `multer-storage-cloudinary` |
| Payments | Paystack |
| Security | Helmet, CORS, express-rate-limit |
| HTML Parsing | Cheerio |
| Dev Tools | Nodemon, ts-node |
| Deployment | Render |

---

## Features

### Authentication (Dual System)
- **Admin authentication** — separate login for platform administrators with role-based access control
- **User authentication** — full registration, OTP email verification, login, password reset flow
- **JWT-based sessions** — stateless Bearer token auth for both admin and user roles
- **Password hashing** — bcryptjs with salt rounds for secure storage

### Blog & Content Management
- **Full CRUD** for blog posts (admin only)
- **Rich post model** — title, slug, cover image, excerpt, HTML content, sections, quote, gallery, tags, topics, category, author, read time, featured label
- **Draft / Published** workflow — posts default to `draft` and must be explicitly published
- **View counter** — increments on each public fetch
- **Comment toggle** — `allowComments` flag per post
- **ISR-friendly** — public endpoints designed for Next.js `revalidate` caching

### E-Commerce
- **Product management** — name, slug, description, price, stock quantity, up to 4 images (1 main + 3 thumbnails), active/inactive toggle
- **Stock tracking** — `stockQty` field with low-stock and out-of-stock states
- **Order creation** — captures customer details, line items with price snapshots, total amount
- **Order lifecycle** — `pending → paid → processing → delivered` status transitions
- **Paystack integration** — payment initialisation and webhook verification

### Comment System
- **Auth-gated** — only verified users can post comments (`protectUser` middleware)
- **Content validation** — 5–500 character limit, offensive language filter, duplicate detection (10-minute window)
- **Approval workflow** — comments default to `isApproved: false`; admin approves via dashboard
- **Admin replies** — admins can reply to any comment from the admin panel
- **Share tokens** — each comment has a unique `shareToken` (crypto random) and `shareCount`
- **Rate limiting** — 5 comments per 15 minutes per IP
- **Email notifications** — admin notified on new comment; commenter notified on admin reply

### Email Notifications
- **User verification** — 6-digit OTP sent on registration
- **Password reset** — OTP-based reset flow
- **New comment alert** — admin receives branded email with commenter name, excerpt, and post link
- **Admin reply notification** — commenter receives reply preview and link back to article
- All emails use branded HTML templates (HealthPulse violet `#7c3aed`)

### Admin Dashboard
- **Stats endpoint** — total blogs, products, orders, and users in a single request
- **Admin-only routes** — all `/api/admin/*` routes protected by `protect` + `requireAdmin` middleware

### Categories
- Shared category model used by both blogs and products
- Full CRUD for categories (admin)
- Public read endpoint for frontend filtering

---

## Project Structure

```
menHealthBackend/
├── src/
│   ├── server.ts                   # Entry point — connects DB, starts Express
│   ├── app.ts                      # Express app setup — middleware, route mounting
│   ├── config/
│   │   ├── db.ts                   # MongoDB connection via Mongoose
│   │   ├── brevo.config.ts         # Brevo API client initialisation
│   │   └── cloudinary.ts           # Cloudinary SDK configuration
│   ├── middleware/
│   │   ├── auth.ts                 # protect (admin), requireAdmin, protectUser (user)
│   │   ├── error.ts                # Global Express error handler
│   │   └── uploadMiddleware.ts     # Multer + Cloudinary storage config
│   ├── models/
│   │   ├── AdminUser.ts            # Admin account model
│   │   ├── User.ts                 # Public user model (registration, OTP, reset)
│   │   ├── BlogPost.ts             # Blog post model with sections, gallery, author
│   │   ├── Product.ts              # Product model with image array
│   │   ├── Category.ts             # Shared category model
│   │   ├── Comment.ts              # Comment model with replies, shareToken
│   │   └── Order.ts                # Order model with payment sub-document
│   ├── controllers/
│   │   ├── authController.ts       # Admin login
│   │   ├── userAuthController.ts   # User register, verify, login, me, reset password
│   │   ├── blogController.ts       # Public + admin blog CRUD, view counter
│   │   ├── productController.ts    # Public + admin product CRUD
│   │   ├── categoryController.ts   # Category CRUD
│   │   ├── commentController.ts    # Add comment, get comments, admin reply, approve
│   │   ├── orderController.ts      # Create order, get orders, update status
│   │   └── dashboardController.ts  # Aggregate stats for admin dashboard
│   ├── routes/
│   │   ├── authRoutes.ts           # POST /api/admin/auth/login
│   │   ├── userAuthRoutes.ts       # POST /api/auth/register|verify|login|reset-*
│   │   ├── blogRoutes.ts           # GET /api/blogs (public)
│   │   ├── adminBlogRoutes.ts      # Full CRUD /api/admin/blogs (protected)
│   │   ├── productRoutes.ts        # GET /api/products (public)
│   │   ├── adminProductRoutes.ts   # Full CRUD /api/admin/products (protected)
│   │   ├── categoryRoutes.ts       # GET + CRUD /api/categories
│   │   ├── commentRoutes.ts        # GET + POST /api/blogs/:id/comments (protectUser)
│   │   ├── adminCommentRoutes.ts   # Admin approve + reply /api/admin/comments
│   │   ├── orderRoutes.ts          # POST /api/orders
│   │   ├── paymentRoutes.ts        # POST /api/payments/initialize|verify
│   │   ├── adminOrderRoutes.ts     # GET + PATCH /api/admin/orders (protected)
│   │   └── dashboardRoutes.ts      # GET /api/admin/dashboard/stats (protected)
│   ├── utils/
│   │   ├── emailService.ts         # sendEmail, OTP emails, comment notifications
│   │   └── blogParser.ts           # HTML parsing utilities (Cheerio)
│   └── types/
│       └── express.d.ts            # Express Request type augmentation (req.admin, req.user)
├── scripts/                        # Utility/seed scripts
├── .env.example                    # Environment variable template
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB)
- Brevo account (for email)
- Cloudinary account (for image uploads)
- Paystack account (for payments)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd menHealthBackend

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Server starts on `http://localhost:5000` with Nodemon hot-reload.

### Build & Production

```bash
npm run build   # Compiles TypeScript to dist/
npm run start   # Runs compiled JS from dist/
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/menshealth

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxx
APP_URL=https://menhealthbackend.onrender.com
PAYSTACK_CALLBACK_URL=https://men-health-mu.vercel.app/checkout?verify=true

# Email (Brevo HTTP API)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxx
SMTP_EMAIL=noreply@yourdomain.com

# Comment & Notification System
ADMIN_EMAIL=admin@yourdomain.com
FRONTEND_URL=https://men-health-mu.vercel.app
```

> **Security:** Never commit `.env` to version control. It is listed in `.gitignore`.

---

## API Reference

### Admin Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/auth/login` | None | Admin login — returns JWT |

**Request body:**
```json
{ "email": "admin@example.com", "password": "secret" }
```

---

### User Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new user, sends OTP email |
| `POST` | `/api/auth/verify` | None | Verify email with 6-digit OTP |
| `POST` | `/api/auth/login` | None | Login — returns JWT |
| `GET` | `/api/auth/me` | User | Get current user profile |
| `POST` | `/api/auth/resend-verification` | None | Resend OTP to email |
| `POST` | `/api/auth/forgot-password` | None | Send password reset OTP |
| `POST` | `/api/auth/reset-password` | None | Reset password with OTP |

---

### Blogs

#### Public

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/blogs` | None | List all published blogs (supports `?category=slug`) |
| `GET` | `/api/blogs/:slug` | None | Get single blog post by slug (increments view count) |

#### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/blogs` | Admin | List all blogs (including drafts) |
| `POST` | `/api/admin/blogs` | Admin | Create new blog post |
| `GET` | `/api/admin/blogs/:id` | Admin | Get single blog post by ID |
| `PUT` | `/api/admin/blogs/:id` | Admin | Update blog post |
| `DELETE` | `/api/admin/blogs/:id` | Admin | Delete blog post |
| `POST` | `/api/admin/blogs/:id/image` | Admin | Upload cover image (Cloudinary) |

---

### Products

#### Public

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | None | List all active products |
| `GET` | `/api/products/:slug` | None | Get single product by slug |

#### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/products` | Admin | List all products |
| `POST` | `/api/admin/products` | Admin | Create product |
| `PUT` | `/api/admin/products/:id` | Admin | Update product |
| `DELETE` | `/api/admin/products/:id` | Admin | Delete product |
| `POST` | `/api/admin/products/:id/images` | Admin | Upload product images (Cloudinary, max 4) |

---

### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/categories` | None | List all categories |
| `POST` | `/api/categories` | Admin | Create category |
| `PUT` | `/api/categories/:id` | Admin | Update category |
| `DELETE` | `/api/categories/:id` | Admin | Delete category |

---

### Comments

#### Public / User

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/blogs/:id/comments` | None | Get approved comments for a post |
| `POST` | `/api/blogs/:id/comments` | User + Rate limit | Submit a new comment |

**Comment validation rules:**
- Content: 5–500 characters
- No duplicate submissions within 10 minutes from the same user on the same post
- Rate limit: 5 requests per 15 minutes per IP

#### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/comments` | Admin | List all comments (pending + approved) |
| `PATCH` | `/api/admin/comments/:id/approve` | Admin | Approve a comment |
| `POST` | `/api/admin/comments/:id/reply` | Admin | Reply to a comment (triggers email to commenter) |
| `DELETE` | `/api/admin/comments/:id` | Admin | Delete a comment |

---

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | None | Create a new order |
| `GET` | `/api/admin/orders` | Admin | List all orders |
| `GET` | `/api/admin/orders/:id` | Admin | Get single order |
| `PATCH` | `/api/admin/orders/:id/status` | Admin | Update order status |

---

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/initialize` | None | Initialize Paystack transaction |
| `GET` | `/api/payments/verify/:reference` | None | Verify Paystack payment by reference |

---

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard/stats` | Admin | Returns total blogs, products, orders, users |

---

## Data Models

### `AdminUser`
```ts
{
  name: string;
  email: string;           // unique
  passwordHash: string;
  role: 'admin';
  authorRole?: string;     // shown on blog posts (e.g. "Senior Editor")
  avatarLabel?: string;    // initials for avatar
  isActive: boolean;
}
```

### `User`
```ts
{
  fullName: string;
  email: string;           // unique, lowercase
  passwordHash: string;
  phone?: string;
  dateOfBirth?: Date;
  location?: string;
  profilePhoto?: string;   // Cloudinary URL
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetCode?: string;
  resetCodeExpires?: Date;
}
```

### `BlogPost`
```ts
{
  title: string;
  slug: string;            // unique, URL-safe
  coverImageUrl: string;   // Cloudinary URL
  excerpt: string;
  content: string;         // HTML
  status: 'draft' | 'published';
  category: ObjectId;      // ref: Category
  author: { id, name, role, avatarLabel };
  sections: { title: string; body: string }[];
  quote?: string;
  gallery: string[];       // Cloudinary URLs
  tags: string[];
  topics: string[];
  readTime?: string;
  featuredLabel?: string;
  isFeatured: boolean;
  views: number;
  allowComments: boolean;
  publishedAt: Date | null;
}
```

### `Product`
```ts
{
  name: string;
  slug: string;            // unique
  description: string;     // HTML
  price: number;           // GHS
  stockQty: number;
  images: string[];        // max 4; index 0 = main image
  isActive: boolean;
}
```

### `Comment`
```ts
{
  postId: ObjectId;        // ref: BlogPost
  userId?: ObjectId;       // ref: User
  name: string;
  email: string;
  content: string;
  isApproved: boolean;
  shareToken: string;      // crypto.randomBytes(16).toString('hex'), unique
  shareCount: number;
  replies: { name: string; content: string; createdAt: Date }[];
}
// Indexes: { postId, createdAt }, { userId, postId }
```

### `Order`
```ts
{
  userId?: ObjectId;       // ref: User (optional, supports guest checkout)
  customer: { name, email, phone, address };
  items: {
    productId: ObjectId;
    nameSnapshot: string;  // price/name captured at order time
    priceSnapshot: number;
    qty: number;
    lineTotal: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'delivered';
  payment: {
    provider: 'paystack';
    reference: string;     // unique, sparse index
    status: 'pending' | 'paid' | 'failed';
    paidAt: Date | null;
  };
}
```

### `Category`
```ts
{
  name: string;
  slug: string;            // unique
}
```

---

## Authentication & Authorization

Three middleware functions in `src/middleware/auth.ts`:

### `protect` — Admin guard
- Verifies Bearer JWT
- Looks up `AdminUser` by decoded `id`
- Attaches `req.admin` to the request
- Used on all `/api/admin/*` routes

### `requireAdmin` — Role check
- Checks `req.admin.role === 'admin'`
- Applied after `protect` for admin-only mutations
- Returns `403` if role check fails

### `protectUser` — User guard
- Verifies Bearer JWT
- Checks `decoded.role === 'user'` to prevent admin tokens being used as user tokens
- Looks up `User` by decoded `id` (excludes sensitive fields)
- Attaches `req.user` to the request
- Used on comment submission route

### Token structure
```json
{
  "id": "<mongodb_object_id>",
  "role": "admin" | "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Email Notification System

All emails are sent via the **Brevo HTTP API** (`@getbrevo/brevo`) — avoiding SMTP port restrictions common on cloud hosting.

Email functions in `src/utils/emailService.ts`:

| Function | Trigger | Recipient |
|---|---|---|
| `sendVerificationEmail` | User registration | New user |
| `sendPasswordResetEmail` | Forgot password request | User |
| `sendNewCommentAdminNotification` | New comment submitted | Admin (`ADMIN_EMAIL`) |
| `sendAdminReplyNotification` | Admin replies to comment | Original commenter |

### Email template design
- Branded with HealthPulse violet (`#7c3aed`)
- Responsive inline-CSS HTML
- Clear call-to-action buttons with direct links
- `FRONTEND_URL` env var used for all deep links back to the platform

---

## File Uploads

Image uploads are handled by **Multer** with **Cloudinary** storage (`multer-storage-cloudinary`).

- Configured in `src/middleware/uploadMiddleware.ts`
- Cloudinary credentials set via `CLOUDINARY_NAME`, `CLOUDINARY_APIKEY`, `CLOUDINARY_SECRET`
- Blog cover images: single file upload
- Product images: multi-file upload, validated to max 4 images per product
- Uploaded URLs stored directly in the model as Cloudinary CDN URLs

---

## Security

| Measure | Implementation |
|---|---|
| HTTP security headers | `helmet()` applied globally |
| CORS | `cors()` — configurable origin whitelist |
| Password hashing | `bcryptjs` with salt rounds |
| JWT verification | `jsonwebtoken.verify()` with `JWT_SECRET` |
| Rate limiting | `express-rate-limit` on comment POST (5 req / 15 min / IP) |
| Input sanitization | Content validation and length checks in controllers |
| Duplicate detection | 10-minute window check per user per post |
| Error handling | Global `errorHandler` middleware — no stack traces in production |
| Sensitive field exclusion | `passwordHash`, `verificationCode`, `resetCode` excluded from all query results |

---

## Planned Advanced Features

### API & Performance
- **Redis caching** — cache public blog and product listings with TTL-based invalidation on admin updates
- **Pagination** — cursor-based pagination on `/api/blogs` and `/api/products` for large datasets
- **Full-text search** — MongoDB Atlas Search integration for blog and product search endpoints
- **GraphQL layer** — optional GraphQL API alongside REST for flexible frontend queries
- **API versioning** — `/api/v1/` prefix for backward-compatible evolution

### Authentication & Users
- **OAuth 2.0** — Google and Facebook sign-in via Passport.js
- **Refresh tokens** — short-lived access tokens + long-lived refresh tokens stored in HTTP-only cookies
- **Account lockout** — temporary lock after N failed login attempts
- **Two-factor authentication (2FA)** — TOTP via authenticator apps for admin accounts
- **User profile update** — PATCH endpoint for updating name, phone, location, and profile photo
- **Admin audit log** — record every admin action (create, update, delete) with timestamp and actor

### E-Commerce
- **Discount codes** — promo code model with percentage/fixed discounts and expiry dates
- **Multiple payment gateways** — Flutterwave and Stripe alongside Paystack
- **Inventory webhooks** — auto-notify admin when stock drops below threshold
- **Order confirmation emails** — branded email to customer on successful payment
- **Shipping integration** — third-party shipping rate calculation API
- **Product reviews** — star rating + text review model linked to verified purchasers only
- **Wishlist API** — save/remove products per user

### Content & Blog
- **Scheduled publishing** — set `publishedAt` in the future; cron job publishes at the right time
- **Post revisions** — version history for blog post edits
- **Related posts algorithm** — tag/category overlap scoring for "You may also like"
- **RSS feed** — auto-generated RSS/Atom feed for published posts
- **Sitemap generation** — dynamic XML sitemap for SEO

### Community & Comments
- **Comment reactions** — like/upvote endpoint per comment
- **Nested replies** — user-to-user threaded replies (not just admin replies)
- **Comment reporting** — flag endpoint; flagged comments hidden pending admin review
- **Spam detection** — integration with Akismet or custom ML model for spam filtering
- **WebSockets** — real-time comment updates via Socket.io

### Monitoring & Observability
- **Structured logging** — Winston or Pino with JSON log output and log levels
- **Error tracking** — Sentry SDK for automatic exception capture and alerting
- **Health check endpoint** — `GET /health` returning DB connection status and uptime
- **Request tracing** — correlation IDs on all requests for distributed tracing
- **Performance metrics** — response time tracking and slow query detection

---

## Deployment

The backend is deployed on **Render** (free tier with auto-sleep on inactivity).

### Required Render Environment Variables

| Variable | Description |
|---|---|
| `PORT` | `5000` (Render sets this automatically) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random secret (min 32 chars) |
| `BREVO_API_KEY` | Brevo API key for email sending |
| `SMTP_EMAIL` | Sender email address |
| `ADMIN_EMAIL` | Email address to receive admin notifications |
| `FRONTEND_URL` | `https://men-health-mu.vercel.app` |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_APIKEY` | Cloudinary API key |
| `CLOUDINARY_SECRET` | Cloudinary API secret |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `PAYSTACK_CALLBACK_URL` | Paystack redirect URL after payment |
| `APP_URL` | Backend base URL |

### Build & Start commands (Render settings)

```
Build Command:  npm install && npm run build
Start Command:  npm run start
```

### Manual redeploy after env var changes
After updating environment variables in Render, trigger a manual deploy from the **Deploys** tab to apply the new values.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Follow existing patterns: async/await with `express-async-handler`, typed Mongoose models, and controller/route separation.

---

## License

Private — All rights reserved © 2026 HealthPulse.
