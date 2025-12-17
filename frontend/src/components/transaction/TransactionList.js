import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, EyeOff, Eye } from "lucide-react";
import TransactionItem from "./TransactionItem";
import "./TransactionList.css";

const TransactionList = ({
  transactions,
  onEdit,
  onDelete,
  loading,
  onDeleteAll,
}) => {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const menuRef = useRef(null);

  // Load hidden transactions from localStorage
  const getHiddenTransactions = () => {
    const hidden = localStorage.getItem("hiddenTransactions");
    return hidden ? new Set(JSON.parse(hidden)) : new Set();
  };

  const [hiddenTransactions, setHiddenTransactions] = useState(
    getHiddenTransactions()
  );
  const [showHidden, setShowHidden] = useState(true); // Toggle to show/hide hidden transactions

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowEditMenu(false);
      }
    };

    if (showEditMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEditMenu]);
  if (loading) {
    return (
      <div className="transaction-list-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-container">
        <h2 className="list-title">Transactions</h2>
        <div className="transaction-list-empty">
          <p>No transactions found for this period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      <div className="list-header">
        <h2 className="list-title">Transactions</h2>
        {onDeleteAll && transactions.length > 0 && (
          <div className="edit-menu-container" ref={menuRef}>
            <button
              className="edit-menu-button"
              onClick={() => setShowEditMenu(!showEditMenu)}
              aria-label="Edit options"
            >
              <MoreVertical size={18} />
            </button>
            {showEditMenu && (
              <div className="edit-menu-dropdown">
                <button
                  className="edit-menu-item"
                  onClick={() => {
                    setShowEditMenu(false);
                    setShowHidden(!showHidden);
                  }}
                >
                  {showHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showHidden ? "Do Not Show All" : "Show All"}</span>
                </button>
                <button
                  className="edit-menu-item"
                  onClick={() => {
                    setShowEditMenu(false);
                    setIsSelectionMode(true);
                    // Pre-select currently hidden transactions
                    setSelectedTransactions(new Set(hiddenTransactions));
                  }}
                >
                  <EyeOff size={16} />
                  <span>Hide from Chart</span>
                </button>
                <button
                  className="edit-menu-item delete-item"
                  onClick={() => {
                    setShowEditMenu(false);
                    onDeleteAll();
                  }}
                >
                  <Trash2 size={16} />
                  <span>Delete All in Period</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {isSelectionMode && (
        <div className="selection-mode-header">
          <span className="selection-mode-text">
            Select transactions to hide from category breakdown
          </span>
          <div className="selection-mode-actions">
            <button
              className="cancel-selection-button"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedTransactions(new Set());
              }}
            >
              Cancel
            </button>
            <button
              className="save-selection-button"
              onClick={() => {
                // Save hidden transactions to localStorage
                const hiddenArray = Array.from(selectedTransactions);
                localStorage.setItem(
                  "hiddenTransactions",
                  JSON.stringify(hiddenArray)
                );
                setHiddenTransactions(new Set(hiddenArray));
                setIsSelectionMode(false);
                setSelectedTransactions(new Set());
                // Trigger a refresh by dispatching a custom event
                window.dispatchEvent(new Event("hiddenTransactionsUpdated"));
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
      <div className="transaction-list">
        {[...transactions]
          .filter((transaction) => {
            // Filter based on toggle: if showHidden is false, hide hidden transactions
            if (!showHidden && hiddenTransactions.has(transaction._id)) {
              return false;
            }
            return true;
          })
          .sort((a, b) => {
            const aHidden = hiddenTransactions.has(a._id);
            const bHidden = hiddenTransactions.has(b._id);
            // If one is hidden and the other isn't, hidden goes to bottom
            if (aHidden && !bHidden) return 1;
            if (!aHidden && bHidden) return -1;
            // If both have same hidden status, maintain original order (by date)
            return 0;
          })
          .map((transaction) => (
            <TransactionItem
              key={transaction._id}
              transaction={transaction}
              onEdit={onEdit}
              onDelete={onDelete}
              isSelectionMode={isSelectionMode}
              isSelected={selectedTransactions.has(transaction._id)}
              isHidden={hiddenTransactions.has(transaction._id)}
              onToggleSelect={(id) => {
                const newSelected = new Set(selectedTransactions);
                if (newSelected.has(id)) {
                  newSelected.delete(id);
                } else {
                  newSelected.add(id);
                }
                setSelectedTransactions(newSelected);
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default TransactionList;
