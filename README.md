# Finance Tracker

A full-stack personal finance management application to track income, expenses, and budgets with authentication and data visualization.

## Features

- **User Authentication**

  - Email/password sign up and login
  - Google Sign-In
  - Protected routes
  - User profile management with password change

- **Transaction Management**

  - Add, edit, and delete transactions
  - Categorize income and expenses
  - Filter by day, month, or year
  - View transaction history

- **Budget Tracking**

  - Set monthly budgets
  - Track spending vs budget
  - Visual budget progress indicator

- **Data Visualization**

  - Category breakdown charts
  - Income vs expense tracking
  - Time-based filtering

- **User Experience**
  - Dark/Light theme toggle
  - Responsive design
  - Clean, modern UI

## Tech Stack

**Frontend:**

- React 19
- React Router
- Firebase Authentication
- Recharts (data visualization)
- Lucide React (icons)
- CSS3

**Backend:**

- Next.js 16 (API Routes)
- Node.js
- MongoDB
- Firebase Admin SDK

**Deployment:**

- Vercel (frontend & backend)
- MongoDB Atlas
- Firebase

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database (MongoDB Atlas recommended)
- Firebase project

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd finance-tracker
   ```

2. Install dependencies:

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install firebase-admin
   ```

3. Set up environment variables:

   **Frontend** (`frontend/.env`):

   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

   **Backend** (`backend/.env.local`):

   ```
   MONGODB_URI=your-mongodb-connection-string
   FIREBASE_SERVICE_ACCOUNT_KEY=your-service-account-json
   ```

4. Set up Firebase:

   - Create a Firebase project
   - Enable Email/Password and Google authentication
   - Download service account key and save as `backend/service-account-key.json`
   - See [BACKEND_AUTH_SETUP.md](./BACKEND_AUTH_SETUP.md) for details

5. Run the application:

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

Visit `http://localhost:3001` in your browser.

## Project Structure

```
finance-tracker/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context (Auth, Theme)
│   │   ├── config/       # Firebase configuration
│   │   └── utils/        # Utility functions
│   └── public/
│
├── backend/           # Next.js API backend
│   ├── src/
│   │   ├── app/
│   │   │   └── api/      # API routes
│   │   └── lib/          # Database & auth utilities
│   └── public/
│
└── README.md
```

## API Endpoints

- `GET /api/transactions` - Get all transactions for authenticated user
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

All endpoints require Firebase authentication token in the Authorization header.

## Deployment

This app can be deployed to Vercel (recommended) or Netlify. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy to Vercel:**

1. Connect your GitHub repo to Vercel
2. Deploy backend first (set environment variables)
3. Deploy frontend (set environment variables)
4. Update frontend API URL if needed

**Live Demo:** [Add your deployed URL here]

## Screenshots

<!-- Add screenshots here -->

- Dashboard view
- Transaction management
- Budget tracking
- Category charts
