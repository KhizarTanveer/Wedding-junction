#!/bin/bash
echo "==================================================="
echo "  Wedding Junction - Automated Setup Script"
echo "==================================================="
echo

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js (v18+) and try again."
    exit 1
fi

# 2. Install workspace dependencies
echo "[1/3] Installing dependencies for all workspace projects (Frontend & Backend)..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies."
    exit 1
fi
echo

# 3. Configure environment files
echo "[2/3] Configuring environment files (.env)..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "  Created backend/.env from template."
else
    echo "  backend/.env already exists."
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "  Created frontend/.env from template."
else
    echo "  frontend/.env already exists."
fi
echo

# 4. Seeding the database (Optional)
echo "[3/3] Database Seeding..."
read -p "Do you want to seed the database with initial test data? (y/n): " seed
if [[ "$seed" =~ ^[Yy]$ ]]; then
    echo "Running database seed script..."
    npm run seed
else
    echo "Skipping database seeding. You can run 'npm run seed' later."
fi

echo
echo "==================================================="
echo "  Setup completed successfully!"
echo "  To run both backend and frontend concurrently, run:"
echo "  npm run dev"
echo "==================================================="
