import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/verifyToken";

// Get all transactions for a user
export async function GET(request) {
  try {
    // Verify the Firebase token and get the user ID
    const { userId, error } = await verifyToken(request);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

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
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// Create a new transaction
export async function POST(request) {
  try {
    // Verify the Firebase token and get the user ID
    const { userId, error } = await verifyToken(request);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Get the data from the request
    const body = await request.json();
    const { title, amount, category, type, date } = body;

    // Check if all fields are provided
    if (!title || !amount || !category || !type || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("finance-tracker");
    const collection = db.collection("transactions");

    // Save the new transaction
    const result = await collection.insertOne({
      userId: userId,
      title: title,
      amount: parseFloat(amount),
      category: category,
      type: type,
      date: date,
      createdAt: new Date(),
    });

    // Send back success message with the new transaction ID
    return NextResponse.json({
      message: "Transaction created successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
