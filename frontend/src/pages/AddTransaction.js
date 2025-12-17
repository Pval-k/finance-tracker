import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TransactionForm from "../components/forms/TransactionForm";
import "./AddTransaction.css";

const API_URL = "/api/transactions";

const AddTransaction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTransaction = location.state?.transaction;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    if (!formData) {
      navigate("/");
      return;
    }

    try {
      let response;
      if (editingTransaction) {
        // Update the existing transaction
        response = await fetch(`${API_URL}/${editingTransaction._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "test-user-id",
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create a new transaction
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "test-user-id",
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        navigate("/");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.error || "Failed to save transaction"}`);
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-transaction-page">
      <div className="add-transaction-container">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <TransactionForm
          onSubmit={handleSubmit}
          editingTransaction={editingTransaction}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default AddTransaction;
