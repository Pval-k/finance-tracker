# Finance Tracker

A full-stack personal finance management application to track income, expenses, and budgets with AI-powered insights, authentication, and comprehensive data visualization.

## Features

### User Authentication

- **Email/Password Authentication** - Secure sign up and login
- **Google Sign-In** - One-click authentication with Google
- **Protected Routes** - Secure access to all financial data
- **User Profile Management** - Update name and change password
- **Session Management** - Persistent login state

### Transaction Management

- **Add Transactions** - Record income and expenses with categories
- **Edit Transactions** - Update transaction details anytime
- **Delete Transactions** - Remove individual or bulk transactions
- **Transaction Categories** - Food, Transportation, Entertainment, Rent, Shopping, Bills, Salary, Other, and custom categories
- **Hide from Chart** - Hide specific transactions from category breakdown while keeping them in the list
- **Show/Hide Toggle** - Easily toggle visibility of hidden transactions
- **Transaction History** - Complete history of all financial transactions

### Budget Tracking

- **Per-Period Budgets** - Set independent budgets for Day, Week, Month, and Year
- **Budget Progress** - Visual progress bar showing spending vs budget
- **Budget Statistics** - Real-time display of spent amount and remaining budget
- **Budget Status** - Clear indicators for over/under budget status
- **Budget Persistence** - Budgets saved per period in localStorage

### AI-Powered Budget Insights

- **Smart Spending Analysis** - AI analyzes discretionary spending (Entertainment, Shopping, Food, Transportation)
- **Weekly Pattern Detection** - Identifies high-spending weeks within the month
- **Actionable Recommendations** - Provides tips to reduce unnecessary spending
- **Automatic Fallback** - Gracefully falls back to basic insights when AI credits expire
- **Budget Status Tracking** - Shows over/under budget amounts with visual indicators

### Data Visualization

- **Category Breakdown Chart** - Interactive pie chart showing spending by category
- **Category Percentages** - Visual representation of spending distribution
- **Real-time Updates** - Charts update automatically as transactions change
- **Hidden Transaction Support** - Charts exclude hidden transactions for accurate analysis

### Time-Based Filtering

- **Day View** - View transactions for a specific day
- **Week View** - View transactions for a specific week (Sunday to Saturday)
- **Month View** - View transactions for a specific month
- **Year View** - View transactions for the entire year
- **Date Navigation** - Easy navigation between periods with arrow buttons
- **Go to Today** - Quick button to jump to current period
- **Period-Specific Budgets** - Each time period can have its own budget

### PDF Reports

- **Year View PDF** - Comprehensive annual report with:
  - Monthly budget summaries
  - Monthly transaction lists
  - Category breakdown percentages
  - Total spending per month
- **Month View PDF** - Detailed monthly report with:
  - Weekly budget summaries
  - Weekly transaction lists
  - Category breakdown percentages
  - Total spending per week
- **Professional Formatting** - Clean, organized PDF reports ready for sharing or printing

### User Experience

- **Dark/Light Theme** - Toggle between themes with persistent preference
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with smooth animations
- **Accessible Design** - User-friendly navigation and clear visual feedback

### Profile & Settings

- **Profile Management** - Update display name
- **Password Change** - Secure password updates for email/password users
- **Clear All History** - Option to delete all transactions (with confirmation)
- **PDF Downloads** - Generate and download spending reports

## Tech Stack

### Frontend

- **React 19** - Modern React with hooks
- **React Router** - Client-side routing
- **Firebase Authentication** - Secure user authentication
- **Recharts** - Data visualization library
- **Lucide React** - Icon library
- **jsPDF & jsPDF-AutoTable** - PDF generation
- **CSS3** - Custom styling with CSS variables

### Backend

- **Next.js 16** - React framework with API routes
- **Node.js** - Server-side runtime
- **MongoDB** - NoSQL database for transaction storage
- **Firebase Admin SDK** - Server-side authentication verification
- **OpenAI API** - AI-powered budget insights (GPT-4o-mini)

### Deployment

- **Vercel** - Frontend and backend hosting
- **MongoDB Atlas** - Cloud database
- **Firebase** - Authentication and user management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database (MongoDB Atlas recommended)
- Firebase project
- OpenAI API key (optional, for AI insights)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd finance-tracker
   ```

2. **Install dependencies:**

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Set up environment variables:**

   **Frontend** (`frontend/.env`):

   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_API_URL=http://localhost:3000
   ```

   **Backend** (`backend/.env.local`):

   ```
   MONGODB_URI=your-mongodb-connection-string
   OPENAI_API_KEY=your-openai-api-key (optional)
   ```

   **Note:** For Firebase authentication, download the service account key and save as `backend/service-account-key.json`

4. **Run the application:**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

Visit `http://localhost:3000` in your browser.

## Project Structure

```
finance-tracker/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   │   ├── BudgetCard/
│   │   │   │   ├── BudgetInsights/
│   │   │   │   ├── CategoryChart/
│   │   │   │   ├── Header/
│   │   │   │   ├── TimeFilters/
│   │   │   │   └── Dashboard/
│   │   │   ├── transaction/     # Transaction components
│   │   │   ├── forms/           # Form components
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/               # Page components
│   │   │   ├── AddTransaction/
│   │   │   ├── Login/
│   │   │   └── Profile/
│   │   ├── context/             # React context (Auth, Theme)
│   │   ├── config/              # Configuration files
│   │   └── utils/               # Utility functions
│   └── public/
│
├── backend/                     # Next.js API backend
│   ├── src/
│   │   ├── app/
│   │   │   └── api/             # API routes
│   │   │       ├── transactions/
│   │   │       └── budget-insights/
│   │   └── lib/                 # Database & auth utilities
│   └── service-account-key.json
│
└── docs/                       # Documentation
    ├── AI_SETUP.md
    ├── BACKEND_AUTH_SETUP.md
    └── DEPLOYMENT.md
```

## API Endpoints

- `GET /api/transactions` - Get all transactions for authenticated user
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `POST /api/budget-insights` - Get AI-powered budget insights

All endpoints require Firebase authentication token in the Authorization header.

## Database Schema

### Transaction Document Structure

Transactions are stored in MongoDB with the following structure:

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated ID
  userId: String,             // Firebase user ID (from JWT token)
  title: String,              // Transaction description (e.g., "Grocery Shopping")
  amount: Number,             // Transaction amount (positive number)
  category: String,           // Category name (e.g., "Food", "Entertainment")
  type: String,               // "income" or "expense"
  date: String,               // Date in "YYYY-MM-DD" format
  createdAt: Date            // Timestamp when transaction was created
}
```

**Key Points:**

- **User Isolation**: Every transaction includes `userId` to ensure users can only access their own data
- **Date Format**: Dates are stored as "YYYY-MM-DD" strings for consistency and easy filtering
- **Amount**: Always stored as a positive number; the `type` field indicates income vs expense
- **Categories**: Predefined categories include Food, Transportation, Entertainment, Rent, Shopping, Bills, Salary, Other, plus custom categories
- **Indexing**: The `userId` field is used in all queries for efficient data retrieval

**Example Transaction:**

```javascript
{
  _id: "507f1f77bcf86cd799439011",
  userId: "firebase-user-123",
  title: "Starbucks Coffee",
  amount: 5.50,
  category: "Food",
  type: "expense",
  date: "2025-01-15",
  createdAt: ISODate("2025-01-15T10:30:00Z")
}
```

## Documentation

- **[AI_SETUP.md](./docs/AI_SETUP.md)** - Complete guide for setting up AI Budget Insights
- **[BACKEND_AUTH_SETUP.md](./docs/BACKEND_AUTH_SETUP.md)** - Backend authentication setup instructions
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide for Vercel

## Deployment

This app can be deployed to Vercel (recommended). See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**

1. Connect your GitHub repo to Vercel
2. Deploy backend first (set environment variables)
3. Deploy frontend (set environment variables)
4. Update frontend API URL to point to deployed backend

## Key Features in Detail

### AI Budget Insights

- Analyzes spending patterns using OpenAI GPT-4o-mini
- Identifies unnecessary spending in Entertainment, Shopping, Food, and Transportation
- Detects weekly spending patterns
- Provides actionable recommendations
- Automatically falls back to basic insights when AI credits expire

#### How AI Insights Work (Beginner-Friendly Explanation)

The AI insights feature works by building a detailed prompt from your spending data and sending it to OpenAI's API. Here's how it works step-by-step:

**Step 1: Gathering the Data**

Before calling the AI, the system calculates several key numbers from your transactions:

- `budget` - How much money you planned to spend
- `currentTotal` - How much you actually spent
- `overBudget` - The difference (positive = over budget, negative = under budget)
- `budgetPercentage` - What percentage of your budget you used (like 150% = way over)
- `discretionarySpending` - Spending on "fun" stuff (Food, Entertainment, Transportation, Shopping)
- `weeklyBreakdown` - If viewing a month, how much you spent each week
- `previousCategories` - What you spent last period (for comparison)

**Step 2: Building the Prompt**

The `buildAIPrompt()` function creates a text message (called a "prompt") that tells the AI what to analyze. Think of it like writing a letter to a financial advisor. The prompt includes:

- Basic budget information (your budget, current spending, status)
- Discretionary spending breakdown (which "fun" categories you spent on)
- Weekly breakdown (if viewing a month, which weeks had the highest spending)
- Previous period comparison (how your spending compares to last period)
- Instructions on how to respond (friendly, conversational, actionable)

**Step 3: Sending to OpenAI**

The prompt is sent to OpenAI's GPT-4o-mini model with these settings:

- `max_tokens: 250` - Limits the response length
- `temperature: 0.7` - Controls creativity (0.7 = balanced, not too creative, not too robotic)

**Step 4: Processing the Response**

The AI returns text insights like "You're spending too much on Entertainment. Try cutting it by $50 this month." The code then:

- Splits the response into individual lines
- Removes empty lines and formatting
- Takes only the first 3 insights
- Returns them as a clean list

**Step 5: Fallback Mechanism**

If the AI API fails (e.g., no credits remaining), the system automatically uses `generateFallbackInsights()` to create basic insights without AI. This ensures users always get helpful information, even when AI isn't available.

**The Complete Flow:**

1. User views dashboard → Frontend requests insights
2. Backend fetches transactions from MongoDB
3. Backend calculates spending statistics
4. Backend builds AI prompt with all the data
5. Backend sends prompt to OpenAI API
6. OpenAI analyzes and returns insights
7. Backend processes response into clean list
8. Frontend displays insights in the Budget Insights card

This entire process happens automatically whenever you view your dashboard with a budget set.

### Per-Period Budgeting

- Set different budgets for different time periods
- Day budgets for daily spending limits
- Week budgets for weekly spending goals
- Month budgets for monthly financial planning
- Year budgets for annual financial targets
- Each period's budget is stored independently

#### How Per-Period Budgeting Works

The budgeting system allows you to set completely independent budgets for each time period (day, week, month, year). Here's how it works:

**Storage System:**

Budgets are stored in the browser's `localStorage` with unique keys based on the period type and date. The key format ensures each period has its own budget:

- **Day Budget**: `budget-day-YYYY-MM-DD` (e.g., `budget-day-2025-01-15`)
- **Week Budget**: `budget-week-YYYY-MM-DD` (e.g., `budget-week-2025-01-12`) - Uses the week's start date (Sunday)
- **Month Budget**: `budget-month-YYYY-MM` (e.g., `budget-month-2025-01`)
- **Year Budget**: `budget-year-YYYY` (e.g., `budget-year-2025`)

**How It Works:**

1. When you set a budget, the system generates a unique key based on the current time filter and selected date
2. The budget value is saved to `localStorage` with that key
3. When you switch between periods (day/week/month/year) or navigate to different dates, the system:
   - Generates the appropriate key for that period
   - Loads the budget from `localStorage` if it exists
   - Displays "No budget set" if no budget exists for that period
4. Each period maintains its own budget independently - setting a $1000 monthly budget doesn't affect your weekly or daily budgets

**Example:**

- January 2025: $3000 monthly budget
- Week of Jan 5-11: $500 weekly budget
- January 15, 2025: $100 daily budget

All three budgets coexist and are tracked separately. This allows for flexible financial planning where you might have different spending goals for different time scales.

### Transaction Management

- Full CRUD operations for transactions
- Category-based organization
- Custom category support
- Hide transactions from charts while keeping them in history
- Bulk delete operations for specific time periods

#### Authentication Flow (How Security Works)

The application uses Firebase Authentication with JWT tokens to secure all API requests. Here's the complete flow:

**Frontend Authentication:**

1. **User Login**: User signs in with email/password or Google OAuth via Firebase
2. **Token Generation**: Firebase generates a JWT (JSON Web Token) ID token for the authenticated user
3. **Token Storage**: Firebase SDK automatically manages the token in the browser
4. **API Requests**: Every API call uses `authenticatedFetch()` which:
   - Gets the current user from Firebase Auth
   - Retrieves the ID token using `user.getIdToken()`
   - Adds the token to the request header: `Authorization: Bearer <token>`

**Backend Verification:**

1. **Token Extraction**: The backend receives the request and extracts the token from the `Authorization` header
2. **Token Verification**: The `verifyToken()` function uses Firebase Admin SDK to:
   - Verify the token signature (ensures it's from your Firebase project)
   - Check token expiration (tokens expire after 1 hour)
   - Validate token hasn't been revoked
   - Extract the user ID (`uid`) from the token
3. **Authorization**: If verification succeeds, the API uses the `userId` to:
   - Fetch only that user's transactions from MongoDB
   - Ensure users can only access their own data
4. **Error Handling**: If verification fails, the API returns `401 Unauthorized`

**Security Features:**

- **Token Expiration**: Tokens automatically expire after 1 hour, requiring re-authentication
- **Token Refresh**: Firebase SDK automatically refreshes tokens when needed
- **Server-Side Verification**: All verification happens on the backend - tokens can't be forged
- **User Isolation**: Each user can only access their own data via `userId` filtering in database queries

**The Complete Request Flow:**

```
User Action → Frontend gets Firebase token → API request with token
→ Backend verifies token → Backend extracts userId → Database query filtered by userId
→ Response with user's data only
```

This ensures that even if someone intercepts API requests, they can't access other users' data without a valid, unexpired token.

### PDF Reports

- Professional PDF generation using jsPDF
- Year view: Monthly summaries with budgets, transactions, and category breakdowns
- Month view: Weekly summaries with budgets, transactions, and category breakdowns
- Ready for printing or sharing

#### Time-Based Filtering and Date Handling

The application supports viewing transactions across different time periods with precise date filtering. Here's how it works:

**Date Filtering Logic:**

The system filters transactions based on the selected time period and date:

- **Day View**: Shows transactions for a specific day (00:00:00 to 23:59:59)
- **Week View**: Shows transactions from Sunday 00:00:00 to Saturday 23:59:59
- **Month View**: Shows transactions from the 1st of the month to the last day
- **Year View**: Shows transactions from January 1st to December 31st

**Timezone Handling:**

A critical feature is proper timezone handling. Transactions are stored with dates in "YYYY-MM-DD" format. The filtering logic ensures:

1. **Date Parsing**: When a transaction date is stored as "YYYY-MM-DD", it's parsed as a local date (not UTC)
2. **Date Comparison**: Filtering uses local date comparisons to avoid timezone shifts
3. **Consistency**: A transaction added on January 5th will appear in:
   - Day view for January 5th
   - Week view for the week containing January 5th
   - Month view for January
   - Year view for the year

**How It Works:**

1. **Period Calculation**: Based on the selected date and time filter, the system calculates:

   - `startDate`: The beginning of the period (e.g., first day of month)
   - `endDate`: The end of the period (e.g., first day of next month)

2. **Transaction Filtering**: Each transaction's date is compared:

   - If stored as "YYYY-MM-DD" string: Parsed as local date
   - If stored as Date object: Used directly
   - Transaction is included if: `transactionDate >= startDate && transactionDate < endDate`

3. **Week Calculation**: For week view, the system:
   - Finds the Sunday of the selected date's week
   - Calculates the 7-day range from that Sunday
   - Filters transactions within that range

**Example:**

If you add a transaction on January 15, 2025:

- It appears in **Day view** for January 15, 2025
- It appears in **Week view** for the week containing January 15 (e.g., Jan 12-18 if Jan 12 is Sunday)
- It appears in **Month view** for January 2025
- It appears in **Year view** for 2025

This ensures consistent data visibility across all time period views.

## License

This project is open source and available for personal and educational use.
