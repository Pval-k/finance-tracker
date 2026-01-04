# Deployment Guide

## Quick Deploy (Recommended: Vercel Dashboard)

### Step 1: Deploy Backend

1. **Push code to GitHub** (if not already)

2. **Connect to Vercel**:

   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory**: Set to `backend`
   - Framework Preset: Next.js (auto-detected)

3. **Set Environment Variables** in Vercel:

   - `MONGODB_URI` = your MongoDB connection string
   - `FIREBASE_SERVICE_ACCOUNT_KEY` = your Firebase service account JSON (paste entire JSON as one line)

4. **Deploy** - Click "Deploy"

5. **Copy your backend URL** (e.g., `https://your-backend.vercel.app`)

### Step 2: Deploy Frontend

1. **Add New Project** in Vercel (same account)

2. **Import the same GitHub repo** but:

   - **Root Directory**: Set to `frontend`
   - Framework Preset: Create React App

3. **Set Environment Variables**:

   - All your `REACT_APP_*` variables from `.env`
   - `REACT_APP_API_URL` = your backend URL from Step 1 (e.g., `https://your-backend.vercel.app`)

4. **Build Settings**:

   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

5. **Deploy** - Click "Deploy"

### Alternative: Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Deploy backend**:

   ```bash
   cd backend
   vercel
   # Follow prompts, set environment variables when asked
   ```

3. **Deploy frontend**:
   ```bash
   cd frontend
   vercel
   # Follow prompts, set environment variables when asked
   ```

## Frontend Deployment (Vercel or Netlify)

### Option 1: Vercel

1. **Deploy**:

   ```bash
   cd frontend
   vercel
   ```

   Or connect GitHub repo to Vercel.

2. **Set environment variables** in Vercel dashboard (same as `.env` file)

3. **Build settings**:
   - Build command: `npm run build`
   - Output directory: `build`
   - Install command: `npm install`

### Option 2: Netlify

1. **Connect GitHub repo** to Netlify

2. **Build settings**:

   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

3. **Environment variables**: Add all `REACT_APP_*` variables from `.env`

4. **Update API URL**: Point to your deployed backend URL

## MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Whitelist IP addresses (or 0.0.0.0/0 for Vercel)
5. Add connection string to environment variables

## Firebase Setup

1. Enable Authentication (Email/Password and Google)
2. Download service account key
3. Add to backend environment variables
