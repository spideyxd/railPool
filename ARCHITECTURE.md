# RailPool Architecture

## System Overview

```
┌─────────────────┐
│   React App     │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP/REST
         │ (Axios)
         ▼
┌─────────────────────────────────────────┐
│   Flask API Server                      │
├─────────────────────────────────────────┤
│ Routes Layer (Auth, Ride, Request, Chat)│
│ Services Layer (Business Logic)         │
│ Models Layer (SQLAlchemy ORM)           │
└────────┬────────────────────────────────┘
         │ SQL
         ▼
┌─────────────────────┐
│  PostgreSQL DB      │
│  (Users, Rides,     │
│   Requests, Msgs)   │
└─────────────────────┘
```

## Data Flow

### User Registration/Login
1. Frontend: User submits email, password, name
2. API: POST /auth/signup validates and creates user
3. API: Returns JWT token
4. Frontend: Stores token in localStorage

### Ride Creation & Search
1. Frontend: User creates ride intent (location, time, type)
2. API: POST /ride/create stores in database
3. Frontend: User searches for matches
4. API: POST /ride/search uses Haversine formula to find nearby rides
5. Results sorted by distance

### Pooling Request Flow
1. Frontend: User sends request to matched rider
2. API: POST /request/send creates request (status: pending)
3. Dashboard: Receiver sees request
4. API: POST /request/:id/respond updates status
5. When accepted: Chat enabled

### Chat Flow
1. API: GET /chat/:request_id/messages retrieves history
2. Frontend: User types message
3. API: POST /chat/:request_id/send saves to database
4. Frontend: Polls or receives real-time updates

## Authentication Flow

```
Sign Up/Login
     │
     ▼
Verify Credentials
     │
     ▼
Generate JWT Token
     │
     ▼
Return Token + User Data
     │
     ▼
Frontend: Store token in localStorage
     │
     ▼
Subsequent Requests: Add "Authorization: Bearer <token>"
     │
     ▼
Backend: Verify token with @token_required decorator
     │
     ▼
Allow/Deny Access
```

## Database Relationships

```
Users (1) ──────────── (N) RideIntents
Users (1) ──────────── (N) RideRequests (as sender)
Users (1) ──────────── (N) RideRequests (as receiver)
Users (1) ──────────── (N) Messages
RideIntents (1) ──────────── (N) RideRequests
RideRequests (1) ──────────── (N) Messages
```

## Distance Matching Algorithm

Uses Haversine formula to calculate great-circle distance between two coordinates:

```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
d = R × c

where:
φ = latitude, λ = longitude, R = Earth's radius (6371 km)
```

Results are:
1. Filtered by station and time (±1 hour)
2. Distance calculated
3. Match score = 100 - (distance × 10)
4. Sorted by nearest first

## Scalability Considerations

1. **Database**: Add read replicas for search queries
2. **Caching**: Cache ride intents by station/time
3. **API**: Implement pagination for large result sets
4. **Search**: Use full-text search for destination names
5. **Real-time**: Add WebSocket layer for live chat and notifications
