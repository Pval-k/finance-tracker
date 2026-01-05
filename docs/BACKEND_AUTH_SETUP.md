# Setting Up from GitHub

## First Time Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone <your-repo-url>
   cd finance-tracker
   cd frontend && npm install && cd ..
   cd backend && npm install firebase-admin && cd ..
   ```

2. Get Firebase service account key:

   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `backend/service-account-key.json`

3. Create frontend `.env` file:

   - Copy your Firebase config from Firebase Console
   - Create `frontend/.env` with your Firebase keys

4. Run:

   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm start
   ```

