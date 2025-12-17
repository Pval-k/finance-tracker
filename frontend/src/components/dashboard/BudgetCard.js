import React, { useState, useEffect, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import "./BudgetCard.css";

const BudgetCard = ({ transactions, budget, timeFilter, onBudgetUpdate }) => {
  const [localBudget, setLocalBudget] = useState(budget);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isEditing) {
      setLocalBudget(budget);
    }
  }, [budget, isEditing]);

  // Listen for hidden transactions updates
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey((prev) => prev + 1);
    };
    window.addEventListener("hiddenTransactionsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("hiddenTransactionsUpdated", handleUpdate);
    };
  }, []);

  // Force recalculation when refreshKey changes
  const totalExpenses = useMemo(() => {
    // Get hidden transactions from localStorage and filter them out
    const getHiddenTransactions = () => {
      const hidden = localStorage.getItem("hiddenTransactions");
      return hidden ? new Set(JSON.parse(hidden)) : new Set();
    };
    const hiddenTransactions = getHiddenTransactions();
    return transactions
      .filter((t) => t.type === "expense" && !hiddenTransactions.has(t._id))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, refreshKey]);

  // Use current budget for calculations (not the editing value)
  const budgetForCalculation =
    isEditing && localBudget === "" ? budget : localBudget;
  const remaining = budgetForCalculation - totalExpenses;
  const percentage =
    budgetForCalculation > 0 ? (totalExpenses / budgetForCalculation) * 100 : 0;

  const handleSaveBudget = () => {
    // Use the new budget if entered, otherwise keep the current budget
    const budgetToSave =
      localBudget === "" || localBudget === 0 ? budget : localBudget;
    if (onBudgetUpdate) {
      onBudgetUpdate(budgetToSave);
    } else {
      localStorage.setItem("budget", budgetToSave.toString());
    }
    setIsEditing(false);
  };

  return (
    <div className="budget-card">
      <div className="budget-header">
        <div className="budget-title-section">
          <DollarSign size={24} className="budget-icon" />
          <div>
            <h2 className="budget-title">Budget</h2>
            <span className="budget-period">
              {timeFilter === "day"
                ? "Today"
                : timeFilter === "month"
                ? "This Month"
                : "This Year"}
            </span>
          </div>
        </div>
        {!isEditing ? (
          <button
            className="edit-budget-button"
            onClick={() => {
              setLocalBudget("");
              setIsEditing(true);
            }}
          >
            Edit
          </button>
        ) : (
          <button className="save-budget-button" onClick={handleSaveBudget}>
            Save
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="budget-edit">
          <input
            type="number"
            value={localBudget === "" ? "" : localBudget}
            onChange={(e) => {
              const value = e.target.value;
              setLocalBudget(value === "" ? "" : parseFloat(value) || 0);
            }}
            placeholder={`$${budget.toFixed(2)}`}
            className="budget-input"
          />
        </div>
      ) : (
        <>
          <div className="budget-amount">${budget.toFixed(2)}</div>
          <div className="budget-stats">
            <div className="budget-stat">
              <span className="stat-label">Spent</span>
              <span className="stat-value expense">
                ${totalExpenses.toFixed(2)}
              </span>
            </div>
            <div className="budget-stat">
              <span className="stat-label">Remaining</span>
              <span
                className={`stat-value ${
                  remaining >= 0 ? "success" : "danger"
                }`}
              >
                {remaining >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                ${Math.abs(remaining).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="budget-progress">
            <div
              className="budget-progress-bar"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor:
                  percentage > 100 ? "var(--danger)" : "var(--accent)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetCard;
