# AI Budget Insights Setup Guide

## ✅ Code Implementation Complete!

All the code has been implemented. Now you just need to:

1. **Get your OpenAI API key**
2. **Install the package**
3. **Add the API key to environment variables**

---

## Step 1: Get OpenAI API Key

1. **Sign up/Login to OpenAI:**
   - Go to https://platform.openai.com/
   - Sign up or log in (use Google/GitHub or email)
   - Verify your email if needed

2. **Create API Key:**
   - Go to https://platform.openai.com/api-keys
   - Click **"Create new secret key"**
   - Name it: `Finance Tracker` (or any name you like)
   - **IMPORTANT:** Copy the key immediately (starts with `sk-proj-...`)
     - ⚠️ You'll only see it once! Save it somewhere safe.

3. **Set Spending Limit (OPTIONAL - Two Options):**

   **Option A: Set $0 Limit (Recommended for Safety)**
   - Go to https://platform.openai.com/account/billing/limits
   - ⚠️ **Note:** OpenAI requires a payment method to set limits (even $0)
   - If you see "You must be on a paid plan to manage usage limits":
     - Go to https://platform.openai.com/account/billing/payment-methods
     - Add a payment method (credit card)
     - Then go back to limits and set **Hard Limit** to **$0.00**
     - ✅ **Safe:** Setting limit to $0 means you won't be charged
   - This prevents any charges after your free credits run out

   **Option B: Use Free Credits Only (No Payment Method Needed)**
   - Skip setting limits entirely
   - Just use your free credits
   - ✅ **Safe:** Our code automatically falls back to basic insights when credits run out
   - No charges will occur (you can't be charged without a payment method)

---

## Step 2: Install OpenAI Package

Open your terminal and run:

```bash
cd backend
npm install
```

This will install the `openai` package that was added to `package.json`.

---

## Step 3: Add API Key to Environment Variables

### For Local Development:

1. **Create/Edit** `backend/.env.local` file:

```bash
cd backend
# Create the file if it doesn't exist
touch .env.local
```

2. **Add your OpenAI API key** to the file:

```
OPENAI_API_KEY=sk-proj-your-actual-key-here
MONGODB_URI=your-mongodb-uri
FIREBASE_SERVICE_ACCOUNT_KEY=your-firebase-key
```

**Replace** `sk-proj-your-actual-key-here` with your actual API key from Step 1.

### For Vercel Deployment:

1. Go to your Vercel dashboard
2. Select your **backend** project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Your API key (starts with `sk-proj-...`)
   - **Environment:** Production, Preview, Development (select all)
5. Click **Save**

---

## Step 4: Test It Out!

1. **Start your backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start your frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test the feature:**
   - Log into your app
   - Set a budget in the BudgetCard
   - Add some transactions (especially Entertainment, Shopping, Food, Transport)
   - You should see **"Budget Insights"** card in the sidebar
   - It will show AI-generated insights about your spending!

---

## How It Works

### When You Have Free Credits:
- ✅ Shows AI-generated insights
- ✅ Analyzes discretionary spending
- ✅ Identifies weekly patterns
- ✅ Provides actionable recommendations

### When Credits Run Out:
- ✅ Automatically switches to basic insights (no errors!)
- ✅ Still shows budget status and category analysis
- ✅ Shows a small badge indicating "basic insights mode"
- ✅ App continues working perfectly

---

## Troubleshooting

### "Failed to load insights" error:
- Check that `OPENAI_API_KEY` is set in `backend/.env.local`
- Make sure you ran `npm install` in the backend folder
- Check backend console for error messages

### "AI API key not configured":
- Make sure your `.env.local` file exists in the `backend` folder
- Restart your backend server after adding the key
- Check that the key starts with `sk-proj-`

### Insights not showing:
- Make sure you have a budget set (click Edit on BudgetCard)
- Add some expense transactions
- Check browser console for errors

---

## Cost Information

- **Free Credits:** OpenAI gives you free credits when you sign up ($5-18 worth)
- **After Free Credits:** 
  - **Option A:** With $0 hard limit set, you won't be charged
  - **Option B:** Without payment method, you can't be charged (API will just fail, our code handles it)
- **Per Insight:** ~$0.0002 per insight (very cheap!)
- **Monthly Estimate:** ~$1-5 for moderate usage

### Important Notes:
- ✅ **No payment method = No charges possible** (you can't be billed)
- ✅ **$0 limit = No charges** (even with payment method)
- ✅ **Our code handles both scenarios** - automatically falls back when credits expire

---

## Files Created/Modified

✅ `backend/package.json` - Added `openai` dependency
✅ `backend/src/app/api/budget-insights/route.js` - Backend API route
✅ `frontend/src/components/dashboard/BudgetInsights.js` - React component
✅ `frontend/src/components/dashboard/BudgetInsights.css` - Styling
✅ `frontend/src/components/dashboard/Dashboard.js` - Integrated component

---

## You're All Set! 🎉

Once you complete Steps 1-3, your AI Budget Insights feature will be live!

The feature will:
- ✅ Use AI while you have free credits
- ✅ Automatically fallback to basic insights when credits expire
- ✅ Never charge you (no payment method = no charges, or $0 limit = no charges)
- ✅ Provide valuable insights to help reduce unnecessary spending

### What Happens When Credits Run Out?
- API calls will fail gracefully
- Code automatically switches to basic insights (no errors shown to user)
- App continues working perfectly
- Shows a small badge indicating "basic insights mode"

