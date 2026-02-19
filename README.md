Men’s Health Backend API

Backend service powering the Men’s Health platform — a system that enables a doctor to publish health content, manage products, and interact with users while clients can register, engage with content, and purchase health products.

This API supports authentication, blog publishing, comments moderation, product management, order processing, and email verification.

🚀 Overview

The Men’s Health Backend provides RESTful APIs for:

User registration & authentication

Email verification

Blog publishing & commenting

Product & order management

Secure payment workflow integration

Media uploads (Cloudinary)

Admin moderation tools

It is designed for real-world production use and scalable growth.

✨ Features
👤 Authentication & User Management

User registration & login

JWT-based authentication

Email verification system

Password hashing with bcrypt

Role-based access (Admin/User)


📝 Blog Management

Create & publish blog posts

Update and delete posts

Comment system

Admin comment approval & moderation

Shareable blog content

🛍 Product Management

Create, update, delete products

Upload product images

Product listing & details

Inventory-ready structure

💬 Comment System

Users can comment on blog posts

Admin approval required before display

Admin reply support

📦 Order Management

Users can place orders

Admin can accept and process orders

Ready for payment gateway integration

☁️ Media Uploads

Image uploads using Multer

Cloud storage via Cloudinary

📧 Email Services

Verification emails

Notifications via Brevo/Nodemailer

🔐 Security

Helmet for HTTP security headers

Rate limiting to prevent abuse

CORS protection

Environment-based configuration


🧰 Tech Stack

Backend

Node.js

Express.js (v5)

TypeScript

Database

MongoDB with Mongoose

Authentication & Security

JSON Web Tokens (JWT)

bcryptjs

express-rate-limit

helmet

File & Media Handling

Multer

Cloudinary

Email & Notifications

Nodemailer

Brevo Email API

Utilities

Axios

Cheerio (for content scraping if needed)

dotenv


src/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── services/
 ├── utils/
 └── server.ts


🔑 API Modules
Auth

Register user

Login

Email verification

JWT authentication

Blogs

Create blog post

Fetch posts

Update & delete posts

Comments

Add comment

Approve comment (admin)

Reply to comment

Products

Add product

Update product

Upload product images

Delete product

Orders

Place order

View orders

Accept/process orders

🔐 Security Considerations

Passwords hashed using bcrypt

JWT authentication protects private routes

Rate limiting prevents brute-force attacks

Helmet secures HTTP headers

Sensitive keys stored in environment variables

🌍 Deployment

You can deploy on:

Render

Railway

DigitalOcean

AWS

Vercel (serverless adaptation required)

Make sure environment variables are configured.

🧪 Future Improvements

Payment gateway integration (Paystack/Stripe)

Order status tracking

Admin dashboard analytics

Notification system (SMS & push)

Role-based permission levels

API documentation with Swagger

Caching & performance optimization

🤝 Contribution

Contributions and suggestions are welcome.

Fork the repo

Create a feature branch

Submit a pull request

📜 License

ISC License

👨‍💻 Author

Gabriel Duah
Full Stack Developer
Passionate about building scalable health-tech solutions.
