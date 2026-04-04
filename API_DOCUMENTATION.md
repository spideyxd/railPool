# RailPool API Documentation

Complete REST API documentation for RailPool backend.

## Base URL

```
http://localhost:5000
```

## Authentication

All endpoints (except `/auth/signup` and `/auth/login`) require JWT token in header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Signup
Create a new user account.

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "9876543210",
  "gender": "Male"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "gender": "Male",
    "rating": 5.0,
    "created_at": "2024-04-04T10:00:00"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Login
Authenticate user and get JWT token.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get Profile
Retrieve current user's profile.

```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "gender": "Male",
    "rating": 5.0,
    "created_at": "2024-04-04T10:00:00"
  }
}
```

### Update Profile
Update user profile information.

```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "9876543211",
  "gender": "Female"
}
```

**Response (200)**:
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Ride Endpoints

### Create Ride Intent
Create a new ride pooling intent.

```http
POST /ride/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "station": "Delhi Central",
  "arrival_time": "2024-04-04T14:30:00",
  "destination_name": "Airport T1",
  "destination_lat": 28.5562,
  "destination_lng": 77.1199,
  "intent_type": "seeking",
  "seats_needed": 1
}
```

**For offering, replace with**:
```json
{
  "...": "...",
  "intent_type": "offering",
  "seats_available": 3
}
```

**Response (201)**:
```json
{
  "message": "Ride intent created successfully",
  "ride_intent": {
    "id": 1,
    "user_id": 1,
    "station": "Delhi Central",
    "arrival_time": "2024-04-04T14:30:00",
    "destination_name": "Airport T1",
    "destination_lat": 28.5562,
    "destination_lng": 77.1199,
    "intent_type": "seeking",
    "seats_needed": 1,
    "is_active": true,
    "created_at": "2024-04-04T10:00:00"
  }
}
```

### Search Trains
Search trains using mock IRCTC API.

```http
POST /ride/search-train
Content-Type: application/json

{
  "pnr": "1234567890",
  "train_number": "12001",
  "journey_date": "2024-04-04",
  "destination_station": "Delhi"
}
```

**Response (200)**:
```json
{
  "trains": [
    {
      "train_number": "12001",
      "train_name": "Rajdhani Express",
      "source": "Mumbai Central",
      "destination": "Delhi Central",
      "arrival_time": "2024-04-04T14:30:00"
    }
  ]
}
```

### Search Matching Rides
Find rides that match user's criteria.

```http
POST /ride/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "station": "Delhi Central",
  "arrival_time": "2024-04-04T14:30:00",
  "destination_lat": 28.5562,
  "destination_lng": 77.1199,
  "time_buffer": 3600
}
```

**Response (200)**:
```json
{
  "matches": [
    {
      "ride_intent": { ... },
      "user": {
        "id": 2,
        "name": "Alice Johnson",
        "email": "alice@railpool.com",
        "phone": "9876543210",
        "rating": 4.8
      },
      "distance": 2.5,
      "match_score": 75.0
    }
  ],
  "count": 1
}
```

### Get My Intents
List all ride intents created by current user.

```http
GET /ride/my-intents
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "intents": [ ... ],
  "count": 2
}
```

### Deactivate Ride Intent
Deactivate an active ride intent.

```http
POST /ride/1/deactivate
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "message": "Ride intent deactivated",
  "ride_intent": { ... }
}
```

---

## Request Endpoints

### Send Request
Send a pooling request to another user.

```http
POST /request/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver_id": 2,
  "ride_intent_id": 1
}
```

**Response (201)**:
```json
{
  "message": "Request sent successfully",
  "request": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "ride_intent_id": 1,
    "status": "pending",
    "created_at": "2024-04-04T10:00:00"
  }
}
```

### Respond to Request
Accept or reject a pooling request.

```http
POST /request/1/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

**Status values**: `"accepted"` or `"rejected"`

**Response (200)**:
```json
{
  "message": "Request accepted",
  "request": {
    "id": 1,
    "status": "accepted",
    "updated_at": "2024-04-04T10:05:00"
  }
}
```

### Get My Requests
Retrieve all requests sent and received by current user.

```http
GET /request/my-requests?status=pending
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (optional): Filter by status (`pending`, `accepted`, `rejected`)

**Response (200)**:
```json
{
  "sent_requests": [ ... ],
  "received_requests": [ ... ],
  "total": 4
}
```

### Get Request Details
Get full details of a specific request.

```http
GET /request/1
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "request": { ... },
  "sender": { ... },
  "receiver": { ... },
  "ride_intent": { ... }
}
```

---

## Chat Endpoints

### Get Messages
Retrieve chat messages for a request.

```http
GET /chat/1/messages?limit=50
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (optional): Number of messages to retrieve (default: 50)

**Response (200)**:
```json
{
  "messages": [
    {
      "id": 1,
      "sender_id": 1,
      "ride_request_id": 1,
      "content": "Hi! Are you still interested?",
      "created_at": "2024-04-04T10:00:00"
    }
  ],
  "count": 1
}
```

### Send Message
Send a message in a chat conversation.

```http
POST /chat/1/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Yes! What time will you be there?"
}
```

**Response (201)**:
```json
{
  "message": "Message sent",
  "data": {
    "id": 2,
    "sender_id": 2,
    "ride_request_id": 1,
    "content": "Yes! What time will you be there?",
    "created_at": "2024-04-04T10:05:00"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Token is missing"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting (Future)

Currently no rate limiting. Implement for production:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Pagination (Future)

Future endpoints will support:
```
GET /ride/my-intents?page=1&limit=10
```

---

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "9876543210"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/auth/profile \
  -H "Authorization: Bearer <token>"
```

---

## Testing with Postman

1. Import API endpoints into Postman
2. Create environment with variable: `token`
3. Set `Authorization` header to `Bearer {{token}}`
4. After login, update token in environment
5. Test all endpoints

---

## API Versioning (Future)

When upgrading API, use versioning:
```
/api/v1/auth/login
/api/v1/ride/create
```

---

**RailPool API v1.0**
Last Updated: April 2024
