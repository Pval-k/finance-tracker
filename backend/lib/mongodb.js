const { MongoClient } = require("mongodb");
const functions = require("firebase-functions");

// Get the MongoDB connection string from environment variables
const uri = functions.config().mongodb?.uri || process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please configure MONGODB_URI in Firebase Functions config");
}

// Create a new MongoDB client and connect to the database
const client = new MongoClient(uri);
const clientPromise = client.connect();

module.exports = clientPromise;

