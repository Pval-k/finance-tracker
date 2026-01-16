const { MongoClient } = require("mongodb");
const functions = require("firebase-functions");

// Lazy load MongoDB connection to avoid errors during module initialization
let clientPromise = null;

function getMongoClient() {
  if (clientPromise) {
    return clientPromise;
  }

  // Load environment variables if in development
  if (process.env.NODE_ENV !== "production" && !process.env.MONGODB_URI) {
    try {
      const path = require("path");
      require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
    } catch (e) {
      // .env.local might not exist or have issues, that's okay
      console.warn("Could not load .env.local:", e.message);
    }
  }

  // Get the MongoDB connection string from environment variables
  const uri = functions.config().mongodb?.uri || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please configure MONGODB_URI in Firebase Functions config or .env.local file");
  }

  // Create a new MongoDB client and connect to the database
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  
  return clientPromise;
}

module.exports = getMongoClient();

