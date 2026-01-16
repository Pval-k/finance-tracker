# Finance Tracker

A full-stack personal finance management application with AI-powered budget insights, real-time transaction tracking, and comprehensive data visualization. Built with React and Firebase Cloud Functions, with frontend deployed on Firebase Hosting.

**Live Demo:** [https://finance-tracker-526d4.web.app](https://finance-tracker-526d4.web.app)

> **Note:** Both frontend and backend are now fully deployed on Firebase. The frontend is hosted on Firebase Hosting, and the backend API runs on Firebase Cloud Functions with automatic scaling.

## Architecture Overview

### Frontend (React)

- Single-page application built with React 19
- Client-side routing with React Router
- Firebase Authentication integration
- Real-time data visualization with Recharts
- Responsive design with CSS variables for theming
- PDF generation for financial reports

### Backend (Firebase Cloud Functions)

- Serverless Express.js API running on Firebase Cloud Functions
- RESTful endpoints for transaction CRUD operations
- JWT token verification using Firebase Admin SDK
- MongoDB Atlas integration for data persistence
- OpenAI API integration for AI-powered budget insights
- Automatic fallback when AI credits expire

### Infrastructure

- **Frontend Deployment:** Firebase Hosting (CDN, HTTPS, global distribution) - Deployed
- **Backend Deployment:** Firebase Cloud Functions (serverless, auto-scaling) - Configured, requires Blaze plan for deployment
- **Authentication:** Firebase Authentication (Email/Password, Google OAuth)
- **Database:** MongoDB Atlas (cloud-hosted, user-isolated data)
- **CI/CD:** GitHub Actions (automated testing and deployment for frontend)

## Key Features

### Authentication & Security

- Firebase Authentication with JWT tokens
- Email/Password and Google OAuth sign-in
- Protected routes with authentication middleware
- Server-side token verification on all API requests
- User-isolated data access (each user can only access their own transactions)

### Transaction Management

- Full CRUD operations (Create, Read, Update, Delete)
- Category-based organization (Food, Transportation, Entertainment, Rent, etc.)
- Custom category support
- Income and expense tracking
- Transaction hiding for charts while maintaining history
- Bulk operations for time-period views

### Budget Tracking

- Per-period budget system (Day, Week, Month, Year)
- Independent budgets for each time period
- Real-time budget progress indicators
- Visual progress bars and percentage displays
- Budget persistence using localStorage

### AI-Powered Insights

- OpenAI GPT-4o-mini integration for spending analysis
- Discretionary spending detection (Entertainment, Shopping, Food, Transportation)
- Weekly spending pattern identification
- Actionable recommendations for budget optimization
- Automatic fallback to rule-based insights when AI is unavailable
- Error handling and graceful degradation

### Data Visualization

- Interactive pie charts showing spending by category
- Real-time chart updates as transactions change
- Category percentage breakdowns
- Responsive charts that adapt to screen size

### Time-Based Filtering

- Day, Week, Month, and Year views
- Date range filtering with precise period calculations
- Timezone-aware date handling
- Navigation between periods with intuitive controls
- Period-specific budget tracking

### PDF Reports

- Comprehensive annual reports with monthly breakdowns
- Detailed monthly reports with weekly summaries
- Professional formatting using jsPDF and jsPDF-AutoTable
- Transaction lists, category percentages, and budget summaries

## How It Works

### Authentication Flow

1. User signs in with Firebase Authentication (Email/Password or Google)
2. Firebase generates a JWT ID token for the authenticated user
3. Frontend stores the token and includes it in all API requests via `Authorization: Bearer <token>` header
4. Backend verifies the token using Firebase Admin SDK
5. Backend extracts user ID from the token for data isolation
6. All database queries filter by user ID to ensure data security

### Transaction Flow

1. User creates a transaction through the React frontend
2. Frontend sends POST request to `/api/transactions` with transaction data and auth token
3. Backend Cloud Function verifies the token and extracts user ID
4. Backend connects to MongoDB and inserts transaction with user ID
5. Backend returns success response
6. Frontend refreshes transaction list and updates charts

### AI Insights Flow

1. User sets a budget and views dashboard
2. Frontend sends POST request to `/api/budget-insights` with budget and time period
3. Backend fetches user's transactions from MongoDB for the selected period
4. Backend calculates spending statistics (totals, categories, weekly breakdowns)
5. Backend builds a detailed prompt with spending data
6. Backend sends prompt to OpenAI GPT-4o-mini API
7. AI returns conversational insights about spending patterns
8. Backend processes response and returns 2-3 actionable insights
9. If AI fails (e.g., no credits), backend automatically uses fallback rule-based insights
10. Frontend displays insights in the Budget Insights card

### Budget System

Budgets are stored in browser localStorage with unique keys:

- Day: `budget-day-YYYY-MM-DD`
- Week: `budget-week-YYYY-MM-DD` (uses week's start date)
- Month: `budget-month-YYYY-MM`
- Year: `budget-year-YYYY`

Each period maintains its own independent budget. When switching periods or dates, the system loads the appropriate budget from localStorage.

### Time-Based Filtering

The system filters transactions based on selected time period and date:

- Calculates start and end dates for the period (handles timezones correctly)
- Queries MongoDB with date range filters
- Transactions are stored with "YYYY-MM-DD" format for consistency
- Filtering uses local date comparisons to avoid timezone shifts

## Tech Stack

### Frontend

- **React 19** - Modern React with hooks and functional components
- **React Router** - Client-side navigation and protected routes
- **Firebase SDK** - Authentication and client-side Firebase integration
- **Recharts** - Interactive data visualization library
- **jsPDF & jsPDF-AutoTable** - Client-side PDF generation
- **Lucide React** - Icon library
- **CSS3** - Custom styling with CSS variables for theming

### Backend

- **Firebase Cloud Functions** - Serverless backend (Node.js 18 runtime)
- **Express.js** - REST API framework
- **Firebase Admin SDK** - Server-side authentication and admin operations
- **MongoDB** - NoSQL database for transaction storage
- **OpenAI API** - GPT-4o-mini for AI-powered insights

### DevOps & Infrastructure

- **Firebase Hosting** - Static site hosting with CDN
- **Firebase Cloud Functions** - Serverless function hosting (configured, requires Blaze plan for deployment)
- **MongoDB Atlas** - Managed cloud database
- **GitHub Actions** - CI/CD pipeline for automated deployments
- **Firebase CLI** - Deployment and project management

## Project Structure

```
finance-tracker/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components (dashboard, transactions, forms)
│   │   ├── pages/         # Page components (Login, AddTransaction, Profile)
│   │   ├── context/       # React context providers (Auth, Theme)
│   │   ├── config/        # Configuration files (Firebase, API)
│   │   └── utils/         # Utility functions (API calls, helpers)
│   └── public/            # Static assets
│
├── backend/               # Firebase Cloud Functions
│   ├── routes/            # Express route handlers
│   │   ├── transactions.js    # Transaction CRUD endpoints
│   │   └── budget-insights.js # AI insights endpoint
│   ├── lib/               # Utilities
│   │   └── mongodb.js     # MongoDB connection
│   └── index.js           # Main entry point (Express app exported as Cloud Function)
│
├── firebase.json          # Firebase deployment configuration
├── .firebaserc            # Firebase project settings
└── README.md              # This file
```

## API Endpoints

All endpoints require Firebase authentication token in the `Authorization: Bearer <token>` header.

- `GET /api/transactions` - Get all transactions for authenticated user
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `POST /api/budget-insights` - Get AI-powered budget insights

## Database Schema

Transactions are stored in MongoDB with this structure:

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated ID
  userId: String,             // Firebase user ID (from JWT token)
  title: String,              // Transaction description
  amount: Number,             // Transaction amount (positive number)
  category: String,           // Category name
  type: String,               // "income" or "expense"
  date: String,               // Date in "YYYY-MM-DD" format
  createdAt: Date            // Timestamp when created
}
```

**Key Points:**

- Every transaction includes `userId` for user isolation
- Dates stored as "YYYY-MM-DD" strings for consistent filtering
- Amount always positive; `type` field indicates income vs expense
- `userId` field used in all queries for efficient data retrieval

## Technical Highlights

### Serverless Architecture

- Backend designed to run on Firebase Cloud Functions (configured and tested locally)
- No server management required when deployed
- Automatic scaling based on traffic (when deployed)
- Pay-per-use pricing model (requires Firebase Blaze plan)
- Currently runs locally via Firebase emulators for development

### Security

- JWT-based authentication with Firebase
- Server-side token verification on all requests
- User data isolation at the database level
- Protected API endpoints with authentication middleware

### Error Handling

- Graceful fallback when AI API fails
- Comprehensive error handling in API routes
- User-friendly error messages in frontend
- Automatic token refresh by Firebase SDK

### Performance

- Client-side caching with localStorage for budgets
- Optimized MongoDB queries with indexed user IDs
- CDN distribution for static assets via Firebase Hosting
- Lazy loading and code splitting in React

### CI/CD Pipeline

- Automated testing on pull requests
- Automatic deployment to Firebase Hosting on push to main branch
- Environment variable management via GitHub Secrets
- Build optimization and dependency caching

