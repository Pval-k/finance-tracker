import { MongoClient } from "mongodb";

// Get the MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

// Check if the connection string exists
if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

// Create a new MongoDB client and connect to the database
const client = new MongoClient(uri);
const clientPromise = client.connect();

export default clientPromise;
