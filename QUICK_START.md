# 🚀 RailPool - Get Started in 5 Minutes

Welcome! Here's the fastest way to get RailPool running on your machine.

## Prerequisites

Make sure you have these installed:
- **Python 3.8+** (check: `python --version`)
- **Node.js 16+** (check: `node --version`)
- **PostgreSQL 12+** (check: `psql --version`)

Don't have them? Install from:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/
- PostgreSQL: https://www.postgresql.org/download/

## Step 1: Start PostgreSQL

**Windows**:
- Open Services and start PostgreSQL

**Mac**:
```bash
brew services start postgresql
```

**Linux**:
```bash
sudo systemctl start postgresql
```

## Step 2: Create Database

```bash
psql -U postgres
CREATE DATABASE railpool;
\q
```

## Step 3: Run Quick Start

**Windows**:
```bash
quickstart.bat
```

**Mac/Linux**:
```bash
chmod +x quickstart.sh
./quickstart.sh
```

The script will:
1. Create Python virtual environment
2. Install backend dependencies
3. Install frontend dependencies
4. Copy environment files

## Step 4: Run Backend

Open a terminal and run:

```bash
cd backend
venv\Scripts\activate    # Windows: venv\Scripts\activate
source venv/bin/activate # Mac/Linux

python seed.py           # Seed sample data
python run.py            # Start server
```

You should see: `Running on http://127.0.0.1:5000/`

## Step 5: Run Frontend

Open **another terminal** and run:

```bash
cd frontend
npm start
```

The app will open in your browser at `http://localhost:3000`

## Step 6: Login & Test

Use these credentials:
- **Email**: alice@railpool.com
- **Password**: password123

Or create a new account!

## 🎯 What to Try

1. **Login** with the sample credentials
2. **Create a Ride** (Dashboard → Create Ride tab)
3. **Search for Rides** (Search button in navbar)
4. **Send Request** to a matched rider
5. **Accept Request** on dashboard
6. **Chat** with the matched rider

## 📚 Documentation

- **[README.md](README.md)** - Full project overview
- **[SETUP.md](SETUP.md)** - Detailed setup guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API endpoint details
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design

## ⚡ Quick Commands Reference

```bash
# Backend
cd backend
venv\Scripts\activate              # Activate virtual environment
python seed.py                     # Seed sample data
python run.py                      # Start server

# Frontend
cd frontend
npm install                        # Install dependencies
npm start                          # Start development server
npm build                          # Build for production

# Database
psql -U postgres                   # Connect to PostgreSQL
CREATE DATABASE railpool;          # Create database
\dt                                # List tables (after running app)
```

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```bash
# Make sure PostgreSQL is running
# Windows: Check Services
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Port 5000 Already in Use
```bash
# Kill the process using port 5000
# Windows: netstat -ano | findstr :5000
#         taskkill /PID <PID> /F
# Mac/Linux: lsof -i :5000
#           kill -9 <PID>
```

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
# Windows: netstat -ano | findstr :3000
#         taskkill /PID <PID> /F
# Mac/Linux: lsof -i :3000
#           kill -9 <PID>
```

### Module Not Found Error
```bash
# Activate virtual environment and reinstall
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

## 📋 Environment Files

Backend `.env` (created by quickstart):
```
FLASK_ENV=development
FLASK_PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/railpool
SECRET_KEY=dev-secret-key-change-in-production
```

Frontend `.env.local` (if needed):
```
REACT_APP_API_URL=http://localhost:5000
```

## 🎓 Sample Data

After running `seed.py`, you get:

**5 Test Users**:
- alice@railpool.com
- bob@railpool.com
- carol@railpool.com
- dave@railpool.com
- eve@railpool.com

All with password: `password123`

**Pre-created Rides**:
- Offering rides from 2 users
- Seeking rides from 2 users
- Sample requests and messages

## ✅ Verification

Check that everything is running:

**Backend**: http://localhost:5000
Should show Flask is running

**Frontend**: http://localhost:3000
Should show RailPool login page

**Database**: 
```bash
psql -U postgres -d railpool
SELECT COUNT(*) FROM users;  # Should show 5
\q
```

## 🚀 Next Steps

1. Explore the code in `backend/app/` and `frontend/src/`
2. Read through the API documentation
3. Try creating rides and matching with other users
4. Modify and extend features

## 📞 Need Help?

1. Check `SETUP.md` troubleshooting section
2. Review error messages in terminal
3. Check `README.md` for feature details
4. Read `ARCHITECTURE.md` for system design

## 🎉 You're Ready!

RailPool is now running on your machine. Start pooling rides! 🚗💨

---

**Quick Links**:
- 🏠 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:5000
- 📚 Full Docs: [README.md](README.md)
- ⚙️ Setup Help: [SETUP.md](SETUP.md)

Happy coding! 🚀
