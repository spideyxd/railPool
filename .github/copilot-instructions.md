# RailPool - Copilot Workspace Instructions

## Project Overview

**RailPool** is a production-ready MVP for enabling ride pooling between passengers arriving at Indian railway stations. The application uses smart matching algorithms (Haversine distance) to connect nearby travelers and reduce surge pricing on cab/auto services.

**Repository**: [spideyxd/railPool](https://github.com/spideyxd/railPool)  
**Current Branch**: main  
**Last Session Focus**: Train number feature integration, date-only arrival, map visualization fixes

## Quick Reference - Build & Run

### Frontend (React 18)
```powershell
cd frontend
npm install      # Install dependencies (first time only)
npm start        # Dev server at http://localhost:3000
npm build        # Production build
npm test         # Run tests
```

### Backend (Flask)
```powershell
cd backend
python -m venv venv                      # Create venv (first time only)
venv\Scripts\activate                    # Activate venv (Windows)
pip install -r requirements.txt          # Install dependencies
python seed.py                           # Populate sample data
python run.py                            # Dev server at http://127.0.0.1:5000
```

### Database
```powershell
# PostgreSQL must be running
psql -U postgres
CREATE DATABASE railpool;
\q
```

### Quick Start (Automated)
```powershell
# Windows
quickstart.bat

# Mac/Linux
chmod +x quickstart.sh
./quickstart.sh
```

## Tech Stack

| Layer | Technology | Key Libraries |
|-------|-----------|---|
| **Frontend** | React 18 | Axios, React Router v6, Tailwind CSS, Framer Motion, Google Maps API |
| **Backend** | Flask 2.3 | SQLAlchemy ORM, Flask-CORS, PyJWT |
| **Database** | PostgreSQL 12+ | psycopg2 (SQLAlchemy driver) |
| **Build/Package** | npm, pip | react-scripts, docker (optional) |

## Architecture

### Directory Structure

```
pool.ai/
├── .github/
│   └── copilot-instructions.md     ← You are here
├── backend/
│   ├── app/
│   │   ├── models/                 # SQLAlchemy models (User, RideIntent, etc.)
│   │   ├── routes/                 # Flask route handlers (auth, ride, request, message)
│   │   ├── services/               # Business logic (matching, distance calc, etc.)
│   │   ├── utils/                  # Helpers (jwt, distance, geocoding)
│   │   └── __init__.py             # Flask app factory
│   ├── run.py                      # Entry point (python run.py)
│   ├── seed.py                     # Sample data population
│   └── requirements.txt            # Dependencies
│
├── frontend/
│   ├── public/
│   │   ├── index.html              # HTML template
│   │   ├── train_number.json       # Train autocomplete data
│   │   └── stationList.json        # Station autocomplete data
│   ├── src/
│   │   ├── pages/                  # React pages (Dashboard, Search, Auth, etc.)
│   │   ├── components/             # Reusable React components
│   │   ├── services/               # API service layer (api.js)
│   │   ├── utils/                  # Helper utilities
│   │   ├── styles/                 # CSS files (Tailwind + custom)
│   │   ├── App.js                  # Main component + routing
│   │   └── index.js                # React entry point
│   ├── package.json
│   └── .env.local                  # Environment variables (not in git)
│
├── Documentation Files  (30+ .md files)
│   ├── QUICK_START.md              # 5-minute setup
│   ├── README.md                   # Complete overview
│   ├── SETUP.md                    # Detailed setup with troubleshooting
│   ├── ARCHITECTURE.md             # System design & data flow
│   ├── API_DOCUMENTATION.md        # REST API reference
│   ├── PROJECT_SUMMARY.md          # Completion report
│   └── DOCUMENTATION_INDEX.md      # Navigation guide
│
└── Configuration & Scripts
    ├── quickstart.bat / quickstart.sh
    ├── SQL_MIGRATIONS.sql          # Database migrations
    └── .env.example files          # Env templates
```

## Data Models & Key Relationships

### Core Models (SQLAlchemy ORM)

**User** (Authentication & Profile)
- `id`, `email`, `password_hash`, `name`, `phone`
- Relationships: RideIntent (creator), RideRequest (sender/receiver), Message

**RideIntent** (Pooling Opportunity)
- `id`, `user_id`, `station`, `destination_lat`, `destination_lng`, `destination_name`
- `train_number`, `train_name`, `arrival_date` (DATE type, not datetime)
- `intent_type` (offer/request), `seats_available/seats_needed`, `created_at`
- Relationships: RideRequest (1-to-many), User (many-to-1)

**RideRequest** (Pooling Agreement)
- `id`, `sender_id`, `receiver_id`, `ride_intent_id`, `status` (pending/accepted/rejected)
- Relationships: User (2 FK), RideIntent, Message (1-to-many)

**Message** (Chat)
- `id`, `user_id`, `request_id`, `content`, `created_at`
- Relationships: User, RideRequest

### Database Schema Notes
- **Primary Keys**: All models use auto-increment integer `id`
- **Foreign Keys**: Properly cascaded with FOREIGN KEY constraints
- **Indexes**: `train_number`, `arrival_date`, `user_id`, `station` for query performance
- **Timestamps**: `created_at` auto-populated; `arrival_date` is DATE only (no time component)

## API Contracts

### Key Endpoints

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/auth/signup` | User registration | No |
| POST | `/auth/login` | User login, returns JWT | No |
| POST | `/ride/create` | Create ride intent | Yes |
| POST | `/ride/search` | Search matches by station/date/train | Yes |
| POST | `/request/send` | Send pooling request | Yes |
| POST | `/request/:id/respond` | Accept/reject request | Yes |
| GET | `/chat/:request_id/messages` | Fetch chat history | Yes |
| POST | `/chat/:request_id/send` | Send message | Yes |

### Request/Response Flow
- Backend returns JSON with `success`, `data`, `error` fields
- Frontend uses `axios` for all API calls from `src/services/api.js`
- Auth: JWT token in `Authorization: Bearer <token>` header
- CORS configured for `http://localhost:3000` (frontend) ↔ `http://localhost:5000` (backend)

### Recent API Changes
- `arrival_time` (DateTime) → `arrival_date` (DATE string "YYYY-MM-DD")
- `train_number`, `train_name` fields added to RideIntent
- Search parameters updated to optional `train_number` filter

## Frontend Patterns & Components

### Key Components
- **TrainAutocomplete.jsx**: Reusable train selection component (uses `train_number.json`)
- **LocationPickerMap.jsx**: Google Maps integration with reverse geocoding
- **RideDetailsModal.jsx**: Full ride info + map display; tracks ride changes in deps; resets map instance on close
- **RideCard.jsx**: Displays individual ride result with train info and formatted date
- **Dashboard.js**: User's create ride form + my rides list
- **Search.js**: Search form + results grid with "View Details" modal

### Styling & UI
- **CSS Framework**: Tailwind CSS with dark theme
- **Components**: Radix UI primitives (Dialog, Dropdown, Tabs)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Google Maps**: @googlemaps/js-api-loader with Places Autocomplete

### Date Handling in Frontend
**Pattern**: Concatenate `'T00:00:00'` to date strings before parsing:
```javascript
const date = new Date(ride.arrival_date + 'T00:00:00');
// Avoids "Invalid Date" errors from timezone issues
```

### Map Component Pattern
**Key Rule**: useEffect dependencies must include the ride object to reinitialize on ride changes:
```javascript
useEffect(() => {
  if (isOpen && ride && ride.destination_lat) {
    initializeMap(); // Reinitialize when ride changes
  }
}, [isOpen, ride]); // 'ride' required here
```

## Backend Patterns & Services

### Service Layer (Business Logic)
- **LocationService**: Reverse geocoding, distance calculation
- **RideService**: Create ride intent, search matches using Haversine formula
- **AuthService**: JWT token generation, password hashing
- **RequestService**: Send/respond to pooling requests

### Distance Matching Algorithm
- Uses **Haversine formula** to calculate great-circle distance between coordinates
- Sorted by distance; filtered by time buffer (±1 hour default)
- Train number optional filter (exact match if provided)

### Request/Response Convention
- Use Flask `jsonify()` for responses
- Always include `success`, `data`, `error` fields
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauth), 404 (Not Found), 500 (Error)
- Errors include descriptive messages for debugging

## Common Development Tasks

### Adding a New Feature
1. **Database**: Add columns/tables in `backend/app/models/` (SQLAlchemy)
2. **API**: Create route in `backend/app/routes/`, service logic in `backend/app/services/`
3. **Frontend**: Create component in `frontend/src/components/` or page in `frontend/src/pages/`
4. **Integration**: Update `frontend/src/services/api.js` with new endpoint call
5. **Styling**: Use Tailwind classes; follow dark theme pattern
6. **Migration**: Create Python migration script if schema changes; also create SQL backup

### Debugging Frontend
- **React DevTools**: Installed via browser extension
- **Console**: Check for API errors, date parsing issues, map initialization logs
- **Axios Interceptors**: Add logging in `api.js` to debug requests/responses
- **Map Issues**: Verify API key, coordinate validation, useEffect dependencies

### Debugging Backend
- **Flask Debug Mode**: Set `FLASK_ENV=development` in `.env`
- **Print Statements**: Use `print()` or `app.logger.info()` for diagnostics
- **Database Queries**: SQLAlchemy can log SQL via `SQLALCHEMY_ECHO=True`
- **Error Tracebacks**: Check terminal where `python run.py` is running

### Database Migrations
1. **Validate Schema**: Check `backend/app/models/` for changes
2. **Create SQL Migration**: Write `.sql` file in version control (backup)
3. **Create Python Migration**: Write migration script (e.g., `migrate_*.py`) for automation
4. **Test Locally**: Run against local PostgreSQL first
5. **Seed Data**: Re-run `seed.py` to repopulate if schema changes drop tables

### Testing
- **Frontend**: `npm test` (Jest via react-scripts)
- **Backend**: No automated test suite currently; manual testing via API calls recommended
- **Integration**: Use sample data from `seed.py`; test Auth → Ride Create → Search → Request flow

## Known Gotchas & Anti-Patterns

### ❌ Date Display Errors
**Problem**: Frontend shows "Invalid Date"  
**Cause**: Parsing date string without time component  
**Fix**: Use `new Date(dateStr + 'T00:00:00')` pattern before formatting

### ❌ Map Not Showing Pinpoint
**Problem**: RideDetailsModal map is blank  
**Cause**: useEffect dependencies missing ride object; map doesn't reinitialize on ride change  
**Fix**: Include `ride` in useEffect deps: `[isOpen, ride]`

### ❌ Location Picker Shows "Address Not Found"
**Problem**: Reverse geocoding fails for user's picked location  
**Cause**: Google Maps API intermittent failures or coordinates out of bounds  
**Fix**: Fallback to user's search input or raw coordinates (already implemented in LocationPickerMap)

### ❌ Train Autocomplete Not Filtering
**Problem**: TrainAutocomplete component not searching `train_number.json`  
**Cause**: Check that `train_number.json` exists in `frontend/public/`  
**Fix**: Verify JSON format: `[[number, name], [number, name], ...]`

### ❌ CORS Errors Between Frontend & Backend
**Problem**: API calls fail with CORS origin error  
**Cause**: Frontend running on different port, or backend CORS not configured  
**Fix**: Ensure `flask-cors` initialized in `backend/app/__init__.py` with frontend URL

### ❌ Database Connection Issues
**Problem**: "could not connect to server" error  
**Cause**: PostgreSQL not running or credentials wrong  
**Fix**: Verify PostgreSQL is running; check `.env` has correct DB_URL

## Environment Variables

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=<your-key>
```

### Backend (.env)
```
FLASK_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost/railpool
SECRET_KEY=<jwt-secret>
GOOGLE_MAPS_API_KEY=<your-key>
```

See `.env.example` files in each directory for full templates.

## Documentation Links

| Document | Purpose |
|-----------|---------|
| [QUICK_START.md](../QUICK_START.md) | 5-minute setup |
| [SETUP.md](../SETUP.md) | Detailed setup with troubleshooting |
| [README.md](../README.md) | Complete project overview |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | System design & data flow |
| [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) | REST API reference |
| [FILE_INDEX.md](../FILE_INDEX.md) | Complete file listing |
| [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md) | Navigation guide |

## Code Style & Conventions

### Frontend (React/JavaScript)
- **Naming**: `camelCase` for functions/variables, `PascalCase` for components
- **Hooks**: Use functional components with React hooks (no class components)
- **State Management**: useState/useContext; no Redux
- **Styling**: Tailwind CSS classes + custom CSS in separate files
- **Error Handling**: Try-catch around API calls; show toast/modal to user
- **Comments**: JSDoc for complex logic; inline comments for non-obvious code

### Backend (Flask/Python)
- **Naming**: `snake_case` for functions/variables, `PascalCase` for classes
- **Routes**: Group by resource (auth, ride, request, message)
- **Services**: Separate business logic from route handlers
- **Error Handling**: Return JSON error responses with descriptive messages
- **Decorators**: Use `@token_required` for protected endpoints; `@app.route()` for paths
- **Comments**: Docstrings for functions; inline comments for complex logic

## Tips for Efficient Development

1. **Always read existing code patterns** before implementing new features
2. **Update BOTH frontend and backend** when adding API endpoints
3. **Test date parsing** early—most bugs are timezone-related
4. **Use browser DevTools** for frontend debugging (React tab, Console, Network)
5. **Keep `.env` files local** (never commit—use `.env.example`)
6. **Seed data regularly** during development to test with realistic data
7. **Check API response contracts** in API_DOCUMENTATION.md before coding
8. **Run lint checks** (`npm run eject` shows linting config) to catch issues early

## Getting Help

- **API Errors?** Check [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for endpoint contracts
- **Setup Issues?** See [SETUP.md](../SETUP.md) troubleshooting section
- **Database Questions?** Review [ARCHITECTURE.md](../ARCHITECTURE.md) schema section
- **Lost?** Start with [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md) to find the right doc
