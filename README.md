# 💰 Finance Tracker - Your Personal Financial Dashboard

A modern, full-stack financial management application built with **React**, **Express.js**, and **MongoDB**. Track transactions, analyze spending patterns, and receive AI-powered monthly financial reports.

---

## 🌟 Features

### ✨ Core Features

* **🔐 Secure Authentication** - Email/password signup with OTP verification + Google OAuth
* **💳 Transaction Management** - Add, edit, delete income and expense transactions
* **📊 Smart Analytics** - Real-time spending summaries, category breakdowns, and trends
* **🎨 Beautiful Dashboard** - Glassmorphism UI with Tailwind CSS and real-time data updates
* **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### 🤖 AI-Powered Features

* **🧠 AI Monthly Reports** - Automated intelligent financial analysis delivered to your inbox
* **💡 Smart Recommendations** - Personalized insights on spending patterns and ways to save
* **⚠️ Risk Assessment** - Automatic evaluation of your financial health
* **📈 Spending Insights** - Detailed breakdown of income vs. expenses with savings calculations

### 🔧 Advanced Features

* **🔄 Multi-device Sync** - Access your data from anywhere with real-time synchronization
* **📧 Email Reports via Resend** - Beautiful HTML-formatted monthly reports sent automatically
* **⏰ Scheduled Reports** - Automatic report generation on month-end at 9 AM
* **📊 Category Analysis** - Spending breakdown by category with visual representations
* **🔐 Bank-grade Security** - Military-grade encryption with secure session management

---

## 🚀 Live Demo

**Frontend**: [Link](https://finance-tracker-vercel-frontend.vercel.app)

**Backend API**: [Link](https://finance-tracker-render-backend.onrender.com/api/auth/google/callback)

---

## 🛠️ Tech Stack

### Frontend

* **React 18** - UI library
* **React Router** - Client-side routing
* **Tailwind CSS** - Utility-first CSS framework
* **Axios** - HTTP client
* **Vite** - Fast build tool

### Backend

* **Node.js & Express.js** - Server framework
* **Passport.js** - Authentication (Local + Google OAuth)
* **MongoDB & Mongoose** - Database with schema validation
* **Resend** - Email service for sending reports and notifications
* **node-cron** - Job scheduling for automated reports

### DevOps & Deployment

* **MongoDB Atlas** - Cloud database
* **Render** - Backend hosting
* **Vercel** - Frontend hosting
* **GitHub** - Version control

---

## 📋 Prerequisites

Before you begin, ensure you have:

* **Node.js** v16 or higher
* **npm** or **yarn** package manager
* **MongoDB** (local or Atlas account)
* **Resend account** (for email reports)
* **Google OAuth credentials** (for Google login)

---

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/finance-tracker.git
cd finance-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/finance_tracker

# Server
PORT=5000
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Session
SESSION_SECRET=your_random_session_secret_key_here

# Resend Email Service
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=your_verified_email@domain.com
```

Start backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

Start frontend development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔐 Getting Credentials

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:

   * `http://localhost:5000/auth/google/callback`
   * Production URL (when deployed)
6. Copy Client ID and Client Secret

### Resend Email Setup

1. Sign up at [Resend](https://resend.com)
2. Generate an API key
3. Verify your sender email
4. Add the API key and sender email to `.env`

### MongoDB Connection

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create database user with `readWriteAnyDatabase` role
4. Get connection string and add to `.env`

---

## 📖 Usage

### Creating Transactions

1. Log in to your dashboard
2. Click **"Add Transaction"**
3. Fill in:

   * **Type**: Income or Expense
   * **Amount**: Enter amount in rupees
   * **Category**: Select or create category
   * **Date**: Pick transaction date
   * **Description**: Optional notes
4. Click **"Add"** to save

### Viewing Analytics

* Dashboard shows real-time summary:

  * Total income and expenses
  * Net balance
  * Category-wise breakdown
  * Recent transactions

### Monthly Reports

* Reports are automatically sent on the **28th of each month at 9 AM**
* Or manually request via API:

```bash
curl -X POST http://localhost:5000/api/reports/test-send?delayMinutes=1 \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🚀 Deployment

### Deploy to Production (Free)

Complete deployment guide available in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Quick Summary:**

1. **Database**: MongoDB Atlas (Free)
2. **Backend**: Render (Free)
3. **Frontend**: Vercel (Free)

**Estimated Setup Time**: 30 minutes

---

**Made with ❤️ by Sourabh**

⭐ If this project helped you, please give it a star!
