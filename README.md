# 💰 Finance Tracker - Your Personal Financial Dashboard

A modern, full-stack financial management application built with **React**, **Express.js**, and **MongoDB**. Track transactions, analyze spending patterns, and receive AI-powered monthly financial reports.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/cloud/atlas)

## 🌟 Features

### ✨ Core Features
- **🔐 Secure Authentication** - Email/password signup with OTP verification + Google OAuth
- **💳 Transaction Management** - Add, edit, delete income and expense transactions
- **📊 Smart Analytics** - Real-time spending summaries, category breakdowns, and trends
- **🎨 Beautiful Dashboard** - Glassmorphism UI with Tailwind CSS and real-time data updates
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### 🤖 AI-Powered Features
- **🧠 AI Monthly Reports** - Automated intelligent financial analysis delivered to your inbox
- **💡 Smart Recommendations** - Personalized insights on spending patterns and ways to save
- **⚠️ Risk Assessment** - Automatic evaluation of your financial health
- **📈 Spending Insights** - Detailed breakdown of income vs. expenses with savings calculations

### 🔧 Advanced Features
- **🔄 Multi-device Sync** - Access your data from anywhere with real-time synchronization
- **📧 Email Reports** - Beautiful HTML-formatted monthly reports sent automatically
- **⏰ Scheduled Reports** - Automatic report generation on month-end at 9 AM
- **📊 Category Analysis** - Spending breakdown by category with visual representations
- **🔐 Bank-grade Security** - Military-grade encryption with secure session management

---

## 🚀 Live Demo

**Frontend**: [Coming Soon - Deploy to Vercel]  
**Backend API**: [Coming Soon - Deploy to Render]

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Vite** - Fast build tool

### Backend
- **Node.js & Express.js** - Server framework
- **Passport.js** - Authentication (Local + Google OAuth)
- **MongoDB & Mongoose** - Database with schema validation
- **Nodemailer** - Email service
- **node-cron** - Job scheduling for automated reports

### DevOps & Deployment
- **MongoDB Atlas** - Cloud database
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **GitHub** - Version control

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **MongoDB** (local or Atlas account)
- **Gmail account** (for email reports)
- **Google OAuth credentials** (for Google login)

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

# Email (Gmail SMTP)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_specific_password
```

Start backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 🔐 Getting Credentials

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
   - Production URL (when deployed)
6. Copy Client ID and Client Secret

### Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/security)
2. Enable 2-step verification
3. Create an App Password for "Mail"
4. Copy the generated password

### MongoDB Connection
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create database user with `readWriteAnyDatabase` role
4. Get connection string and add to `.env`

---

## 📖 Usage

### Creating Transactions
1. Log in to your dashboard
2. Click **"Add Transaction"**
3. Fill in:
   - **Type**: Income or Expense
   - **Amount**: Enter amount in rupees
   - **Category**: Select or create category
   - **Date**: Pick transaction date
   - **Description**: Optional notes

4. Click **"Add"** to save

### Viewing Analytics
- **Dashboard** shows real-time summary:
  - Total income and expenses
  - Net balance
  - Category-wise breakdown
  - Recent transactions

### Monthly Reports
- Reports are automatically sent on the **28th of each month at 9 AM**
- Or manually request via API:
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

## 📁 Project Structure

```
finance-tracker/
├── backend/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── passport.js     # Authentication strategies
│   ├── models/
│   │   ├── userModel.js    # User & OTP schemas
│   │   └── transactionModel.js  # Transaction schema
│   ├── routes/
│   │   ├── auth.js         # Auth endpoints
│   │   ├── transactionRoutes.js # CRUD operations
│   │   └── reportRoutes.js # Report generation
│   ├── services/
│   │   ├── emailService.js # Email utilities
│   │   ├── reportService.js # Report generation logic
│   │   └── schedulerService.js # Cron scheduling
│   ├── server.js           # Express app
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx     # Landing page
│   │   │   ├── Login.jsx    # Login page
│   │   │   ├── Signup.jsx   # Signup page
│   │   │   ├── VerifyOTP.jsx # OTP verification
│   │   │   ├── LoginOTP.jsx # Login with OTP
│   │   │   └── Dashboard.jsx # Main app dashboard
│   │   ├── services/
│   │   │   └── api.js       # API client
│   │   ├── App.jsx          # Routes configuration
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── DEPLOYMENT_GUIDE.md      # Step-by-step deployment guide
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /auth/signup              # Register new user
POST   /auth/login               # Login with email
POST   /auth/verify-otp          # Verify OTP
POST   /auth/login-otp           # Login with OTP
GET    /auth/google              # Google OAuth redirect
GET    /auth/google/callback     # Google OAuth callback
GET    /auth/logout              # Logout
GET    /auth/user                # Get current user
```

### Transactions
```
GET    /api/transactions         # Get all transactions
POST   /api/transactions         # Create transaction
PUT    /api/transactions/:id     # Update transaction
DELETE /api/transactions/:id     # Delete transaction
GET    /api/transactions/summary # Get monthly summary
GET    /api/transactions/category # Get category breakdown
```

### Reports
```
POST   /api/reports/generate     # Generate report (view only)
POST   /api/reports/send         # Send report via email
GET    /api/reports/custom       # Custom date range report
POST   /api/reports/test-send    # Test report (with delay)
GET    /api/reports/scheduled    # View scheduled jobs
POST   /api/reports/schedule     # Schedule monthly report
POST   /api/reports/unschedule   # Cancel scheduled report
```

---

## 🐛 Troubleshooting

### Issue: "Not authenticated" on login
**Solution**: Check if backend server is running and MongoDB is connected

### Issue: Google OAuth not working
**Solution**: 
- Verify callback URL in Google Cloud Console matches your app
- Check that `SESSION_SECRET` is set in `.env`

### Issue: Emails not sending
**Solution**:
- Verify Gmail app password is correct
- Check that 2-step verification is enabled
- Look for notification in spam folder

### Issue: Transactions not saving
**Solution**:
- Ensure MongoDB is running
- Check backend logs for database errors
- Verify MONGODB_URI is correct

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) - For beautiful styling
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For free cloud database
- [Passport.js](http://www.passportjs.org/) - For authentication
- All open-source contributors

---

## 📊 Stats

- **Total Lines of Code**: 3000+
- **Frontend Components**: 8+
- **API Endpoints**: 15+
- **Database Models**: 3
- **Test Coverage**: In Progress

---

**Made with ❤️ by Sourabh**

⭐ If this project helped you, please give it a star!
