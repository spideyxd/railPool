# railPool
# RailPool - Cab Pooling for Train Passengers in India

A production-ready MVP for enabling ride pooling between passengers arriving at Indian railway stations to reduce surge pricing on cab/auto services.

## Features

- **User Authentication**: JWT-based signup/login with profile management
- **Train Search**: Mock IRCTC API integration for train search
- **Ride Pooling**: Create and search for ride pooling opportunities
- **Smart Matching**: Haversine distance calculation for matching nearby destinations
- **Request System**: Send and accept/reject pooling requests
- **Real-time Chat**: Message-based communication for accepted requests
- **Rating System**: Basic rating infrastructure for future implementation

## Tech Stack

### Backend
- **Framework**: Flask
- **Database**: PostgreSQL
- **Authentication**: JWT
- **ORM**: SQLAlchemy

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS

## Project Structure

```
RailPool/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── __init__.py      # Flask app factory
│   ├── run.py               # Flask entry point
│   ├── seed.py              # Database seeding
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
│
└── frontend/
    ├── public/
    │   └── index.html       # HTML template
    ├── src/
    │   ├── pages/           # React pages
    │   ├── services/        # API services
    │   ├── utils/           # Helper functions
    │   ├── styles/          # CSS files
    │   ├── App.js           # Main component
    │   └── index.js         # Entry point
    ├── package.json
    └── .env.local           # Environment variables
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup

1. **Create and activate Python virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env with your settings
   # Example:
   # DATABASE_URL=postgresql://postgres:password@localhost:5432/railpool
   # FLASK_ENV=development
   # SECRET_KEY=your-secret-key
   ```

4. **Setup Database**:
   ```bash
   # Make sure PostgreSQL is running
   # Create database (from PostgreSQL CLI or pgAdmin)
   createdb railpool
   ```

5. **Seed sample data**:
   ```bash
   python seed.py
   ```

6. **Run Flask server**:
   ```bash
   python run.py
   ```
   Server runs on http://localhost:5000

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment** (optional):
   ```bash
   # Create .env.local if needed
   echo "REACT_APP_API_URL=http://localhost:5000" > .env.local
   ```

3. **Run development server**:
   ```bash
   npm start
   ```
   App runs on http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update profile

### Rides
- `POST /ride/create` - Create a ride intent
- `POST /ride/search-train` - Search trains (mock IRCTC API)
- `POST /ride/search` - Search matching rides
- `GET /ride/my-intents` - Get user's ride intents
- `POST /ride/:id/deactivate` - Deactivate a ride intent

### Requests
- `POST /request/send` - Send pooling request
- `POST /request/:id/respond` - Accept/reject request
- `GET /request/my-requests` - Get user's requests
- `GET /request/:id` - Get request details

### Chat
- `GET /chat/:request_id/messages` - Get messages
- `POST /chat/:request_id/send` - Send message

## Database Schema

### Users
- id (Primary Key)
- email (Unique)
- password_hash
- name
- phone
- gender
- rating (default: 5.0)
- created_at, updated_at

### RideIntents
- id (Primary Key)
- user_id (Foreign Key → Users)
- station (indexed)
- arrival_time (indexed)
- destination_name, destination_lat, destination_lng
- intent_type ('offering' or 'seeking')
- seats_available (for offering)
- seats_needed (for seeking)
- is_active (boolean, indexed)
- created_at, updated_at

### RideRequests
- id (Primary Key)
- sender_id (Foreign Key → Users)
- receiver_id (Foreign Key → Users)
- ride_intent_id (Foreign Key → RideIntents)
- status ('pending', 'accepted', 'rejected', 'cancelled')
- created_at, updated_at

### Messages
- id (Primary Key)
- sender_id (Foreign Key → Users)
- ride_request_id (Foreign Key → RideRequests)
- content
- created_at

## Sample Data

The `seed.py` script populates the database with:
- 5 sample users with different ride intents
- Various ride intents (both offering and seeking)
- Sample requests and messages
- Mumbai Central as default station

Test credentials after seeding:
```
Email: alice@railpool.com
Password: password123

Email: bob@railpool.com
Password: password123
```

## Key Features Implemented

### 1. Authentication
- Secure JWT-based authentication
- Password hashing with werkzeug
- Protected routes with token validation

### 2. Ride Matching
- Haversine formula for distance calculation
- Time-based matching (±1 hour buffer)
- Sorting by nearest destination
- Match score calculation

### 3. Request Management
- Send/receive requests
- Accept/reject flow
- Status tracking

### 4. Chat System
- Message persistence in database
- Real-time message retrieval
- Chat available only for accepted requests

### 5. Frontend
- Clean, responsive UI
- Form validation
- Error handling
- Loading states
- Protected routes

## Running the Application

### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

Then open http://localhost:3000 in your browser.

## Testing the Flow

1. **Sign up**: Create two user accounts
2. **Create ride intent**: One user creates an offering (driver), another creates seeking (passenger)
3. **Search matches**: Search for rides in the results page
4. **Send request**: Send pooling request to matched rider
5. **Accept request**: Accept request from dashboard
6. **Chat**: Open chat and communicate with the matched rider

## Environment Variables

### Backend (.env)
```
FLASK_ENV=development
FLASK_PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/railpool
SECRET_KEY=your-secret-key-change-in-production
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:5000
```

## Improvements for Production

1. **Security**
   - Add CORS restrictions
   - Implement rate limiting
   - Use HTTPS only
   - Add input validation/sanitization

2. **Performance**
   - Add caching layer (Redis)
   - Implement database indexing on frequently searched columns
   - Add pagination to list endpoints

3. **Features**
   - Real-time notifications (WebSocket)
   - Google Maps integration for location selection
   - Payment integration
   - Rating and review system

4. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - Frontend component testing

5. **Deployment**
   - Docker containerization
   - CI/CD pipeline
   - Environment-specific configurations

## License

MIT License

## Support

For issues and questions, please open an issue in the repository.
