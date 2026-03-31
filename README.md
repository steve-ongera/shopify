# Shopify - Modern E-commerce Platform

[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-purple.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-featured, Shopify-like e-commerce platform built with Django REST Framework (backend) and React (frontend). This platform provides a complete online shopping experience with product management, shopping cart, order processing, payment integration, and admin dashboard.

## ✨ Features

### 🛍️ Customer Features
- **User Authentication**: Register, login, password reset
- **Product Browsing**: Advanced search, filtering by category, price, and ratings
- **Shopping Cart**: Add/remove items, update quantities, save for later
- **Wishlist**: Save favorite products
- **Product Reviews**: Rate and review products with images
- **Order Tracking**: Real-time order status updates
- **Multiple Payment Methods**: M-Pesa, Credit Card, Cash on Delivery
- **Pickup Stations**: Choose from multiple pickup locations across Kenya
- **Order History**: View past orders and reorder items
- **Email Notifications**: Order confirmations, shipping updates

### 👨‍💼 Admin Features
- **Dashboard**: Sales analytics, revenue charts, order statistics
- **Product Management**: Add/edit/delete products, manage inventory
- **Category Management**: Organize products with nested categories
- **Order Management**: Process orders, update status, print invoices
- **User Management**: View and manage customers
- **Discount Management**: Create promo codes and special offers
- **Inventory Alerts**: Low stock notifications
- **Analytics Reports**: Sales reports, popular products, customer insights

### 🚀 Technical Features
- **RESTful API**: Fully documented API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Real-time Updates**: WebSocket integration for live notifications
- **Caching**: Redis caching for improved performance
- **File Uploads**: Cloudinary/AWS S3 integration for image storage
- **SEO Optimized**: Meta tags, sitemaps, structured data
- **Payment Integration**: M-Pesa STK Push, PayPal, Stripe
- **Email Service**: SendGrid/SMTP integration

## 🏗️ Tech Stack

### Backend
- **Framework**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL (primary), SQLite (development)
- **Cache**: Redis
- **Task Queue**: Celery
- **Payment**: M-Pesa API, Stripe, PayPal
- **Storage**: Cloudinary / AWS S3
- **Search**: Elasticsearch / PostgreSQL Full-text search
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Charts**: Recharts
- **Notifications**: React Toastify

## 📋 Prerequisites

- Python 3.10+
- Node.js 16+
- PostgreSQL 14+ (optional, SQLite for development)
- Redis (optional, for caching)
- Git

## 🚀 Quick Start

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/shopease.git
cd shopease
```

2. **Create and activate a virtual environment**
```bash
python -m venv venv

# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

3. **Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your settings:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (leave blank to use SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/shopease_db

# Redis
REDIS_URL=redis://localhost:6379/0

# M-Pesa
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback/

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

5. **Run database migrations**
```bash
python manage.py migrate
```

6. **Create a superuser**
```bash
python manage.py createsuperuser
```

7. **Load sample data (optional)**
```bash
python manage.py loaddata fixtures/sample_data.json
```

8. **Start the development server**
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api/`.

---

### Frontend Setup

1. **Navigate to the frontend directory**
```bash
cd ../frontend
```

2. **Install Node dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

4. **Start the development server**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
shopease/
├── backend/
│   ├── config/                  # Django project settings
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/            # User authentication & profiles
│   │   ├── products/            # Product listings & categories
│   │   ├── cart/                # Shopping cart logic
│   │   ├── orders/              # Order processing
│   │   ├── payments/            # M-Pesa, Stripe, PayPal
│   │   ├── reviews/             # Product reviews & ratings
│   │   ├── wishlist/            # Customer wishlists
│   │   ├── notifications/       # Email & push notifications
│   │   └── analytics/           # Sales & traffic reports
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level page components
│   │   ├── features/            # Redux slices & async thunks
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # Axios API service layer
│   │   ├── utils/               # Helper functions
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

---

## 🔌 API Documentation

Once the backend server is running, interactive API docs are available at:

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register/` | Register a new user |
| `POST` | `/api/auth/login/` | Login and receive JWT tokens |
| `POST` | `/api/auth/token/refresh/` | Refresh access token |
| `GET` | `/api/products/` | List all products |
| `GET` | `/api/products/{id}/` | Get product details |
| `GET` | `/api/categories/` | List product categories |
| `GET/POST` | `/api/cart/` | View or update shopping cart |
| `POST` | `/api/orders/` | Place a new order |
| `GET` | `/api/orders/{id}/` | Get order details |
| `POST` | `/api/payments/mpesa/initiate/` | Initiate M-Pesa STK Push |
| `POST` | `/api/payments/stripe/charge/` | Charge via Stripe |
| `GET` | `/api/wishlist/` | Get user wishlist |
| `POST` | `/api/reviews/` | Submit a product review |

---

## 💳 Payment Integration

### M-Pesa (Safaricom STK Push)
This platform supports M-Pesa Lipa Na M-Pesa Online for Kenyan customers. When a customer selects M-Pesa at checkout, an STK Push prompt is sent to their phone. Ensure your Daraja API credentials are correctly set in `.env`.

### Stripe
Credit and debit card payments are handled via Stripe. Test cards are available in the [Stripe testing docs](https://stripe.com/docs/testing).

### Cash on Delivery
Available for supported pickup station locations.

---

## 🐳 Docker Setup

Run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

This starts:
- Django backend on port `8000`
- React frontend on port `3000`
- PostgreSQL on port `5432`
- Redis on port `6379`

To stop all services:
```bash
docker-compose down
```

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
python manage.py test
```

With coverage:
```bash
pip install coverage
coverage run manage.py test
coverage report
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🚢 Deployment

### Environment
Set `DEBUG=False` and update `ALLOWED_HOSTS` in your production `.env`. Use the production settings module:

```bash
export DJANGO_SETTINGS_MODULE=config.settings.production
```

### Static Files
```bash
python manage.py collectstatic --noinput
```

### Gunicorn + Nginx (Recommended)
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

A sample `nginx.conf` is included in the `deploy/` directory.

### Celery Workers (for background tasks)
```bash
celery -A config worker --loglevel=info
celery -A config beat --loglevel=info
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your code passes all tests and follows the existing code style before submitting.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Django REST Framework](https://www.django-rest-framework.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Safaricom Daraja API](https://developer.safaricom.co.ke/)
- [Stripe](https://stripe.com/)
- [Headless UI](https://headlessui.com/)