# 🔐 Google OAuth Setup Guide

## Overview
Google OAuth authentication has been added to RailPool. This guide walks you through setting up Google authentication for both development and production.

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account (create one if needed)

### 1.2 Create a New Project
1. Click the project dropdown at the top
2. Click "NEW PROJECT"
3. Enter name: `RailPool`
4. Click "CREATE"
5. Wait for project to be created and select it

### 1.3 Enable Google+ API
1. Click "APIs & Services" in the left sidebar
2. Click "ENABLE APIS AND SERVICES"
3. Search for: `Google+ API`
4. Click on it and click "ENABLE"

### 1.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, click "CONFIGURE CONSENT SCREEN" first:
   - Choose "External" and click "CREATE"
   - Fill in:
     - App name: `RailPool`
     - User support email: your@email.com
     - Developer contact: your@email.com
   - Click "SAVE AND CONTINUE"
   - Skip optional scopes, click "SAVE AND CONTINUE"
   - Review and click "BACK TO DASHBOARD"

4. Now click "CREATE CREDENTIALS" → "OAuth client ID" again
5. Select "Web application"
6. Name: `RailPool Web Client`
7. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - Your production domain (e.g., `https://railpool.com`)

8. Add Authorized redirect URIs:
   - `http://localhost:3000/login`
   - `http://localhost:3000/dashboard`
   - Your production URLs

9. Click "CREATE"
10. Copy your **Client ID** (you'll need this)

---

## Step 2: Configure Frontend

### 2.1 Update .env.local
Edit `frontend/.env.local` and replace:
```
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

With your actual Client ID from step 1.10

### 2.2 Install Dependencies
```bash
cd frontend
npm install
```

---

## Step 3: Configure Backend

### 3.1 Update .env
Edit `backend/.env` and add:
```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

### 3.2 Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3.3 Update Database (if needed)
The User model has been updated with new fields:
- `google_id` - Google unique ID
- `avatar_url` - User's profile picture
- `oauth_provider` - OAuth provider name ('google')

To apply migrations (if using Alembic):
```bash
flask db upgrade
```

Or if using raw SQL, you can manually add columns:
```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

---

## 
Step 4: Test Google OAuth
### 4.1 Start Backend
```bash
cd backend
python run.py
```

### 4.2 Start Frontend
```bash
cd frontend
npm start
```

### 4.3 Test Login
1. Go to http://localhost:3000/login
2. Click the Google login button
3. Sign in with your Google account
4. You should be redirected to the dashboard as a new user

---

## How Google OAuth Works

### Frontend Flow
1. User clicks "Sign in with Google" button
2. Google sign-in dialog appears
3. User authenticates with Google
4. Frontend receives ID token from Google
5. ID token is sent to backend API (`POST /auth/google-login`)

### Backend Flow
1. Backend receives ID token
2. Verifies token signature and expiration using Google's public key
3. Extracts user info (email, name, picture, etc.)
4. Checks if user exists by `google_id`:
   - **If exists**: Updates user info and generates JWT
   - **If not exists**: Creates new user and generates JWT
5. Returns JWT token to frontend
6. Frontend stores JWT and redirects to dashboard

---

## Security Features

### ✅ Implemented
- Google token signature verification
- Token expiration checking
- Secure JWT generation for app sessions
- CORS protection
- HTTPOnly cookies (can be enabled)
- Rate limiting (can be added)

### ⚠️ To Add in Production
- Enable HTTPOnly, Secure, SameSite cookies
- Implement rate limiting on auth endpoints
- Add CSRF protection
- Use HTTPS only
- Implement account linking safeguards
- Add email verification

---

## Troubleshooting

### Issue: "Google Client ID not configured"
**Solution**: Make sure `REACT_APP_GOOGLE_CLIENT_ID` is set in `frontend/.env.local`

### Issue: "Invalid Google token"
**Solution**: 
- Check that Client ID matches between frontend `.env.local` and backend `.env`
- Verify Client ID is for Web application, not Native app
- Check token hasn't expired

### Issue: Button doesn't appear
**Solution**: 
- Check browser console for errors
- Verify @react-oauth/google is installed: `npm list @react-oauth/google`
- Clear cache and reinstall: `rm -rf node_modules && npm install`

### Issue: Can't login with existing email
**Solution**: 
- If a user already exists with that email from email/password signup, Google OAuth will link to that account
- User can then use either method to login

---

## Environment Variables Reference

### Frontend (.env.local)
```env
REACT_APP_GOOGLE_CLIENT_ID=<your-client-id>
REACT_APP_API_URL=http://localhost:5000
```

### Backend (.env)
```env
GOOGLE_CLIENT_ID=<your-client-id>
FLASK_ENV=development
FLASK_PORT=5000
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
```

---

## API Endpoints

### Google Login
```
POST /auth/google-login
Content-Type: application/json

{
  "token": "google-id-token"
}

Response:
{
  "message": "Google login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar_url": "https://...",
    "oauth_provider": "google",
    ...
  },
  "token": "jwt-token"
}
```

---

## Next Steps

1. ✅ Get Google Client ID
2. ✅ Configure frontend .env.local
3. ✅ Configure backend .env
4. ✅ Install dependencies
5. ✅ Test Google login
6. ⏳ (Optional) Add GitHub OAuth
7. ⏳ (Optional) Add email verification
8. ⏳ (Optional) Add account linking UI

---

## Reference Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [Google Auth Python Library](https://github.com/googleapis/google-auth-library-python)

---

**Status**: ✅ Implementation Complete | ⏳ Configuration Pending  
**Created**: April 4, 2026  
**Last Updated**: April 4, 2026
