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

// CORS configuration - must be before other middleware
// Allow all origins for Firebase Hosting (production) and localhost (development)
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests for all routes (CORS preflight)
app.options("*", cors(corsOptions));

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
