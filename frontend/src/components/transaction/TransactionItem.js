import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import "./TransactionItem.css";

const TransactionItem = ({
  transaction,
  onEdit,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  isHidden = false,
  onToggleSelect,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Capitalize first letter of transaction title
  const capitalizedTitle = transaction.title
    ? transaction.title.charAt(0).toUpperCase() + transaction.title.slice(1)
    : transaction.title;

  return (
    <div
      className={`transaction-item ${isSelected ? "selected" : ""} ${
        isHidden ? "hidden" : ""
      } ${isSelectionMode ? "selectable" : ""}`}
      onClick={() => {
        if (isSelectionMode && onToggleSelect) {
          onToggleSelect(transaction._id);
        }
      }}
    >
      <div className="transaction-main">
        <div className="transaction-info">
          <h3 className="transaction-title">{capitalizedTitle}</h3>
          <div className="transaction-meta">
            <span className="transaction-category">{transaction.category}</span>
            <span className="transaction-date">
              {formatDate(transaction.date)}
            </span>
          </div>
        </div>
        <div className="transaction-amount-wrapper">
          <span
            className={`transaction-amount ${
              transaction.type === "income" ? "income" : "expense"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}$
            {transaction.amount.toFixed(2)}
          </span>
        </div>
      </div>
      {!isSelectionMode && (
        <div className="transaction-actions">
          <button
            className="action-button edit-button"
            onClick={() => onEdit(transaction)}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="action-button delete-button"
            onClick={() => onDelete(transaction._id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionItem;
