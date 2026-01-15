# Setup & Deployment Guide

This guide explains how to set up the Finance Tracker application for local development and production deployment.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB database (MongoDB Atlas recommended)
- Firebase project
- OpenAI API key (optional, for AI insights)

## Initial Setup

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Firebase Setup

1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Note your Project ID
3. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```
4. Enable Firebase Authentication (Email/Password, Google)

### 3. Configure Environment Variables

#### Frontend Environment Variables

Create `frontend/.env.local` for local development:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5001
REACT_APP_USE_EMULATOR=true
```

Create `frontend/.env.production` for production builds:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=your-backend-api-url
```

Find these values: Firebase Console → Project Settings → General → Your apps → Web app → Config

#### Backend Environment Variables

For local development, create `backend/.env`:

```env
MONGODB_URI=your-mongodb-connection-string
OPENAI_API_KEY=your-openai-api-key  # Optional
```

## Local Development

### Start Firebase Emulators

```bash
# From project root
firebase emulators:start
```

This starts:
- Functions emulator on `http://localhost:5001`
- Other emulators as configured

### Run Frontend

In a separate terminal:

```bash
cd frontend
npm start
```

The app will run on `http://localhost:3000`

## Production Deployment

### Manual Deployment

#### Option 1: Use Deployment Script

```bash
./deploy.sh
```

The script will:
- Check Firebase CLI installation
- Verify Firebase login
- Install dependencies
- Build frontend
- Configure environment variables (if needed)
- Deploy to Firebase

#### Option 2: Manual Deployment

1. Build frontend:
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

### Verify Deployment

After deployment, your app will be available at:
- Frontend: `https://your-project-id.web.app`
- Backend API: `https://us-central1-your-project-id.cloudfunctions.net/api`

## CI/CD with GitHub Actions

### Setup GitHub Secrets

1. Get Firebase token:
   ```bash
   firebase login:ci
   # Copy the token
   ```

2. Add GitHub Secrets:
   - Go to Repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `FIREBASE_TOKEN` - Token from `firebase login:ci`
     - `REACT_APP_FIREBASE_API_KEY`
     - `REACT_APP_FIREBASE_AUTH_DOMAIN`
     - `REACT_APP_FIREBASE_PROJECT_ID`
     - `REACT_APP_FIREBASE_STORAGE_BUCKET`
     - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
     - `REACT_APP_FIREBASE_APP_ID`
     - `REACT_APP_API_URL`

3. Push to main branch to trigger automatic deployment

## Troubleshooting

### Firebase CLI not found
```bash
npm install -g firebase-tools
firebase login
```

### Frontend build fails
- Verify all `REACT_APP_*` environment variables are set
- Check for missing dependencies: `npm install`
- Review build errors in console

### CORS errors
- Check that `REACT_APP_API_URL` points to your backend API URL
- Ensure CORS is enabled in `backend/index.js` (if using backend)

### Authentication not working
- Verify Firebase Auth is enabled in Console
- Check all `REACT_APP_FIREBASE_*` environment variables
- Verify Auth domain is whitelisted in Firebase Console

### MongoDB connection issues
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist (allow all IPs or Firebase IPs)
- Ensure database name is "finance-tracker"

### AI insights not working
- Check OpenAI API key is set in `backend/.env`
- Verify key is valid and has credits
- App will fall back to basic insights if AI fails (this is normal)

## Environment Variables Reference

### Frontend (.env files)

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key | Yes |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `REACT_APP_API_URL` | Backend API URL | Yes |
| `REACT_APP_USE_EMULATOR` | Use Firebase emulator (set to "true") | No (dev only) |

### Backend (Local Development)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No (optional) |

## Quick Reference

### Common Commands

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Start local development
firebase emulators:start  # Terminal 1
cd frontend && npm start  # Terminal 2

# Build for production
cd frontend && npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### File Locations

- Frontend config: `frontend/.env.local` (dev) or `frontend/.env.production` (prod)
- Backend config: `backend/.env` (local development)
- Firebase project: `.firebaserc`
- Firebase deployment: `firebase.json`

