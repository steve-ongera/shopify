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