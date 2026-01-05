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

### Per-Period Budgeting

- Set different budgets for different time periods
- Day budgets for daily spending limits
- Week budgets for weekly spending goals
- Month budgets for monthly financial planning
- Year budgets for annual financial targets
- Each period's budget is stored independently

### Transaction Management

- Full CRUD operations for transactions
- Category-based organization
- Custom category support
- Hide transactions from charts while keeping them in history
- Bulk delete operations for specific time periods

### PDF Reports

- Professional PDF generation using jsPDF
- Year view: Monthly summaries with budgets, transactions, and category breakdowns
- Month view: Weekly summaries with budgets, transactions, and category breakdowns
- Ready for printing or sharing

## License

This project is open source and available for personal and educational use.
