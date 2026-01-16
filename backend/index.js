const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Load environment variables from .env.local if it exists (for local development)
if (process.env.NODE_ENV !== "production") {
  try {
    const path = require("path");
    require("dotenv").config({ path: path.join(__dirname, ".env.local") });
  } catch (e) {
    // .env.local might not exist, that's okay
  }
}

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// Handle OPTIONS preflight requests FIRST, before any other middleware
// This must be at the very top to catch CORS preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '3600');
  res.sendStatus(204);
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    origin: req.headers.origin,
    'access-control-request-method': req.headers['access-control-request-method']
  });
  next();
});

// CORS - Simple configuration to allow all origins
// Required because frontend (Firebase Hosting) and backend (Cloud Functions) are different domains
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

// Import route handlers
const transactionsRoutes = require("./routes/transactions");
const budgetInsightsRoutes = require("./routes/budget-insights");

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token format",
      });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.userId = decodedToken.uid;
      next();
    } catch (error) {
      if (error.code === "auth/id-token-expired") {
        return res.status(401).json({
          error: "Unauthorized: Token expired",
        });
      }
      if (error.code === "auth/id-token-revoked") {
        return res.status(401).json({
          error: "Unauthorized: Token revoked",
        });
      }
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
      });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({
      error: "Unauthorized: Invalid token",
    });
  }
};

// API Routes
app.use("/api/transactions", verifyToken, transactionsRoutes);
app.use("/api/budget-insights", verifyToken, budgetInsightsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
