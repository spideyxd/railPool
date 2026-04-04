# RailPool Setup Guide

## Quick Start (Recommended)

### Windows
```bash
quickstart.bat
```

### macOS/Linux
```bash
chmod +x quickstart.sh
./quickstart.sh
```

## Manual Setup

### Prerequisites

Before you begin, ensure you have:
- Python 3.8 or higher
- Node.js 16 or higher
- PostgreSQL 12 or higher
- Git

### Step 1: Database Setup

#### Option A: PostgreSQL on Local Machine

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Start PostgreSQL service**
   - Windows: Services → PostgreSQL
   - macOS: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

3. **Create database**
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE railpool;
   \q
   ```

#### Option B: Using Docker

```bash
docker run --name railpool-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=railpool \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your database details
# DATABASE_URL=postgresql://postgres:password@localhost:5432/railpool

# Seed sample data
python seed.py

# Start Flask server
python run.py
```

The backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

The frontend will open in your browser at `http://localhost:3000`

## Testing the Application

### 1. Login with Sample User

After running `seed.py`, use these credentials:

```
Email: alice@railpool.com
Password: password123
```

Other test users:
```
- bob@railpool.com
- carol@railpool.com
- dave@railpool.com
- eve@railpool.com
```

All have password: `password123`

### 2. Test the Full Flow

**Scenario: Alice (driver) and Bob (passenger) pool a ride**

**Step 1: Alice's Perspective (Driver)**
1. Login as alice@railpool.com
2. Go to Dashboard → Create Ride
3. Fill in:
   - Station: Delhi Central
   - Arrival Time: Select a time in the future
   - Destination: Airport T1
   - Latitude: 28.5562
   - Longitude: 77.1199
   - Type: Offering a ride
   - Available Seats: 3
4. Click "Create Ride Intent"

**Step 2: Bob's Perspective (Passenger)**
1. Login as bob@railpool.com
2. Go to Search
3. Select "Manual Search"
4. Enter "Delhi Central" as destination
5. Click "Search Trains" (it will show mock trains)
6. Click "Find Matches"
7. Enter destination details:
   - Destination: Airport T1
   - Latitude: 28.5562
   - Longitude: 77.1199
8. Click "Find Matches"
9. You should see Alice's ride
10. Click "Send Pool Request"

**Step 3: Alice Accepts Request**
1. Alice logs in and goes to Dashboard
2. Click "Requests" tab
3. In "Received Requests" section, click "Accept"

**Step 4: Chat Between Users**
1. Alice or Bob: Click "Chat" button
2. They can now message each other

## Troubleshooting

### PostgreSQL Connection Error

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
1. Verify PostgreSQL is running
2. Check `.env` DATABASE_URL is correct
3. Ensure database exists: `psql -U postgres -l`

### Port Already in Use

**Backend (Port 5000)**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Frontend (Port 3000)**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### ModuleNotFoundError: No module named 'flask'

**Solution**:
1. Ensure virtual environment is activated
2. Run: `pip install -r requirements.txt`

### npm ERR! code EACCES

**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`

### React App Not Starting

**Solution**:
1. Delete node_modules and package-lock.json
2. Run: `npm install`
3. Start with: `npm start --reset-cache`

## Environment Variables

### Backend (.env)

```
# Flask Configuration
FLASK_ENV=development          # development or production
FLASK_PORT=5000               # Port to run Flask on

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/railpool

# Security
SECRET_KEY=dev-secret-key-change-in-production
```

### Frontend (.env.local)

```
# API Configuration
REACT_APP_API_URL=http://localhost:5000
```

## Production Deployment

For production deployment:

1. **Backend**:
   - Use Gunicorn: `gunicorn -w 4 run:app`
   - Set `FLASK_ENV=production`
   - Use a real SECRET_KEY
   - Enable HTTPS

2. **Frontend**:
   - Build: `npm run build`
   - Serve with a static server
   - Set `REACT_APP_API_URL` to production API URL

3. **Database**:
   - Use managed PostgreSQL service
   - Enable backups
   - Use strong credentials

4. **Security**:
   - Enable CORS restrictions
   - Implement rate limiting
   - Use environment variables for secrets
   - Enable HTTPS/SSL

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Save React files and they auto-refresh
- **Backend**: Set `FLASK_ENV=development` for auto-reload

### Debugging

**Frontend**:
- Use React DevTools browser extension
- Open DevTools (F12) to see console errors

**Backend**:
- Add breakpoints in VS Code
- Use `print()` statements
- Check Flask logs in terminal

### Database Exploration

```bash
# Connect to database
psql -U postgres -d railpool

# View tables
\dt

# View users
SELECT * FROM users;

# View ride intents
SELECT * FROM ride_intents;

# View all data
\d

# Exit
\q
```

## Additional Resources

- Flask Documentation: https://flask.palletsprojects.com/
- React Documentation: https://react.dev/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- SQLAlchemy: https://docs.sqlalchemy.org/

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure all services are running
4. Check console and terminal logs for error messages
5. Open an issue with detailed error information
