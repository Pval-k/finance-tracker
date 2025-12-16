import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Get all transactions for a user
export async function GET(request) {
  try {
    // Get userId from request (will use Firebase token later)
    const userId = request.headers.get("x-user-id") || "test-user-id";

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("finance-tracker");
    const collection = db.collection("transactions");

    // Get all transactions for this user, sorted by date (newest first)
    const transactions = await collection
      .find({ userId: userId })
      .sort({ date: -1 })
      .toArray();

    // Send back the transactions
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" });
  }
}
