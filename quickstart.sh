#!/bin/bash
# RailPool Quick Start Script for macOS/Linux

echo ""
echo "========================================"
echo "   RailPool - Quick Start"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null
then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo "[1/5] Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

echo "[2/5] Copying backend environment file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

echo "[3/5] Setting up Frontend..."
cd ../frontend
npm install

echo "[4/5] Ready to start!"
echo ""
echo "To run the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Default test credentials (after seeding):"
echo "  Email: alice@railpool.com"
echo "  Password: password123"
echo ""
echo "To seed sample data (run before first use):"
echo "  cd backend"
echo "  python seed.py"
echo ""
