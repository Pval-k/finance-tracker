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
// In Cloud Functions, this automatically uses the Firebase project context
// In local development, it uses default credentials or service account
try {
  admin.initializeApp();
  console.log(
    "Firebase Admin initialized for project:",
    admin.app().options.projectId || "default"
  );
} catch (error) {
  // App might already be initialized (e.g., in Cloud Functions environment)
  if (error.code !== "app/already-initialized") {
    console.error("Firebase Admin initialization error:", error);
    throw error;
  }
  console.log("Firebase Admin already initialized");
}

const app = express();

// Handle OPTIONS preflight requests FIRST, before any other middleware
// This must be at the very top to catch CORS preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Max-Age", "3600");
  res.sendStatus(204);
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    origin: req.headers.origin,
    hasAuthHeader: !!req.headers.authorization,
    authHeaderPrefix: req.headers.authorization?.substring(0, 20) || "none",
    "access-control-request-method":
      req.headers["access-control-request-method"],
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

// Log that routes are loaded
console.log("Routes loaded:", {
  transactionsRoutes: typeof transactionsRoutes,
  budgetInsightsRoutes: typeof budgetInsightsRoutes,
});

// Middleware to verify Firebase token
// Skip token verification for OPTIONS requests (CORS preflight)
const verifyToken = async (req, res, next) => {
  // Allow OPTIONS requests through without authentication (CORS preflight)
  if (req.method === "OPTIONS") {
    return next();
  }

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
      console.log("Token verified for user:", req.userId);
      next();
    } catch (error) {
      console.error("Token verification failed:", {
        code: error.code,
        message: error.message,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 30) + "..." : "null",
        firebaseProject: admin.app().options.projectId || "unknown",
      });

      if (error.code === "auth/id-token-expired") {
        return res.status(401).json({
          error: "Unauthorized: Token expired",
          code: error.code,
        });
      }
      if (error.code === "auth/id-token-revoked") {
        return res.status(401).json({
          error: "Unauthorized: Token revoked",
          code: error.code,
        });
      }
      if (error.code === "auth/argument-error") {
        return res.status(401).json({
          error: "Unauthorized: Invalid token format",
          code: error.code,
        });
      }
      if (error.code === "auth/project-not-found") {
        return res.status(401).json({
          error: "Unauthorized: Firebase project configuration error",
          code: error.code,
        });
      }
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
        code: error.code || "unknown",
        message: error.message,
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
// Note: Routes don't include "/api" prefix because the Cloud Function itself is named "api"
// Full path: https://...cloudfunctions.net/api/transactions

// Test route to verify routing works
app.get("/test", (req, res) => {
  res.json({ message: "Test route works", path: req.path });
});

app.use("/transactions", verifyToken, transactionsRoutes);
app.use("/budget-insights", verifyToken, budgetInsightsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
