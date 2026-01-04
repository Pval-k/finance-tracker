import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/verifyToken";

// Update a transaction
export async function PUT(request, { params }) {
  try {
    // Verify the Firebase token and get the user ID
    const { userId, error } = await verifyToken(request);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Get the transaction ID from the URL
    const { id } = await params;

    // Check if the ID is valid
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    // Get the updated data from the request
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

    // Update the transaction
    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId: userId },
      {
        $set: {
          title: title,
          amount: parseFloat(amount),
          category: category,
          type: type,
          date: date,
          updatedAt: new Date(),
        },
      }
    );

    // Check if the transaction was found
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" });
    }

    // Send back success message
    return NextResponse.json({
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// Delete a transaction
export async function DELETE(request, { params }) {
  try {
    // Verify the Firebase token and get the user ID
    const { userId, error } = await verifyToken(request);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Get the transaction ID from the URL
    const { id } = await params;

    // Check if the ID is valid
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("finance-tracker");
    const collection = db.collection("transactions");

    // Delete the transaction
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId: userId,
    });

    // Check if the transaction was found
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" });
    }

    // Send back success message
    return NextResponse.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
