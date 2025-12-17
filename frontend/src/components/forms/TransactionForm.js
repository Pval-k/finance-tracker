import React, { useState, useEffect } from "react";
import "./TransactionForm.css";

const CATEGORIES = [
  "Food",
  "Rent",
  "Transport",
  "Entertainment",
  "Shopping",
  "Bills",
  "Salary",
  "Other",
];

const TransactionForm = ({
  onSubmit,
  editingTransaction,
  isSubmitting = false,
}) => {
  const isEditing = !!editingTransaction;
  const isCustomCategory =
    editingTransaction && !CATEGORIES.includes(editingTransaction.category);

  // Get last used category from localStorage
  const getLastUsedCategory = () => {
    const lastCategory = localStorage.getItem("lastUsedCategory");
    if (lastCategory && CATEGORIES.includes(lastCategory)) {
      return lastCategory;
    }
    return ""; // Return empty string to show "Select a category"
  };

  const [formData, setFormData] = useState({
    title: editingTransaction?.title || "",
    amount: editingTransaction?.amount || "",
    category: isCustomCategory
      ? "Other"
      : editingTransaction?.category || getLastUsedCategory(),
    customCategory: isCustomCategory ? editingTransaction?.category || "" : "",
    type: editingTransaction?.type || "expense",
    date: editingTransaction?.date || new Date().toISOString().split("T")[0],
  });

  const [showCustomCategory, setShowCustomCategory] =
    useState(isCustomCategory);

  useEffect(() => {
    if (editingTransaction) {
      const isCustom = !CATEGORIES.includes(editingTransaction.category);
      setFormData({
        title: editingTransaction.title || "",
        amount: editingTransaction.amount || "",
        category: isCustom
          ? "Other"
          : editingTransaction.category || getLastUsedCategory(),
        customCategory: isCustom ? editingTransaction.category || "" : "",
        type: editingTransaction.type || "expense",
        date: editingTransaction.date || new Date().toISOString().split("T")[0],
      });
      setShowCustomCategory(isCustom);
    } else {
      setFormData({
        title: "",
        amount: "",
        category: getLastUsedCategory(),
        customCategory: "",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
      });
      setShowCustomCategory(false);
    }
  }, [editingTransaction]);

  const handleAmountBlur = (e) => {
    const value = e.target.value;
    if (value && !isNaN(value)) {
      // Format to 2 decimal places
      const numValue = parseFloat(value);
      const formattedValue = numValue.toFixed(2);
      setFormData((prev) => ({ ...prev, amount: formattedValue }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Capitalize first letter of transaction name
    const processedValue =
      name === "title" && value
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    if (name === "category") {
      setShowCustomCategory(value === "Other");
      if (value !== "Other") {
        setFormData((prev) => ({ ...prev, customCategory: "" }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const category =
      formData.category === "Other"
        ? formData.customCategory
        : formData.category;

    if (!formData.title || !formData.amount || !category || !formData.date) {
      alert("Please fill in all fields");
      return;
    }

    // Save the category to localStorage for future use (only if it's not a custom category and is in the list)
    if (!formData.customCategory && CATEGORIES.includes(category)) {
      localStorage.setItem("lastUsedCategory", category);
    }

    onSubmit({
      ...formData,
      category,
      amount: parseFloat(formData.amount),
    });

    // Reset the form if we're adding a new transaction (not editing)
    if (!editingTransaction) {
      setFormData({
        title: "",
        amount: "",
        category: getLastUsedCategory(),
        customCategory: "",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
      });
      setShowCustomCategory(false);
    }
  };

  return (
    <div className="transaction-form-container">
      <h2 className="form-title">
        {isEditing ? "Edit Transaction" : "Add Transaction"}
      </h2>
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Name</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Transaction name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              onBlur={handleAmountBlur}
              placeholder="$0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {showCustomCategory && (
            <div className="form-group">
              <label htmlFor="customCategory">Custom Category</label>
              <input
                type="text"
                id="customCategory"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                placeholder="Enter custom category"
                required={showCustomCategory}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Transaction"
              : "Add Transaction"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setFormData({
                  title: "",
                  amount: "",
                  category: getLastUsedCategory(),
                  customCategory: "",
                  type: "expense",
                  date: new Date().toISOString().split("T")[0],
                });
                setShowCustomCategory(false);
                onSubmit(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
