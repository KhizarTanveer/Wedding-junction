# Wedding Junction - Setup Guide

A step-by-step guide to set up and run the Wedding Junction platform on your local machine.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (TL;DR)](#quick-start-tldr)
3. [Detailed Setup Steps](#detailed-setup-steps)
4. [Environment Variables Reference](#environment-variables-reference)
5. [Running the Application](#running-the-application)
6. [Building for Production](#building-for-production)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)
8. [Project Structure Reference](#project-structure-reference)
9. [API Endpoints Reference](#api-endpoints-reference)

---

## Prerequisites

Before you begin, make sure you have these installed on your computer:

### 1. Node.js (Required)

**What is it?** A program that runs the application code.

**Version needed:** v18 or higher

**How to check if installed:**
```bash
node --version
```

**How to install:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the "LTS" (Long Term Support) version
3. Run the installer and follow the prompts
4. Restart your terminal/command prompt

### 2. MongoDB (Required)

**What is it?** The database that stores all the application data.

**Two options:**

**Option A - Local Installation (Recommended for development):**
1. Go to [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server
3. Run the installer
4. Choose "Complete" installation
5. Check "Install MongoDB as a Service" (important!)

**Option B - MongoDB Atlas (Cloud database):**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a free cluster
4. Get your connection string

### 3. Code Editor (Optional but Recommended)

**Recommendation:** [Visual Studio Code](https://code.visualstudio.com/) - free and easy to use

### 4. Cloudinary Account (Required for image uploads)

1. Go to [cloudinary.com](https://cloudinary.com/)
2. Sign up for a free account
3. From your dashboard, note down:
   - Cloud Name
   - API Key
   - API Secret

---

## Quick Start (TL;DR)

For experienced developers, here's the quick version:

```bash
# 1. Navigate to project folder
cd wedding-junction

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install

# 4. Create backend/.env file (copy from .env.example)
cp .env.example .env
# Edit .env with your values

# 5. Create frontend/.env file
cd ..
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# 6. Seed the database
cd backend
npm run seed

# 7. Start backend (Terminal 1)
npm run dev

# 8. Start frontend (Terminal 2)
cd ..
npm start
```

Access at: `http://localhost:3000`

---

## Detailed Setup Steps

### Step 1: Download/Clone the Project

If you haven't already, get the project files onto your computer.

**Option A - If you have Git installed:**
```bash
git clone <repository-url>
cd wedding-junction
```

**Option B - If you downloaded a ZIP file:**
1. Extract the ZIP file
2. Open a terminal/command prompt
3. Navigate to the extracted folder:
```bash
cd path/to/wedding-junction
```

### Step 2: Navigate to the Project Folder

Make sure you're in the correct directory. The project structure should look like:

```
wedding-junction/
├── backend/
├── frontend/ (or src/)
├── package.json
└── README.md
```

### Step 3: Install Frontend Dependencies

In your terminal, run:

```bash
npm install
```

**What this does:** Downloads all the required packages for the frontend.

**Expected output:** You'll see a progress bar and eventually "added X packages".

**Note:** This may take 2-5 minutes depending on your internet speed.

### Step 4: Install Backend Dependencies

Navigate to the backend folder and install its packages:

```bash
cd backend
npm install
```

**What this does:** Downloads all the required packages for the backend server.

### Step 5: Configure Environment Variables

Environment variables are settings that the application needs to run. You need to create two configuration files.

#### 5a. Backend Environment File

1. Stay in the `backend` folder
2. Find the file named `.env.example`
3. Create a copy named `.env`:

**Windows (Command Prompt):**
```bash
copy .env.example .env
```

**Windows (PowerShell) / Mac / Linux:**
```bash
cp .env.example .env
```

4. Open `.env` in a text editor and fill in your values:

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/weddingApp

# Server
PORT=5000
JWT_SECRET=create_a_long_random_string_at_least_32_characters
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name_from_cloudinary
CLOUDINARY_API_KEY=your_api_key_from_cloudinary
CLOUDINARY_API_SECRET=your_api_secret_from_cloudinary

# Admin Account (for initial setup)
ADMIN_EMAIL=admin@weddingjunction.com
ADMIN_PASSWORD=Create_A_Strong_Password_123!
ADMIN_NAME=Admin
```

**Important notes:**
- `JWT_SECRET`: Make this a long, random string (at least 32 characters)
- `CLOUDINARY_*`: Get these from your Cloudinary dashboard
- `ADMIN_PASSWORD`: Use a strong password

#### 5b. Frontend Environment File

1. Navigate back to the main project folder:
```bash
cd ..
```

2. Create a `.env` file in the root folder:

**Windows (Command Prompt):**
```bash
echo REACT_APP_API_URL=http://localhost:5000 > .env
```

**Or manually create a `.env` file with:**
```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 6: Start MongoDB

Make sure MongoDB is running before starting the application.

**If installed as a Windows Service (recommended):**
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

**If running manually:**
```bash
mongod
```

**How to verify MongoDB is running:**
```bash
mongosh
```
If you see a MongoDB shell prompt (`>` or `test>`), it's working. Type `exit` to close.

### Step 7: Seed the Database

This populates the database with initial data (categories, sample vendors, services).

```bash
cd backend
npm run seed
```

**Expected output:**
```
Connected to MongoDB
Cleared existing data
Inserted 5 categories
Inserted 4 services
Inserted 54 vendors
========================================
Admin user created:
Email: admin@weddingjunction.com
Password: [your configured password]
========================================
Database seeded successfully!
========================================
```

### Step 8: Start the Servers

You need to run **two separate terminals** - one for the backend and one for the frontend.

#### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 5000
Connected to MongoDB
```

Keep this terminal running!

#### Terminal 2 - Frontend Development Server

Open a new terminal window, navigate to the project folder:

```bash
cd path/to/wedding-junction
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view wedding-junction in the browser.

  Local:            http://localhost:3000
```

A browser window should automatically open to `http://localhost:3000`.

---

## Environment Variables Reference

### Backend Variables (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb://127.0.0.1:27017/weddingApp` |
| `PORT` | Yes | Port for the backend server | `5000` |
| `JWT_SECRET` | Yes | Secret key for authentication tokens | Long random string (32+ chars) |
| `FRONTEND_URL` | Yes | URL of the frontend | `http://localhost:3000` |
| `NODE_ENV` | Yes | Environment mode | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | Your Cloudinary API secret |
| `ADMIN_EMAIL` | No | Admin account email | `admin@weddingjunction.com` |
| `ADMIN_PASSWORD` | No | Admin account password | Strong password |
| `ADMIN_NAME` | No | Admin account name | `Admin` |
| `EMAIL_HOST` | No | SMTP server for emails | `smtp.gmail.com` |
| `EMAIL_PORT` | No | SMTP port | `587` |
| `EMAIL_USER` | No | SMTP username | Your email address |
| `EMAIL_PASS` | No | SMTP password | App password or API key |

### Frontend Variables (`.env` in root)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REACT_APP_API_URL` | Yes | Backend API URL | `http://localhost:5000` |

---

## Running the Application

### Development Mode

**Backend (auto-restarts on changes):**
```bash
cd backend
npm run dev
```

**Frontend (hot reloading enabled):**
```bash
npm start
```

### Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main website |
| Backend API | http://localhost:5000 | API server |
| API Health Check | http://localhost:5000/ | Verify backend is running |

### Default Login Credentials

After seeding, you can log in with:

**Admin Account:**
- Email: `admin@weddingjunction.com` (or your configured email)
- Password: Your configured `ADMIN_PASSWORD`

---

## Building for Production

### Build the Frontend

```bash
npm run build
```

This creates an optimized `build` folder with static files ready for deployment.

### Production Backend

```bash
cd backend
npm start
```

### Production Considerations

1. **Set `NODE_ENV=production`** in backend `.env`
2. **Use a production MongoDB** (MongoDB Atlas recommended)
3. **Use HTTPS** for secure connections
4. **Set a strong `JWT_SECRET`** (use `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` to generate)
5. **Configure Cloudinary** for production image storage
6. **Set up email service** for password resets

---

## Troubleshooting Common Issues

### MongoDB Connection Issues

**Problem:** `MongoNetworkError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # Windows
   net start MongoDB

   # Or check status
   sc query MongoDB
   ```

2. Verify MongoDB is listening on the correct port:
   ```bash
   mongosh
   ```

3. Check your `MONGO_URI` in `.env` is correct

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**

**Windows:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with the process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Environment Variable Errors

**Problem:** `Error: Missing required environment variable`

**Solutions:**
1. Make sure you created the `.env` file
2. Check that all required variables are filled in
3. No spaces around the `=` sign
4. Restart the server after changing `.env`

### "Module not found" Errors

**Problem:** `Error: Cannot find module 'xxx'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Frontend Not Loading

**Problem:** Blank page or errors in browser

**Solutions:**
1. Check browser console (F12 → Console tab) for errors
2. Verify backend is running
3. Check `REACT_APP_API_URL` matches your backend URL
4. Clear browser cache and refresh

### Seed Command Fails

**Problem:** `npm run seed` shows errors

**Solutions:**
1. Make sure MongoDB is running
2. Check `MONGO_URI` is correct
3. Run seed again (it clears existing data first)

---

## Project Structure Reference

```
wedding-junction/
│
├── backend/                    # Backend server (Node.js + Express)
│   ├── config/                 # Database configuration
│   │   └── db.js              # MongoDB connection setup
│   ├── controllers/            # Request handlers (business logic)
│   │   ├── authController.js   # Login, signup, password reset
│   │   ├── bookingController.js
│   │   ├── categoryController.js
│   │   ├── vendorController.js
│   │   └── ...
│   ├── middlewares/            # Request processing middleware
│   │   ├── authMiddleware.js   # Authentication checks
│   │   └── security.js         # Security features
│   ├── models/                 # Database schemas
│   │   ├── User.js            # User accounts
│   │   ├── Vendor.js          # Vendor profiles
│   │   ├── Booking.js         # Bookings
│   │   └── ...
│   ├── routes/                 # API route definitions
│   │   ├── authRoutes.js
│   │   ├── vendorRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── ...
│   ├── utils/                  # Utility functions
│   ├── .env.example           # Environment template
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server entry point
│   ├── seed.js                # Database seeding script
│   └── package.json           # Backend dependencies
│
├── src/                        # Frontend source (React)
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Shared components (buttons, cards)
│   │   ├── layout/            # Layout components (navbar, footer)
│   │   └── ...
│   ├── context/               # React context (global state)
│   │   └── AuthContext.js     # Authentication state
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   │   ├── Home.jsx           # Landing page
│   │   ├── Login.jsx          # Login page
│   │   ├── Vendors.jsx        # Vendor listing
│   │   ├── admin/             # Admin pages
│   │   ├── vendor/            # Vendor dashboard pages
│   │   └── ...
│   ├── services/              # API communication
│   │   └── api.js             # API helper functions
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Main React component
│   └── index.js               # React entry point
│
├── public/                     # Static files (favicon, index.html)
├── .env                       # Frontend environment config
├── package.json               # Frontend dependencies
├── tailwind.config.js         # Tailwind CSS configuration
├── PROJECT_OVERVIEW.md        # Project documentation
├── SETUP_GUIDE.md             # This file
└── README.md                  # Quick reference
```

---

## API Endpoints Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password/:token` | Reset password with token | No |

### Categories (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all categories | No |
| GET | `/:name` | Get category by name | No |

### Vendors (`/api/vendors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all vendors | No |
| GET | `/featured` | Get featured vendors | No |
| GET | `/category/:name` | Get vendors by category | No |
| GET | `/:id` | Get vendor by ID | No |

### Services (`/api/services`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all services | No |

### Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's bookings | Yes |
| POST | `/` | Create new booking | Yes |
| GET | `/:id` | Get booking by ID | Yes |
| PUT | `/:id` | Update/confirm booking | Yes |
| DELETE | `/:id` | Cancel/delete booking | Yes |

### Reviews (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/vendor/:vendorId` | Get vendor reviews | No |
| POST | `/` | Create review | Yes |
| PUT | `/:id` | Update review | Yes |
| DELETE | `/:id` | Delete review | Yes |

### Chat (`/api/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/conversations` | Get user's conversations | Yes |
| GET | `/messages/:conversationId` | Get messages | Yes |
| POST | `/messages` | Send message | Yes |

### Vendor Dashboard (`/api/vendor`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get vendor dashboard stats | Yes (Vendor) |
| GET | `/bookings` | Get vendor's bookings | Yes (Vendor) |
| PUT | `/profile` | Update vendor profile | Yes (Vendor) |
| PUT | `/bookings/:id/status` | Update booking status | Yes (Vendor) |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get admin dashboard stats | Yes (Admin) |
| GET | `/vendors` | Get all vendors | Yes (Admin) |
| PUT | `/vendors/:id/approve` | Approve vendor | Yes (Admin) |
| DELETE | `/vendors/:id` | Delete vendor | Yes (Admin) |
| POST | `/categories` | Create category | Yes (Admin) |
| PUT | `/categories/:id` | Update category | Yes (Admin) |
| DELETE | `/categories/:id` | Delete category | Yes (Admin) |
| POST | `/services` | Create service | Yes (Admin) |
| PUT | `/services/:id` | Update service | Yes (Admin) |
| DELETE | `/services/:id` | Delete service | Yes (Admin) |

---

## Need Help?

If you encounter issues not covered here:

1. Check the error message carefully - it often tells you what's wrong
2. Make sure all prerequisites are installed correctly
3. Verify all environment variables are set
4. Try restarting both servers
5. Check if MongoDB is running

---

*For understanding the project and its features, see [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)*
