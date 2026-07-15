# Wedding Junction - Client Setup Guide

A comprehensive guide to set up and run the Wedding Junction project locally on Windows.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [Quick Start (TL;DR)](#3-quick-start-tldr)
4. [Detailed Installation Steps](#4-detailed-installation-steps)
5. [Environment Configuration](#5-environment-configuration)
6. [Third-Party Services Setup](#6-third-party-services-setup)
7. [Database Setup](#7-database-setup)
8. [Running the Application](#8-running-the-application)
9. [Default Login Credentials](#9-default-login-credentials)
10. [Available Scripts Reference](#10-available-scripts-reference)
11. [API Endpoints Quick Reference](#11-api-endpoints-quick-reference)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Project Overview

**Wedding Junction** is a full-stack wedding vendor marketplace platform that connects couples with wedding service providers.

### Key Features

- **Vendor Discovery** - Browse vendors by category (Venues, Catering, Photography, Makeup, Decor)
- **Booking System** - Book vendor services with date selection and confirmation workflow
- **Real-Time Chat** - Live messaging between users and vendors via Socket.IO
- **Reviews & Ratings** - Rate and review vendors after events
- **Admin Panel** - Manage vendors, users, and applications
- **Vendor Dashboard** - Vendors can manage their profiles, bookings, and conversations

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, React Router 7, Tailwind CSS, Socket.IO Client |
| **Backend** | Node.js, Express 5, Socket.IO, JWT Authentication |
| **Database** | MongoDB with Mongoose ODM |
| **Image Storage** | Cloudinary |
| **Testing** | Jest, Playwright (E2E) |

---

## 2. Prerequisites

Install the following before proceeding:

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| **Node.js** | v18 or higher | https://nodejs.org/en/download/ |
| **MongoDB Community Server** | v6+ | https://www.mongodb.com/try/download/community |
| **Git** (optional) | Latest | https://git-scm.com/downloads |

### Required Accounts

| Service | Purpose | Sign Up |
|---------|---------|---------|
| **Cloudinary** | Image uploads (free tier) | https://cloudinary.com/users/register_free |

### Recommended

- **VS Code** - Code editor: https://code.visualstudio.com/
- **MongoDB Compass** - GUI for MongoDB: https://www.mongodb.com/try/download/compass

### Verify Installation

Open a terminal and run:

```bash
node --version
# Should show v18.x.x or higher

npm --version
# Should show 9.x.x or higher
```

---

## 3. Quick Start (TL;DR)

For experienced developers who want to get running quickly:

```bash
# 1. Install frontend dependencies (from project root)
npm install

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment
copy .env.example .env
# Edit .env file with your values (see Section 5)

# 4. Start MongoDB (in a separate terminal)
mongod

# 5. Seed the database
npm run seed

# 6. Start backend server (stay in backend folder)
npm run dev

# 7. Start frontend (new terminal, from project root)
cd ..
npm start
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 4. Detailed Installation Steps

### Step 1: Extract Project Files

1. Extract the project ZIP file to your desired location
2. Note the full path (e.g., `C:\Users\YourName\wedding-junction`)

### Step 2: Install Frontend Dependencies

Open a terminal in the project root folder:

```bash
npm install
```

This installs React, Tailwind CSS, and other frontend dependencies.

### Step 3: Install Backend Dependencies

Navigate to the backend folder and install:

```bash
cd backend
npm install
```

This installs Express, Mongoose, Socket.IO, and other backend dependencies.

### Step 4: Configure Environment Variables

See the next section for detailed instructions.

---

## 5. Environment Configuration

### Backend Environment File

Create a `.env` file in the `backend` folder. You can copy from the example:

```bash
cd backend
copy .env.example .env
```

Then edit the `.env` file with your values:

```env
# ===========================================
# DATABASE (Required)
# ===========================================
MONGO_URI=mongodb://127.0.0.1:27017/weddingApp

# ===========================================
# SERVER (Required)
# ===========================================
PORT=5000
JWT_SECRET=your_secret_key_at_least_32_characters_long
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# ===========================================
# CLOUDINARY (Required for image uploads)
# ===========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===========================================
# ADMIN CREDENTIALS (for seeding)
# ===========================================
ADMIN_EMAIL=admin@weddingjunction.com
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_NAME=Admin

# ===========================================
# EMAIL SERVICE (Optional)
# ===========================================
# Uncomment and configure if you need password reset emails
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

#### Generating a Secure JWT Secret

Run this command to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET` value.

### Frontend Environment File

The frontend `.env` file should already exist with the correct value:

**File:** `frontend/.env` (or project root `.env`)

```env
REACT_APP_API_URL=http://localhost:5000
```

If it doesn't exist, create it in the project root folder.

---

## 6. Third-Party Services Setup

### Cloudinary (Image Storage) - Required

Cloudinary handles all image uploads for vendor profiles and chat.

#### Step-by-Step Setup:

1. **Create Account**
   - Go to https://cloudinary.com/users/register_free
   - Sign up with email or Google account
   - Verify your email

2. **Get Credentials**
   - After login, go to the **Dashboard**
   - Your credentials are displayed in the "Account Details" section:
     - **Cloud Name** - Copy to `CLOUDINARY_CLOUD_NAME`
     - **API Key** - Copy to `CLOUDINARY_API_KEY`
     - **API Secret** - Click "Reveal" and copy to `CLOUDINARY_API_SECRET`

3. **Free Tier Limits**
   - 25 credits/month (plenty for development)
   - 25GB storage
   - 25GB bandwidth

### Email Service (Optional)

Email is only needed for the password reset feature. In development mode, reset links are printed to the console.

#### Option 1: Gmail SMTP

1. Enable 2-Step Verification in your Google Account
2. Go to Google Account > Security > App Passwords
3. Generate a new app password for "Mail"
4. Use these settings:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

#### Option 2: Mailtrap (Recommended for Testing)

Mailtrap is an email testing service that captures emails in a safe sandbox environment - perfect for development.

**Step-by-Step Setup:**

1. **Create Account**
   - Go to https://mailtrap.io
   - Sign up with email or Google account (free tier available)
   - Verify your email if required

2. **Navigate to Email Testing**
   - From the dashboard, click on **"Email Testing"** in the left sidebar

3. **Select or Create an Inbox**
   - Choose an existing inbox or click **"Add Inbox"** to create a new one
   - Click on the inbox name to open it

4. **Access SMTP Credentials**
   - Click on **"Show Credentials"** or go to the **"SMTP Settings"** tab
   - You can also find this under **"Integrations"**

5. **Copy the Credentials**
   - You'll see credentials displayed like:
     - **Host:** `sandbox.smtp.mailtrap.io`
     - **Port:** `2525` (or 25, 465, 587)
     - **Username:** alphanumeric string
     - **Password:** alphanumeric string

6. **Update Your `.env` File**

```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
```

**Quick Integration Tip:** Mailtrap provides ready-to-use code snippets. In the inbox settings, select your framework (Node.js, etc.) from the **"Integrations"** dropdown to get pre-configured code.

**Free Tier Limits:**
- 100 emails/month
- 1 inbox
- Email previews and analysis

#### Option 3: SendGrid

1. Sign up at https://sendgrid.com
2. Create an API key with "Mail Send" permissions
3. Use these settings:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

---

## 7. Database Setup

### Starting MongoDB on Windows

**Option A: MongoDB as a Windows Service (Recommended)**

If you installed MongoDB with the default settings, it runs as a Windows service automatically.

Check if it's running:
```bash
# Open Services (Win + R, type services.msc)
# Look for "MongoDB Server" - should be "Running"
```

**Option B: Start Manually**

If MongoDB isn't running as a service:

```bash
# Open a terminal and run:
mongod

# Keep this terminal open while using the application
```

**Option C: Using MongoDB Compass**

1. Open MongoDB Compass
2. Connect to `mongodb://127.0.0.1:27017`
3. If it connects, MongoDB is running

### Running the Seed Script

The seed script populates the database with:
- Admin user account
- 5 service categories
- 4 platform services
- 54+ vendor profiles with details
- Vendor user accounts

From the `backend` folder, run:

```bash
npm run seed
```

**Expected Output:**

```
Connected to MongoDB
Cleared existing data
Admin user created: admin@weddingjunction.com
Inserted 5 categories
Inserted 4 services
Created 54 vendor users
Inserted 54 vendors

========================================
Database seeded successfully!
========================================
Categories: 5
Services: 4
Vendors: 54
========================================
```

---

## 8. Running the Application

You need **two terminal windows** - one for the backend and one for the frontend.

### Terminal 1: Start the Backend

```bash
cd backend
npm run dev
```

**Expected Output:**

```
Server running on port 5000
MongoDB Connected: 127.0.0.1
Socket.IO initialized
```

The backend runs on: **http://localhost:5000**

### Terminal 2: Start the Frontend

```bash
# From project root (not backend folder)
npm start
```

**Expected Output:**

```
Compiled successfully!

You can now view wedding-junction in the browser.

  Local:            http://localhost:3000
```

The frontend runs on: **http://localhost:3000**

### Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Main application |
| http://localhost:3000/admin | Admin dashboard |
| http://localhost:5000/api | Backend API |

---

## 9. Default Login Credentials

### Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@weddingjunction.com` (or your `ADMIN_EMAIL`) |
| Password | Your configured `ADMIN_PASSWORD` |

### Sample Vendor Accounts

The seed script creates vendor accounts with this pattern:

| Email | Password |
|-------|----------|
| `vendor1@weddingjunction.com` | `vendor123` |
| `vendor2@weddingjunction.com` | `vendor123` |
| ... | ... |
| `vendor54@weddingjunction.com` | `vendor123` |

### Creating Test User Accounts

You can create new user accounts through the signup page at http://localhost:3000/signup

---

## 10. Available Scripts Reference

### Backend Scripts (run from `backend` folder)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (nodemon) |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample data |

### Frontend Scripts (run from project root)

| Command | Description |
|---------|-------------|
| `npm start` | Start React development server |
| `npm run build` | Create production build |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:headed` | Run E2E tests with browser visible |
| `npm run test:e2e:ui` | Open Playwright UI mode |

---

## 11. API Endpoints Quick Reference

Base URL: `http://localhost:5000/api`

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password/:token` | Reset password with token |
| GET | `/me` | Get current user profile |
| PUT | `/profile` | Update profile |
| PUT | `/change-password` | Change password |
| DELETE | `/account` | Delete account |
| POST | `/apply-vendor` | Apply to become vendor |
| GET | `/application-status` | Check vendor application status |

### Vendors (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vendors` | List all vendors |
| GET | `/vendors/featured` | Get featured vendors |
| GET | `/vendors/category/:name` | Get vendors by category |
| GET | `/vendors/:id` | Get vendor details |

### Bookings (`/api`) - Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create new booking |
| GET | `/bookings` | Get user's bookings |
| GET | `/bookings/:id` | Get booking details |
| PUT | `/bookings/:id` | Confirm/update booking |
| DELETE | `/bookings/:id` | Cancel booking |

### Chat (`/api/chat`) - Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/start` | Start conversation with vendor |
| GET | `/conversations` | Get all conversations |
| GET | `/:id` | Get conversation messages |
| POST | `/:id/messages` | Send message |
| POST | `/:id/image` | Send image message |
| PATCH | `/:id/price` | Update quoted price |
| POST | `/:id/booking` | Create booking from chat |
| PATCH | `/:id/read` | Mark messages as read |
| PATCH | `/:id/close` | Close conversation |
| DELETE | `/:id` | Delete conversation |

### Categories & Services (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| GET | `/categories/:id` | Get category details |
| GET | `/services` | List all services |

---

## 12. Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**

1. **Check if MongoDB is running:**
   ```bash
   # Try connecting with MongoDB Compass
   # Or check Windows Services for "MongoDB Server"
   ```

2. **Start MongoDB manually:**
   ```bash
   mongod
   ```

3. **Check the data directory exists:**
   ```bash
   # Default: C:\data\db
   # Create if missing:
   mkdir C:\data\db
   ```

4. **Use MongoDB Atlas (cloud) instead:**
   - Create free cluster at https://cloud.mongodb.com
   - Update `MONGO_URI` in `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/weddingApp
   ```

---

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**

1. **Find and kill the process:**
   ```bash
   # Find process using port 5000
   netstat -ano | findstr :5000

   # Kill process (replace PID with the number from above)
   taskkill /PID <PID> /F
   ```

2. **Use a different port:**
   - Change `PORT` in `backend/.env`
   - Update `REACT_APP_API_URL` in frontend `.env`

---

### Missing Environment Variables

**Error:** `Error: Missing required environment variable: CLOUDINARY_CLOUD_NAME`

**Solution:**

1. Ensure `.env` file exists in `backend` folder
2. Check all required variables are set
3. Restart the backend server after changes

---

### Module Not Found Errors

**Error:** `Error: Cannot find module 'express'`

**Solution:**

```bash
# In backend folder
cd backend
rm -rf node_modules
npm install

# In frontend (project root)
cd ..
rm -rf node_modules
npm install
```

On Windows, to remove folders:
```bash
rmdir /s /q node_modules
```

---

### CORS Errors in Browser

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**

1. **Verify frontend URL in backend `.env`:**
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

2. **Ensure both servers are running on correct ports**

3. **Clear browser cache and try incognito mode**

---

### Images Not Uploading

**Error:** `Cloudinary upload failed` or images don't appear

**Solutions:**

1. **Verify Cloudinary credentials in `.env`**

2. **Check Cloudinary dashboard for errors**

3. **Ensure file size is under 10MB**

4. **Supported formats:** JPG, PNG, GIF, WEBP

---

### Socket.IO Connection Issues

**Symptoms:** Chat messages not appearing in real-time

**Solutions:**

1. **Check browser console for WebSocket errors**

2. **Ensure backend is running on port 5000**

3. **Verify `REACT_APP_API_URL` is correct**

4. **Try hard refresh:** `Ctrl + Shift + R`

---

### Login/Authentication Issues

**Error:** `Invalid credentials` even with correct password

**Solutions:**

1. **Re-run the seed script:**
   ```bash
   cd backend
   npm run seed
   ```

2. **Check the admin credentials in `.env` match what you're using**

3. **Clear browser localStorage:**
   - Open DevTools (F12)
   - Go to Application > Local Storage
   - Clear all entries

---

## Need More Help?

1. Check the browser console (F12) for detailed error messages
2. Check the backend terminal for server-side errors
3. Ensure all environment variables are correctly set
4. Restart both frontend and backend servers

---

**Happy Wedding Planning!**
