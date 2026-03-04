# TOKA — Handmade Accessories Ecommerce 💖

Full-stack ecommerce web application for **TOKA**, an Egyptian handmade accessories brand.

## Tech Stack

| Layer    | Tech                                    |
|----------|---------------------------------------- |
| Frontend | Next.js, React, TailwindCSS             |
| Backend  | Node.js, Express.js, MongoDB, Mongoose  |
| Services | Nodemailer, Telegram Bot, PDFKit, Cloudinary |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- (Optional) Cloudinary account, SMTP credentials, Telegram bot token

### 1. Backend Setup

```bash
cd backend
cp .env.example .env    # Edit .env with your values
npm install
npm run seed            # Seed initial data
npm run dev             # Start on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev             # Start on http://localhost:3000
```

### 3. Admin Access

Navigate to `http://localhost:3000/admin/login`

Default credentials (from `.env`):
- Username: `admin`
- Password: `admin123`

## Project Structure

```
backend/
  src/
    config/       — DB, Cloudinary, Mailer, Telegram
    models/       — Product, Category, Order, Page
    controllers/  — Business logic
    routes/       — API endpoints
    middlewares/  — Auth, error handling
    services/     — Email, Telegram, PDF
    seed.js       — Database seeder
    server.js     — Entry point

frontend/
  pages/          — Next.js page routes
  components/     — Reusable UI components
  context/        — Cart & Language providers
  lib/            — API client
  styles/         — Global CSS
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/categories | List categories |
| GET  | /api/products | List products (paginated) |
| GET  | /api/products/:id | Product detail |
| GET  | /api/products/best-sellers | Best sellers |
| POST | /api/orders | Create order |
| GET  | /api/pages/:slug | Get page |
| POST | /api/admin/login | Admin login |
| GET  | /api/admin/dashboard | Dashboard stats |
| CRUD | /api/admin/products | Manage products |
| CRUD | /api/admin/categories | Manage categories |
| GET  | /api/admin/orders | List orders |
| PATCH | /api/admin/orders/:id/status | Update status |
| PUT  | /api/admin/pages/:slug | Update page |
| POST | /api/admin/reports/daily | Send daily report |

## Features

- 🛒 **Shopping Cart** — localStorage-based, no login needed
- 🌐 **Bilingual** — Arabic (RTL) & English with toggle
- 📱 **Mobile-first** responsive design
- 💖 **Cute feminine** pastel pink/lavender theme
- 📦 **Admin Dashboard** — products, categories, orders, pages management
- 📊 **Daily Reports** — PDF generation sent to Telegram
- 📩 **Notifications** — Email + Telegram on new orders
- 🚨 **Low Stock Alerts** — Telegram notification when stock ≤ 3
- 💬 **WhatsApp Order** — Pre-filled message button on product pages
- ⭐ **Best Sellers** — Auto-calculated from order data

---

Made with 💖 for TOKA
