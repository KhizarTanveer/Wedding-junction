
# Wedding Junction

A premium wedding planning platform that connects couples with top-tier vendors for venues, catering, photography, makeup, and decor services.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** v18 or higher
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**

## Project Structure

```
wedding-junction/
├── backend/           # Express.js API server
│   ├── config/        # Database configuration
│   ├── controllers/   # Route handlers
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   └── seed.js        # Database seeding script
├── src/               # React frontend
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   └── pages/         # Page components
└── public/            # Static assets
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd wedding-junction/wedding-junction
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

#### Backend Environment (`backend/.env`)

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=mongodb://127.0.0.1:27017/weddingApp
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

> **Note:** For production, use MongoDB Atlas connection string and a strong JWT secret.

#### Frontend Environment (`.env`)

Create a `.env` file in the root `wedding-junction` folder:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running on your machine:

```bash
# Windows (if installed as service)
net start MongoDB

# Or start manually
mongod
```

### 5. Seed the Database

Populate the database with initial data (categories, vendors, services):

```bash
cd backend
npm run seed
```

Expected output:
```
Connected to MongoDB
Cleared existing data
Inserted 5 categories
Inserted 4 services
Inserted 54 vendors
========================================
Database seeded successfully!
========================================
```

### 6. Run the Application

Open **two terminal windows**:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

**Terminal 2 - Frontend Development Server:**
```bash
npm start
```

The frontend will start on `http://localhost:3000`

### 7. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/

## Available Scripts

### Backend (`/backend`)

| Command | Description |
|---------|-------------|
| `npm start` | Start the server (production) |
| `npm run dev` | Start with nodemon (development) |
| `npm run seed` | Seed database with initial data |

### Frontend (`/`)

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/:name` | Get category by name |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors` | Get all vendors |
| GET | `/api/vendors/featured` | Get featured vendors |
| GET | `/api/vendors/category/:name` | Get vendors by category |
| GET | `/api/vendors/:id` | Get vendor by ID |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |

### Bookings (Protected - requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get user's bookings |
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/:id` | Get booking by ID |
| PUT | `/api/bookings/:id` | Update/confirm booking |
| DELETE | `/api/bookings/:id` | Delete booking |

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# If not installed, download from:
# https://www.mongodb.com/try/download/community
```

### Port Already in Use

```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Clear and Reseed Database

```bash
cd backend
npm run seed
```

## Tech Stack

- **Frontend:** React 18, React Router, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)

## License

ISC
