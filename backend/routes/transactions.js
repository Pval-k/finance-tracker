const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const clientPromise = require("../lib/mongodb");

// Get all transactions for a user
router.get("/", async (req, res) => {
  try {
    const userId = req.userId;

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
    return res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Create a new transaction
router.post("/", async (req, res) => {
  try {
    const userId = req.userId;

    // Get the data from the request
    const { title, amount, category, type, date } = req.body;

    // Check if all fields are provided
    if (!title || !amount || !category || !type || !date) {
      return res.status(400).json({ error: "Missing required fields" });
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
    return res.json({
      message: "Transaction created successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ error: "Failed to create transaction" });
  }
});

// Update a transaction
router.put("/:id", async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if the ID is valid
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    // Get the updated data from the request
    const { title, amount, category, type, date } = req.body;

    // Check if all fields are provided
    if (!title || !amount || !category || !type || !date) {
      return res.status(400).json({ error: "Missing required fields" });
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
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Send back success message
    return res.json({
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return res.status(500).json({ error: "Failed to update transaction" });
  }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if the ID is valid
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
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
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Send back success message
    return res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({ error: "Failed to delete transaction" });
  }
});

module.exports = router;

